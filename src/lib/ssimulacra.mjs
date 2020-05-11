// Global modules
import util from "util";
import childProcess from "child_process";
import ssimulacra from "ssimulacra-bin";

// Promisified methods
const execFileAsync = util.promisify(childProcess.execFile);

export default async (refPng, webpPng) => await execFileAsync(ssimulacra, [
  refPng,
  webpPng
]);
