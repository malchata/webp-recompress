import fs from "fs";
import util from "util";
import { to } from "./utils.mjs";
import encodeWebp from "./encode-webp.mjs";
import decodeWebp from "./decode-webp.mjs";
import ssimulacra from "./ssimulacra.mjs";
import logResult from "./log-result.mjs";

const statAsync = util.promisify(fs.stat);

export default async function (input, inputSize, outputWebp, refPng, webpPng, quality, quiet, min, max) {
  let state, data;

  // Encode WebP for this run
  [state, data] = await to(encodeWebp(input, outputWebp, quality), quiet);

  if (!state) {
    return false;
  }

  // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
  [state, data] = await to(decodeWebp(outputWebp, webpPng), quiet);

  if (!state) {
    return false;
  }

  // Get the SSIMULACRA score for this iteration
  [state, data] = await to(ssimulacra(input, webpPng), quiet);

  if (!state) {
    return false;
  }

  let score = parseFloat(data.stdout);

  // Get the size of this iteration's WebP outputWebp file
  [state, data] = await to(statAsync(outputWebp), quiet);

  if (!state) {
    return false;
  }

  if (!quiet) {
    logResult(quality, score, data.size, inputSize, min, max);
  }

  return [true, data, score, data.size, data.size < inputSize];
}