// Global modules
import util from "util";
import { execFile } from "child_process";
import dwebp from "dwebp-bin";

// Promisified methods
const execFileAsync = util.promisify(execFile);

export default async (inputFile, outputFile) => await execFileAsync(dwebp, [
  inputFile,
  "-mt",
  "-o",
  outputFile
]);
