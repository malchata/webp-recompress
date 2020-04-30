// Global modules
import util from "util";
import childProcess from "child_process";
import cwebp from "cwebp-bin";

// Promisified methods
const execFileAsync = util.promisify(childProcess.execFile);

export default async function (inputFile, outputFile, quality) {
  return await execFileAsync(cwebp, [
    "-q",
    quality,
    "-mt",
    inputFile,
    "-o",
    outputFile
  ]);
}
