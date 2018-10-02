// Global modules
import path from "path";
import fs from "fs";
import util from "util";
import chalk from "chalk";

// App modules
import { jpegRegex, pngRegex, to } from "./lib/utils";
import convert from "./lib/convert";
import identify from "./lib/identify";
import cleanUp from "./lib/clean-up";
import trial from "./lib/trial";

// Promisified methods
const statAsync = util.promisify(fs.stat);

export default async function(input, threshold = 0.015, window = 0.0025, start = 50, fail = false, keepWebp = true, verbose = true, quiet = false) {
  // These are used regardless of the optimization strategy
  const min = threshold - (window / 2);
  const max = threshold + (window / 2);
  let state;
  let data;
  let inputSize;
  let size;
  let q;
  let up = true;
  let trials = {};
  let score;
  let smaller;
  let files = {
    outputWebp: path.join(process.cwd(), input.replace(jpegRegex, ".webp")),
    webpPng: path.join(process.cwd(), input.replace(jpegRegex, "-webp.png"))
  };

  // Get the size of input file (we'll need it later)
  [state, data] = await to(statAsync(input), quiet);
  if (state === false) return false;

  inputSize = data.size;

  /**
    Strategy: Recompress
    This strategy is chosen if the input is a JPEG. webp-equiv will then try to
    find a WebP that's smallest, yet within the specificied SSIMULACRA threshold.
   **/
  if (jpegRegex.test(input) === true) {
    files.refPng = path.join(process.cwd(), input.replace(jpegRegex, ".png"));

    // Try to determine quality of JPEG automatically
    [state, q] = await to(identify(input), quiet);
    if (state === false) {
      q = start;

      if (verbose === true && quiet === false) {
        console.log(`Couldn't guess JPEG quality. Starting at q${q}`);
      }
    } else {
      if (verbose === true && quiet === false) {
        console.log(`Guessed JPEG quality at q${q}`);
      }
    }

    // Create PNG reference from provided JPEG
    [state, data] = await to(convert(input, files.refPng), quiet);
    if (state === false) return false;

    let low = q / 2;
    let high = 100 - Math.round((100 - q) / 2);
    let mid = ((high - low) / 2) + low;
    q = Math.round(mid);

    // It's showtime
    do {
      if (q in trials) {
        up === true ? q++ : q--;
        continue;
      }

      [state, data, score, size, smaller] = await trial(input, inputSize, files.outputWebp, files.refPng, files.webpPng, q, quiet, min, max);
      if (state === false) return false;

      trials[q] = {
        score: score,
        size: size,
        smaller: smaller
      };

      if (q === 100 && (score > max || smaller === false)) {
        break;
      }

      if (score > max) {
        up = true;
        low = q;
      } else if (score < min) {
        up = false;
        high = q;
      }

      mid = ((high - low) / 2) + low;

      q = up === true ? Math.round(high - ((high - mid) / 2)) : Math.round(low + ((mid - low) / 2));
    } while (score > max || score < min);

    if (smaller === true) {
      console.log(chalk.bold.green("Best variant found!"));
      cleanUp(files, keepWebp, verbose);
    } else if (smaller === false && fail === true) {
      console.error(chalk.red.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of input."));
      cleanUp(files, keepWebp, verbose);
    } else if (smaller === false && fail === false) {
      if (verbose === true && quiet === false) {
        console.warn(chalk.yellow.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of input. Finding the next smallest WebP."));
      }

      q = low;

      while (smaller === false) {
        if (q in trials) {
          smaller = trials[q].smaller;

          if (smaller === false) {
            q--;
            continue;
          }
        }

        [state, data, score, size, smaller] = await trial(input, inputSize, files.outputWebp, files.refPng, files.webpPng, q, quiet, min, max);
        if (state === false) return false;

        q--;
      }

      console.log(chalk.bold.green("Best variant found!"));
      cleanUp(files, keepWebp, verbose);
    }
  } else if (pngRegex.test(input) === true) {
    // TODO: Lossless strategy
  }
}
