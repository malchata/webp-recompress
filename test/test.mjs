/* global describe it */

import path from "path";
import assert from "assert";
import { fileURLToPath } from "url";
import { defaults } from "../src/lib/utils.mjs";
import webpRecompress from "../src/webp-recompress.mjs";

const __dirname = fileURLToPath(import.meta.url.replace("/test.mjs", ""));

describe("webp-recompress", function () {
  this.timeout(20000);

  it("should find the best lossy WebP from a JPEG", async function () {
    const input = path.resolve(__dirname, "fixtures", "test-jpeg.jpg");

    return webpRecompress(input, defaults.threshold, defaults.thresholdWindow, defaults.thresholdMultiplier, defaults.start, defaults.keepWebp, true).then(works => {
      assert.strictEqual(works, true);
    }).catch(error => {
      assert.fail(error);
    });
  });
});
