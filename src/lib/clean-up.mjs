// Global modules
import fs from "fs";
import { to, webpRegex } from "./utils.mjs";
import util from "util";

// Promisified methods
const unlinkAsync = util.promisify(fs.unlinkSync);

export default function (files, input, keepWebp) {
  const fileList = Object.values(files);

  fileList.forEach(async file => {
    if (webpRegex.test(file) && keepWebp) {
      return;
    }

    await to(unlinkAsync(file), true);
  });
}
