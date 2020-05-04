// Global modules
import chalk from "chalk";

export const defaults = {
  threshold: 0.0175,
  thresholdMultiplier: 1.125,
  start: 75,
  fail: false,
  keepWebp: true,
  quiet: false,
  verbose: false
};

export const jpegRegex = /\.jpe?g$/i;

export const webpRegex = /\.webp$/i;

export const to = (promise, quiet) => promise.then(data => [true, data]).catch(error => {
  if (!quiet) {
    console.error(chalk.red.bold(error));
  }

  return [false, error];
});

export const roundTo = (n, precision) => Number(n.toFixed(precision));

export const getQualityInterval = (score, threshold) => Math.round(Math.abs(Math.log(Math.abs(score - threshold))));
