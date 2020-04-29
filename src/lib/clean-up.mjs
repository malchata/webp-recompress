import fs from "fs";
import { webpRegex } from "./utils.mjs";

export default function (files, input, keepWebp) {
  for (let file in files) {
    if ((webpRegex.test(files[file]) && keepWebp) || files[file] === input) {
      continue;
    }

    fs.unlinkSync(files[file]);
  }
}
