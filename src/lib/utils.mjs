// Global modules
import chalk from "chalk";

export const defaults = {
  threshold: 0.025,
  thresholdMultiplier: 1.5,
  start: 75,
  quiet: false,
  verbose: false
};

export const jpegRegex = /\.jpe?g$/i;

// export const pngRegex = /\.png$/i;

export const webpRegex = /\.webp$/i;

export const to = (promise, quiet) => promise.then(data => [true, data]).catch(error => {
  if (!quiet) {
    console.error(chalk.red.bold(error));
  }

  return [false, error];
});

export const roundTo = (n, p = 8) => Number(n.toFixed(p));

export const getQualityInterval = (score, threshold) => Math.round(Math.abs(Math.log(Math.abs(score - threshold))));

export const bToKb = (b, p = 2) => Number((b / 1024).toFixed(p));
