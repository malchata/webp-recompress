import minimist from "minimist";
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
    let thresholdWindow = argv.w || defaults.thresholdWindow;
    let thresholdMultiplier = argv.m || defaults.thresholdMultiplier;
    let start = argv.s || defaults.start;
    let keepWebp = argv.k || defaults.keepWebp;
    let quiet = argv.q || defaults.quiet;
    let verbose = argv.v || defaults.verbose;
    let cache = argv.c || defaults.cache;
    let cacheFilename = argv.cf || defaults.cacheFilename;

    await webpRecompress(input, threshold, thresholdWindow, thresholdMultiplier, start, keepWebp, quiet, verbose, cache, cacheFilename);
  }
})();
