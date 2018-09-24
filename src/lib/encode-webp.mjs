import util from "util";
import childProcess from "child_process";
import cwebp from "cwebp-bin";

const execFileAsync = util.promisify(childProcess.execFile);

export default async function(inputFile, outputFile, quality, nearLossless) {
  return await execFileAsync(cwebp, [
    nearLossless === true ? "-near_lossless" : "-q",
    quality,
    "-mt",
    inputFile,
    "-o",
    outputFile
  ]);
}
