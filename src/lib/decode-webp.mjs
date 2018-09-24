import util from "util";
import childProcess from "child_process";
import dwebp from "dwebp-bin";

const execFileAsync = util.promisify(childProcess.execFile);

export default async function(inputFile, outputFile) {
  return await execFileAsync(dwebp.path, [
    inputFile,
    "-o",
    outputFile
  ]);
}
