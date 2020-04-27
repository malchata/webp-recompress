import chalk from "chalk";

export const defaults = {
  threshold: 0.01,
  thresholdWindow: 0.00125,
  thresholdMultiplier: 2,
  start: 50,
  fail: false,
  keepWebp: false,
  quiet: false,
  cache: false,
  cacheFilename: "webpcache.json"
};

export const jpegRegex = /\.jpe?g$/i;

export const webpRegex = /\.webp$/i;

export const to = (promise, quiet) => promise.then(data => [true, data]).catch(error => {
  if (quiet === false) {
    console.error(chalk.red.bold(error));
  }

  return [false, error];
});

export const buildCacheSignature = (threshold, thresholdWindow) => `${threshold}|${thresholdWindow}`;
