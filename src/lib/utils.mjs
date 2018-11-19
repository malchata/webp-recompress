import chalk from "chalk";

export const defaults = {
  threshold: 0.02,
  thresholdWindow: 0.00125,
  start: 75,
  fail: false,
  keepWebp: false,
  verbose: false,
  quiet: false,
  nearLossless: false
};
export const jpegRegex = /\.jpe?g$/i;
export const losslessRegex = /\.(png|gif)$/i;
export const webpRegex = /\.webp$/i;
export const to = function (promise, quiet = false) {
  return promise.then(data => [true, data]).catch(error => {
    if (quiet === false) {
      console.error(chalk.red.bold(error));
    }

    return [false, error];
  });
};
