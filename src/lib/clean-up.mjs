// Global modules
import fs from "fs";
import util from "util";

// App modules
import { to, webpRegex } from "./utils.mjs";

// Promisified methods
const unlinkAsync = util.promisify(fs.unlinkSync);

export default function (files) {
  const fileList = Object.values(files);

  fileList.forEach(async file => {
    if (webpRegex.test(file)) {
      return;
    }

    await to(unlinkAsync(file), true);
  });
}
