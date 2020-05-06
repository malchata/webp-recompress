// Global modules
import minimist from "minimist";

// App modules
import { defaults } from "./lib/utils";
import helpText from "./lib/help-text";
import webpRecompress from "./webp-recompress";

(async function() {
  const argv = minimist(process.argv.slice(2));

  if (typeof argv.i === "undefined") {
    console.log(helpText);
  } else {
    let input = argv.i;
    let threshold = argv.t || defaults.threshold;
    let thresholdMultiplier = argv.m || defaults.thresholdMultiplier;
    let start = argv.s || defaults.start;
    let quiet = argv.q || defaults.quiet;
    let verbose = argv.v || defaults.verbose;

    await webpRecompress(input, threshold, thresholdMultiplier, start, quiet, verbose);
  }
})();
