import chalk from "chalk";

export const jpegRegex = /\.jpe?g$/i;
export const pngRegex = /\.png$/i;
export const webpRegex = /\.webp$/i;
export const to = (promise, quiet) => {
  return promise.then(data => [true, data]).catch(error => {
    if (quiet === false) {
      console.error(chalk.red.bold(error));
    }

    return [false, error];
  });
};
