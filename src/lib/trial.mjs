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

export default async function (input, inputSize, { outputWebp, webpPng }, quality, quiet, trials) {
  let state, data, score, size;

  if (quality in trials) {
    score = trials[quality].score;
    size = trials[quality].size;
  } else {
    // Encode WebP for this run
    [state, data] = await to(encodeWebp(input, outputWebp, quality), quiet);

    if (!state) {
      return [false, data];
    }

    // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
    [state, data] = await to(decodeWebp(outputWebp, webpPng), quiet);

    if (!state) {
      return [false, data];
    }

    // Get the SSIMULACRA score for this iteration
    [state, data] = await to(ssimulacra(input, webpPng), quiet);

    if (!state) {
      return [false, data];
    }

    score = parseFloat(data.stdout);

    // Get the size of this iteration's WebP outputWebp file
    [state, data] = await to(statAsync(outputWebp), quiet);
    size = data.size;

    if (!state) {
      return [false, data];
    }

    if (!quiet) {
      logResult(quality, score, size, inputSize);
    }
  }

  return [true, data, score, size];
}
