// Global modules
import fs from "fs";
import util from "util";

// App modules
import { to } from "./utils.mjs";
import encodeWebp from "./encode-webp.mjs";
import decodeWebp from "./decode-webp.mjs";
import ssimulacra from "./ssimulacra.mjs";
import logResult from "./log-result.mjs";

// Promisified methods
const statAsync = util.promisify(fs.stat);

export default async function (input, inputSize, files, quality, quiet, min, max, trials) {
  let state, data, score, size;

  if (quality in trials) {
    score = trials[quality].score;
    size = trials[quality].size;
  } else {
    // Encode WebP for this run
    [state, data] = await to(encodeWebp(input, files.outputWebp, quality), quiet);

    if (!state) {
      return false;
    }

    // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
    [state, data] = await to(decodeWebp(files.outputWebp, files.webpPng), quiet);

    if (!state) {
      return false;
    }

    // Get the SSIMULACRA score for this iteration
    [state, data] = await to(ssimulacra(input, files.webpPng), quiet);

    if (!state) {
      return false;
    }

    score = parseFloat(data.stdout);

    // Get the size of this iteration's WebP outputWebp file
    [state, data] = await to(statAsync(files.outputWebp), quiet);
    size = data.size;

    if (!state) {
      return false;
    }

    if (!quiet) {
      logResult(quality, score, size, inputSize, min, max);
    }
  }

  return [true, data, score, size, size < inputSize];
}
