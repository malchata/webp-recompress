import fs from "fs";
import { webpRegex } from "./utils.mjs";

export default function (files, input, keepWebp, quiet) {
  if (!quiet) {
    console.log("Cleaning up temp files...");
  }

  for (let file in files) {
    if ((webpRegex.test(files[file]) && keepWebp) || files[file] === input) {
      continue;
    }

    fs.unlinkSync(files[file]);
  }

  if (!quiet) {
    console.log("Cleanup complete.");
  }
}
