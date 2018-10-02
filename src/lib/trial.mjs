import fs from "fs";
import util from "util";
import { to } from "./utils";
import encodeWebp from "./encode-webp";
import decodeWebp from "./decode-webp";
import ssimulacra from "./ssimulacra";
import logResult from "./log-result";

const statAsync = util.promisify(fs.stat);

export default async function(input, inputSize, outputWebp, refPng, webpPng, q, quiet, min, max) {
  let state, data;

  // Encode WebP for this run
  [state, data] = await to(encodeWebp(input, outputWebp, q), quiet);
  if (state === false) return false;

  // Decode that WebP to a PNG so SSIMULACRA can compare it to the reference
  [state, data] = await to(decodeWebp(outputWebp, webpPng), quiet);
  if (state === false) return false;

  // Get the SSIMULACRA score for this iteration
  [state, data] = await to(ssimulacra(q, input, outputWebp, refPng, webpPng));
  if (state === false) return false;

  let score = parseFloat(data.stdout);

  // Get the size of this iteration's WebP outputWebp file
  [state, data] = await to(statAsync(outputWebp), quiet);
  if (state === false) return false;

  if (quiet === false) {
    logResult(q, score, data.size, inputSize, min, max);
  }

  return [true, data, score, data.size, data.size < inputSize];
}
