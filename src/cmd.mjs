// Global modules
import minimist from "minimist";
import chalk from "chalk";

// App modules
import { defaults } from "./lib/utils";
import helpText from "./lib/help-text";
import webpRecompress from "./webp-recompress";

(async function() {
  const argv = minimist(process.argv.slice(2));

  if (typeof argv.i === "undefined") {
    console.log(helpText);

    return;
  }

  const input = argv.i;
  const threshold = +argv.t || defaults.threshold;
  const thresholdMultiplier = +argv.m || defaults.thresholdMultiplier;
  const start = +argv.s || defaults.start;
  const quiet = argv.q || defaults.quiet;
  const verbose = argv.v || defaults.verbose;
  const [state, message] = await webpRecompress(input, threshold, thresholdMultiplier, start, quiet, verbose);

  if (!state && !quiet) {
    console.error(chalk.red.bold(message));

    return;
  }

  console.log(chalk.green.bold(message));
})();
