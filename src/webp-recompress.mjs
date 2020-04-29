// Global modules
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import util from "util";
import chalk from "chalk";
import hasha from "hasha";

// App modules
import { defaults, jpegRegex, to, buildCacheSignature } from "./lib/utils.mjs";
import convert from "./lib/convert.mjs";
import identify from "./lib/identify.mjs";
import cleanUp from "./lib/clean-up.mjs";
import trial from "./lib/trial.mjs";

// Promisified methods
const statAsync = util.promisify(fs.stat);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const dirname = typeof __dirname === "undefined" ? fileURLToPath(import.meta.url.replace("/test.mjs", "")) : __dirname;

async function webpRecompress (input, threshold = defaults.threshold, thresholdWindow = defaults.thresholdWindow, thresholdMultiplier = defaults.thresholdMultiplier, start = defaults.start, keepWebp = defaults.keepWebp, quiet = defaults.quiet, verbose = defaults.verbose, cache = defaults.cache, cacheFilename = defaults.cacheFilename, prior = false, priorTrials) {
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

  // Initialize the threshold window, but clamp it to an acceptable range
  const min = (threshold - thresholdWindow) < 0 ? 0 : (threshold - thresholdWindow);
  const max = (threshold + thresholdWindow) > 1 ? 1 : (threshold + thresholdWindow);

  const cacheFilePath = path.resolve(dirname, cacheFilename);
  let state, data, inputSize, size, score, cacheEntries, inputHash, lastQuality;
  let quality = Number(start);
  let floor = 0;
  let ceil = 100;
  let files = {};
  let trials = priorTrials || {};

  // Check if we're using the cache
  if (cache) {
    try {
      // First try to read from the cache if it's available...
      [state, data] = await to(readFileAsync(cacheFilePath), quiet);
      cacheEntries = JSON.parse(data.toString());
    } catch (err) {
      // No cache? Create an empty object for now.
      cacheEntries = {};

      if (!quiet) {
        console.warn(chalk.bold.yellow("Cache not found. Creating from scratch..."));
      }
    }
  }

  // Get the size of input file (we'll need it later)
  [state, data] = await to(statAsync(input), quiet);

  if (!state) {
    return false;
  }

  inputSize = data.size;

  if (jpegRegex.test(input)) {
    files["refPng"] = path.resolve(process.cwd(), input.replace(jpegRegex, ".png"));
    files["outputWebp"] = path.resolve(process.cwd(), input.replace(jpegRegex, ".webp"));
    files["webpPng"] = path.resolve(process.cwd(), input.replace(jpegRegex, "-webp.png"));

    if (!prior) {
      // Try to determine JPEG quality
      [state, quality] = await to(identify(input), quiet);

      if (!state) {
        quality = start;

        if (!quiet) {
          console.log(`Couldn't guess JPEG quality. Starting at q${quality}`);
        }
      } else {
        quality = Number(quality);

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
  } else {
    return false;
  }

  // Check if this image already has a cache entry
  if (cache) {
    inputHash = await hasha.fromFile(input, {
      algorithm: "sha256"
    });

    if (inputHash in cacheEntries) {
      let cacheEntry = cacheEntries[inputHash];

      if (typeof cacheEntry[buildCacheSignature(threshold, thresholdWindow)] === "number") {
        if (!quiet) {
          console.log(chalk.green.bold("Cache hit!"));
        }

        quality = cacheEntry[buildCacheSignature(threshold, thresholdWindow)];

        [state, data, score, size] = await trial(input, inputSize, files, quality, quiet, min, max, trials);

        if (!state) {
          if (!quiet) {
            console.error(chalk.red.bold("Couldn't run image trial!"));
          }

          return false;
        }

        console.log(chalk.bold.green(`Best candidate found: q${quality}`));
        cleanUp(files, input, keepWebp);
      } else {
        if (!quiet) {
          console.warn(chalk.green.yellow("Cache miss!"));
        }
      }
    }
  }

  if (!quiet && verbose) {
    console.log(`Finding best candidate within threshold ${min}—${max}...`);
  }

  do {
    lastQuality = quality;

    [state, data, score, size] = await trial(input, inputSize, files, quality, quiet, min, max, trials);

    if (!state) {
      if (!quiet) {
        console.error(chalk.red.bold("Couldn't run image trial!"));
      }

      return false;
    }

    // Record the attempt
    trials[quality] = {
      score,
      size
    };

    // Image is too distorted
    if (score > max) {
      floor = quality > 100 ? 100 : quality;
    }

    // Image is too high quality
    if (score < min) {
      ceil = quality < 0 ? 0 : quality;
    }

    quality = Math.round(floor + ((ceil - floor) / 2));

    if (lastQuality === quality) {
      break;
    }
  } while (score > max || score < min);

  if (size < inputSize && score < max && score > min) {
    // If we're using the cache, let's write this result to it
    if (cache) {
      if (!(inputHash in cacheEntries)) {
        cacheEntries[inputHash] = {};
      }

      cacheEntries[inputHash][buildCacheSignature(threshold, thresholdWindow)] = quality;

      [state] = await to(writeFileAsync(cacheFilePath, JSON.stringify(cacheEntries)), quiet);

      if (!state) {
        console.warn(chalk.yellow.bold(`Couldn't write cache to ${cacheFilePath}`));
      }
    }

    if (!quiet) {
      console.log(chalk.bold.green(`Best candidate found: q${quality}`));
    }

    cleanUp(files, input, keepWebp);

    return true;
  } else {
    // Try again, but adjust the scoring window
    return await webpRecompress(input, threshold, (thresholdWindow * thresholdMultiplier), thresholdMultiplier, quality, keepWebp, quiet, verbose, cache, cacheFilename, true, trials);
  }
}

export default webpRecompress;
