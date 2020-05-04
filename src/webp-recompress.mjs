// Global modules
import path from "path";
import fs from "fs";
import util from "util";
import chalk from "chalk";

// App modules
import { defaults, jpegRegex, to, roundTo, getQualityInterval } from "./lib/utils.mjs";
import convert from "./lib/convert.mjs";
import identify from "./lib/identify.mjs";
import cleanUp from "./lib/clean-up.mjs";
import trial from "./lib/trial.mjs";

// Promisified methods
const statAsync = util.promisify(fs.stat);

async function webpRecompress (input, threshold = defaults.threshold, thresholdMultiplier = defaults.thresholdMultiplier, start = defaults.start, keepWebp = defaults.keepWebp, quiet = defaults.quiet, verbose = defaults.verbose, prior = false, priorTrials) {
  // Ensure the quality is within a reasonable range
  if (start > 100 || start < 0) {
    if (!quiet) {
      console.error(chalk.red.bold("Starting quality should be between 0 and 100."));
    }

    return false;
  }

  // Make sure the SSIMULACRA threshold is OK
  if (threshold > 1 || threshold < 0) {
    if (!quiet) {
      console.error(chalk.red.bold("Threshold must be between 0 and 1."));
    }

    return false;
  }

  let state, data, inputSize, size, score;
  let quality = Number(start);
  let trials = priorTrials || [];

  // Get the size of input file (we'll need it later)
  [state, data] = await to(statAsync(input), quiet);

  if (!state) {
    return false;
  }

  inputSize = data.size;

  if (!jpegRegex.test(input)) {
    return false;
  }

  const files = {
    refPng: path.resolve(process.cwd(), input.replace(jpegRegex, ".png")),
    outputWebp: path.resolve(process.cwd(), input.replace(jpegRegex, ".webp")),
    webpPng: path.resolve(process.cwd(), input.replace(jpegRegex, "-webp.png"))
  };

  if (!prior) {
    // Try to determine JPEG quality
    [state, quality] = await to(identify(input), quiet);

    if (!state) {
      quality = start;

      if (!quiet && verbose) {
        console.log(`Couldn't guess JPEG quality. Starting at q${quality}`);
      }
    } else {
      quality = Number(quality);
      start = Number(start);

      if (!quiet && verbose) {
        console.log(`Guessed JPEG quality at q${quality}`);
      }
    }
  }

  // Create PNG reference from provided JPEG
  [state, data] = await to(convert(input, files.refPng), quiet);

  // Couldn't create a PNG reference from the given JPEG, so that's a bust :(
  if (!state) {
    return false;
  }

  if (!quiet && verbose) {
    console.log(`Trying threshold: ${threshold}...`);
  }

  do {
    [state, data, score, size] = await trial(input, inputSize, files, quality, quiet, trials);

    // Record the attempt
    if (!(quality in trials)) {
      trials[quality] = {
        score,
        size
      };
    }

    const interval = getQualityInterval(score, threshold, quality);

    if (size >= inputSize) {
      quality -= interval;
      continue;
    }

    if (score <= threshold) {
      break;
    }

    quality += interval;
  } while (score > threshold);

  if (score <= threshold && size < inputSize) {
    if (!quiet) {
      console.log(chalk.bold.green(`Best candidate found: q${quality}`));
    }

    await cleanUp(files, input, keepWebp);

    return true;
  } else {
    // Try again after bumping up the threshold
    return await webpRecompress(input, roundTo(threshold * thresholdMultiplier, 8), thresholdMultiplier, quality, keepWebp, quiet, verbose, true, trials);
  }
}

export default webpRecompress;
