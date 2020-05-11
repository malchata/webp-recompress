// Global modules
import fs from "fs";
import util from "util";

// App modules
import { to, logResult } from "./utils.mjs";
import encodeWebp from "./encode-webp.mjs";
import decodeWebp from "./decode-webp.mjs";
import ssimulacra from "./ssimulacra.mjs";

// Promisified methods
const statAsync = util.promisify(fs.stat);

export default async function (input, inputSize, { outputWebp, webpPng }, quality, quiet, trials) {
  let state, data, score, size;

  if (quality in trials) {
    score = trials[quality].score;
    size = trials[quality].size;
  } else {
    // Encode WebP for this run
    [state, data] = await to(encodeWebp(input, outputWebp, quality));

    if (!state) {
      return [false, data];
    }

    // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
    [state, data] = await to(decodeWebp(outputWebp, webpPng));

    if (!state) {
      return [false, data];
    }

    // Get the SSIMULACRA score for this iteration
    [state, data] = await to(ssimulacra(input, webpPng));

    if (!state) {
      return [false, data];
    }

    score = parseFloat(data.stdout);

    // Get the size of this iteration's WebP outputWebp file
    [state, data] = await to(statAsync(outputWebp));
    size = data.size;

    if (!state) {
      return [false, data];
    }

    logResult(quality, score, size, inputSize, quiet);
  }

  return [true, data, score, size];
}
