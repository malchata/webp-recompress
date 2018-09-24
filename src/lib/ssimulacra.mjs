import util from "util";
import childProcess from "child_process";

const execFileAsync = util.promisify(childProcess.execFile);

export default async function(quality, inputFile, webp, refPng, webpPng) {
  return await execFileAsync("ssimulacra", [refPng, webpPng]);
}
