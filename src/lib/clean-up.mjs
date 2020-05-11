// Global modules
import fs from "fs";
import util from "util";

// App modules
import { to, webpRegex } from "./utils.mjs";

// Promisified methods
const unlinkAsync = util.promisify(fs.unlinkSync);

export default function (files) {
  Object.values(files).forEach(async file => {
    if (webpRegex.test(file)) {
      return;
    }

    await to(unlinkAsync(file));
  });
}
