import fs from "fs";
import { webpRegex } from "./utils";

export default function(files, keepWebp, verbose) {
  if (verbose === true) {
    console.log("Cleaning up temp files...");
  }

  for (let file in files) {
    if (webpRegex.test(files[file]) === true && keepWebp === true) {
      continue;
    }

    fs.unlinkSync(files[file]);
  }
}
