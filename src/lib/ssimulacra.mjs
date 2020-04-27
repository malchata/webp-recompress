import util from "util";
import childProcess from "child_process";
import ssimulacra from "ssimulacra-bin";

const execFileAsync = util.promisify(childProcess.execFile);

export default async function (refPng, webpPng) {
  return await execFileAsync(ssimulacra, [
    refPng,
    webpPng
  ]);
}
