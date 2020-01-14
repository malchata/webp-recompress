import fs from "fs";
import { webpRegex } from "./utils";

export default function (files, input, keepWebp, verbose) {
  if (verbose) {
    console.log("Cleaning up temp files...");
  }

  for (let file in files) {
    if ((webpRegex.test(files[file]) && keepWebp) || files[file] === input) {
      continue;
    }

    fs.unlinkSync(files[file]);
  }

  if (verbose) {
    console.log("Cleanup complete.");
  }
}
