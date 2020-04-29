import chalk from "chalk";

export const defaults = {
  threshold: 0.02,
  thresholdWindow: 0.000625,
  thresholdMultiplier: 1.5,
  start: 75,
  fail: false,
  keepWebp: false,
  quiet: false,
  verbose: false,
  cache: false,
  cacheFilename: "./webpcache.json"
};

export const jpegRegex = /\.jpe?g$/i;

export const webpRegex = /\.webp$/i;

export const to = (promise, quiet) => promise.then(data => [true, data]).catch(error => {
  if (!quiet) {
    console.error(chalk.red.bold(error));
  }

  return [false, error];
});

export const buildCacheSignature = (threshold, thresholdWindow) => `${threshold}|${thresholdWindow}`;
