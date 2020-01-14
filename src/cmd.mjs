import minimist from "minimist";
import { defaults } from "./lib/utils";
import helpText from "./lib/help-text";
import webpRecompress from "./webp-recompress";

const argv = minimist(process.argv.slice(2));

if (typeof argv.i === "undefined") {
  console.log(helpText);
} else {
  let input = argv.i;
  let threshold = argv.t || defaults.threshold;
  let thresholdWindow = argv.w || defaults.thresholdWindow;
  let start = argv.s || defaults.start;
  let fail = argv.f || defaults.fail;
  let keepWebp = argv.k || defaults.keepWebp;
  let verbose = argv.v || defaults.verbose;
  let quiet = argv.q || defaults.quiet;
  let cache = argv.c || defaults.cache;
  let cacheFilename = argv.cf || defaults.cacheFilename;

  webpRecompress(input, threshold, thresholdWindow, start, fail, keepWebp, verbose, quiet, cache, cacheFilename);
}
