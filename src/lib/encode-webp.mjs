// Global modules
import util from "util";
import childProcess from "child_process";
import cwebp from "cwebp-bin";

// App modules
import { jpegRegex, pngRegex } from "./utils.mjs";

// Promisified methods
const execFileAsync = util.promisify(childProcess.execFile);

export default async (inputFile, outputFile, quality) => {
  let args;

  if (jpegRegex.test(inputFile)) {
    args = [
      "-q",
      quality,
      "-mt",
      inputFile,
      "-o",
      outputFile
    ];
  }

  if (pngRegex.test(inputFile)) {
    args = [
      "-lossless",
      "-m",
      "6",
      "-z",
      "9",
      "-q",
      quality,
      inputFile,
      "-o",
      outputFile
    ];
  }

  return await execFileAsync(cwebp, args);
};
