// Global modules
import path from "path";
import fs from "fs";
import util from "util";
import chalk from "chalk";
import hasha from "hasha";

// App modules
import { defaults, jpegRegex, losslessRegex, to } from "./lib/utils";
import convert from "./lib/convert";
import identify from "./lib/identify";
import cleanUp from "./lib/clean-up";
import trial from "./lib/trial";

// Promisified methods
const statAsync = util.promisify(fs.stat);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

export default async function(input, threshold = defaults.threshold, thresholdWindow = defaults.thresholdWindow, start = defaults.start, fail = defaults.fail, keepWebp = defaults.keepWebp, verbose = defaults.verbose, quiet = defaults.quiet, cache = defaults.cache, cacheFile = defaults.cacheFile) {
  if (start > 100 || start < 0) {
    if (verbose && !quiet) {
      console.error(chalk.red.bold("Starting quality should be between 0 and 100."));
    }

    return false;
  }

  if (threshold > 1 || threshold < 0) {
    if (verbose && !quiet) {
      console.error(chalk.red.bold("Threshold must be between 0 and 1."));
    }

    return false;
  }

  if ((threshold + thresholdWindow) > 1 || (threshold - thresholdWindow) < 0) {
    if (verbose && !quiet) {
      console.error(chalk.red.bold("The specified threshold range must be between 0 and 1."));
    }

    return false;
  }

  // These are used regardless of the optimization strategy
  const min = threshold - thresholdWindow;
  const max = threshold + thresholdWindow;
  let state, data, inputSize, size, quality, score, cacheEntries, inputHash;
  let floor = 0;
  let ceil = 100;
  let files = {};
  let trials = {};

  if (cache) {
    try {
      [state, data] = await to(readFileAsync(path.resolve(cacheFile)), quiet);
      cacheEntries = JSON.parse(data.toString());
    } catch (err) {
      cacheEntries = {};

      if (verbose && !quiet) {
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

  /**
    Strategy: Recompress
    This strategy is chosen if the input is a JPEG. webp-equiv will then try to
    find a WebP that"s smallest, yet within the specificied SSIMULACRA threshold.
   **/
  if (jpegRegex.test(input)) {
    files["refPng"] = path.join(process.cwd(), input.replace(jpegRegex, ".png"));
    files["outputWebp"] = path.join(process.cwd(), input.replace(jpegRegex, ".webp"));
    files["webpPng"] = path.join(process.cwd(), input.replace(jpegRegex, "-webp.png"));

    // Try to automatically determine JPEG quality
    [state, quality] = await to(identify(input), quiet);

    if (!state) {
      quality = start;

      if (verbose && !quiet) {
        console.log(`Couldn"t guess JPEG quality. Starting at q${quality}`);
      }
    } else {
      quality = Number(quality);

      if (verbose && !quiet) {
        console.log(`Guessed JPEG quality at q${quality}`);
      }
    }

    // Create PNG reference from provided JPEG
    [state, data] = await to(convert(input, files.refPng), quiet);

    if (!state) {
      return false;
    }
  } else if (losslessRegex.test(input)) {
    /**
      Strategy: Reference
      This strategy is chosen if the input is a PNG. webp-equiv will require a
      target value in this case to find a lossy WebP that is beneath the
      specified SSIMULACRA threshold.
     **/

    files["refPng"] = path.join(process.cwd(), input);
    files["outputWebp"] = path.join(process.cwd(), input.replace(losslessRegex, ".webp"));
    files["webpPng"] = path.join(process.cwd(), input.replace(losslessRegex, "-webp.png"));
    quality = start;

    if (verbose && !quiet) {
      console.log(`Starting at q${quality}`);
    }
  }

  // Check if this image already has a cache entry
  if (cache) {
    inputHash = await hasha.fromFile(input, {
      algorithm: "sha256"
    });

    if (inputHash in cacheEntries) {
      let cacheEntry = cacheEntries[inputHash];

      if (typeof cacheEntry[`${threshold}|${thresholdWindow}`] === "number") {
        if (verbose && !quiet) {
          console.log(chalk.green.bold("Cache hit!"));
        }

        quality = cacheEntry[`${threshold}|${thresholdWindow}`];

        [state, data, score, size] = await trial(input, inputSize, files.outputWebp, files.refPng, files.webpPng, quality, quiet, min, max);

        if (!state) {
          if (!quiet) {
            console.error(chalk.red.bold("Couldn't run image trial!"));
          }

          return false;
        }

        console.log(chalk.bold.green(`Best variant found: q${quality}`));
        cleanUp(files, input, keepWebp, verbose);
      } else {
        if (verbose && !quiet) {
          console.warn(chalk.green.yellow("Cache miss!"));
        }
      }
    }
  }

  do {
    // Check if this quality setting has already been tried.
    if (quality in trials) {
      if (score > max) {
        quality++;
      } else if (score < min) {
        quality--;
      }

      continue;
    }

    [state, data, score, size] = await trial(input, inputSize, files.outputWebp, files.refPng, files.webpPng, quality, quiet, min, max);

    if (!state) {
      if (!quiet) {
        console.error(chalk.red.bold("Couldn't run image trial!"));
      }

      return false;
    }

    // Record the attempt
    trials[quality] = {
      score: score,
      size: size
    };

    // Image is too distorted
    if (score > max) {
      floor = quality;
      quality = Math.round(floor + ((ceil - floor) / 2));
    }

    // Image is too high quality
    if (score < min) {
      ceil = quality;
      quality = Math.round(floor + ((ceil - floor) / 2));
    }
  } while (score > max || score < min);

  if (size < inputSize) {
    if (cache) {
      cacheEntries[inputHash] = {};
      cacheEntries[inputHash][`${threshold}|${thresholdWindow}`] = quality;
      [state, data] = await to(writeFileAsync(path.resolve(__dirname, cacheFile), JSON.stringify(cacheEntries)), quiet);

      if (state) {
        console.dir(data);
      }
    }

    console.log(chalk.bold.green(`Best variant found: q${quality}`));
    cleanUp(files, input, keepWebp, verbose);
  } else if (size >= inputSize && fail) {
    console.error(chalk.red.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of input."));
    cleanUp(files, input, keepWebp, verbose);
  } else if (size >= inputSize && !fail) {
    if (verbose && !quiet) {
      console.warn(chalk.yellow.bold("Couldn't generate a smaller WebP with the approximate equivalent equality of input. Finding the next smallest WebP."));
    }

    // Should we go for broke?
    while (size >= inputSize) {
      // We should check to see if we've done an encoding at this quality level.
      if (quality in trials) {
        if (trials[quality].size >= inputSize) {
          quality--;
          continue;
        }
      }

      [state, data, score, size] = await trial(input, inputSize, files.outputWebp, files.refPng, files.webpPng, quality, quiet, min, max);

      if (!state) {
        return false;
      }

      quality--;
    }

    console.log(chalk.bold.green(`Best variant found: q${quality}`));
    cleanUp(files, input, keepWebp, verbose);
  }
}
