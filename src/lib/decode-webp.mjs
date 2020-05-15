// Global modules
import util from "util";
import childProcess from "child_process";
import dwebp from "dwebp-bin";

// Promisified methods
const execFileAsync = util.promisify(childProcess.execFile);

export default async (inputFile, outputFile) => await execFileAsync(dwebp.path, [
  inputFile,
  "-mt",
  "-o",
  outputFile
]);
