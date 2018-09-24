// Global modules
import path from "path";
import fs from "fs";
import util from "util";
import chalk from "chalk";

// App modules
import { jpegRegex, pngRegex, to } from "./lib/utils";
import convert from "./lib/convert";
import identify from "./lib/identify";
import encodeWebp from "./lib/encode-webp";
import decodeWebp from "./lib/decode-webp";
import ssimulacra from "./lib/ssimulacra";
import logResult from "./lib/log-result";
import cleanUp from "./lib/clean-up";

// Promisified methods
const statAsync = util.promisify(fs.stat);

export default async function(inputFile, threshold = 0.01, start = 50, nearLossless = false, fail = false, keepWebp = true, verbose = true, quiet = false) {
  // These are used regardless of the optimization strategy
  const min = threshold - (threshold * .1)
  const max = threshold + (threshold * .1)
  let state;
  let data;
  let inputSize;
  let size;
  let q;
  let trials = [];
  let up = true;
  let score;
  let smaller;
  let files = {
    outputWebp: path.join(process.cwd(), inputFile.replace(jpegRegex, ".webp")),
    webpPng: path.join(process.cwd(), inputFile.replace(jpegRegex, "-webp.png"))
  };

  // Get the size of the input file (we'll need it later)
  [state, data] = await to(statAsync(inputFile), quiet);
  if (state === false) {
    return false;
  } else {
    inputSize = data.size;
  }

  /**
    Strategy: Recompress
    This strategy is chosen if the input is a JPEG. webp-equiv will then try to
    find a WebP that's smallest, yet within the specificied SSIMULACRA threshold.
   **/
  if (jpegRegex.test(inputFile) === true) {
    files.refPng = path.join(process.cwd(), inputFile.replace(jpegRegex, ".png"));

    // Try to determine quality of JPEG automatically
    [state, q] = await to(identify(inputFile), quiet);
    if (state === false) q = start;

    // Create PNG reference from provided JPEG
    [state, data] = await to(convert(inputFile, files.refPng), quiet);
    if (state === false) return false;

    let low = q / 2;
    let high = 100 - Math.round((100 - q) / 2);

    // It's showtime
    do {
      // Encode WebP for this run
      [state, data] = await to(encodeWebp(inputFile, files.outputWebp, q, nearLossless), quiet);
      if (state === false) return false;

      // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
      [state, data] = await to(decodeWebp(files.outputWebp, files.webpPng), quiet);
      if (state === false) return false;

      // Get the SSIMULACRA score for this iteration
      [state, data] = await to(ssimulacra(q, inputFile, files.outputWebp, files.refPng, files.webpPng));
      if (state === false) {
        return false;
      } else {
        score = parseFloat(data.stdout);
      }

      // Get the size of this iteration's WebP output file
      [state, data] = await to(statAsync(files.outputWebp), quiet);
      if (state === false) {
        return false;
      } else {
        size = data.size;
        smaller = size < inputSize;
        logResult(q, score, size, inputSize);
      }

      if (smaller === true) {
        up = true;
        low++;
      } else {
        up = false;
        high--;
      }

      q = up === false ? high - Math.ceil(((100 - high) / 2) / 2) : low + Math.floor(low / 2);
    } while (score > max || score < min);

    if (smaller === false && fail === true) {
      console.error(chalk.red.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of the input."));
      cleanUp(files, keepWebp, verbose);
      return false;
    } else if (smaller === false && fail === false) {
      if (verbose === true && quiet === false) {
        console.warn(chalk.yellow.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of the input. Finding the next smallest WebP."));
      }

      while (smaller === false) {
        // Encode WebP for this run
        [state, data] = await to(encodeWebp(inputFile, files.outputWebp, q, nearLossless), quiet);
        if (state === false) return false;

        // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
        [state, data] = await to(decodeWebp(files.outputWebp, files.webpPng), quiet);
        if (state === false) return false;

        // Get the SSIMULACRA score for this iteration
        [state, data] = await to(ssimulacra(q, inputFile, files.outputWebp, files.refPng, files.webpPng));
        if (state === false) {
          return false;
        } else {
          score = parseFloat(data.stdout);
        }

        // Get the size of this iteration's WebP output file
        [state, data] = await to(statAsync(files.outputWebp), quiet);
        if (state === false) {
          return false;
        } else {
          size = data.size;
          smaller = size < inputSize;
          logResult(q, score, size, inputSize);
        }

        q--;
      }
    }
  } else if (pngRegex.test(inputFile) === true) {
    // TODO: Lossless strategy
  }
}
