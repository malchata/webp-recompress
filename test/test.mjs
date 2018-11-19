/*global describe it*/

import path from "path";
import assert from "assert";
import { to } from "../src/lib/utils";
import encodeWebp from "../src/lib/encode-webp";
import decodeWebp from "../src/lib/decode-webp";
import ssimulacra from "../src/lib/ssimulacra";

describe("WebP", function() {
  describe("Encode PNG", function() {
    it("should encode a PNG to a WebP", async function() {
      let state;
      const input = path.resolve(__dirname, "images", "test-png.png");
      const outputWebp = path.resolve(__dirname, "images", "test-png.webp");
      const quality = 75;

      [state] = await to(encodeWebp(input, outputWebp, quality));

      assert.strictEqual(state, true);
    });
  });

  describe("Encode JPEG", function() {
    it("should encode a JPEG to a WebP", async function() {
      let state;
      const input = path.resolve(__dirname, "images", "test-jpeg.jpg");
      const outputWebp = path.resolve(__dirname, "images", "test-jpeg.webp");
      const quality = 75;

      [state] = await to(encodeWebp(input, outputWebp, quality));

      assert.strictEqual(state, true);
    });
  });

  describe("Decode to PNG", function() {
    it("should decode a WebP to a PNG", async function() {
      let state;
      const input = path.resolve(__dirname, "images", "test-webp.webp");
      const outputPng = path.resolve(__dirname, "images", "test-webp.png");

      [state] = await to(decodeWebp(input, outputPng));

      assert.strictEqual(state, true);
    });
  });
});

describe("SSIMULACRA", async function() {
  describe("Get score", function() {
    it("should successfully run SSIMULACRA", async function() {
      let state;
      const refPng = path.resolve(__dirname, "images", "ssimulacra-in.png");
      const webpPng = path.resolve(__dirname, "images", "ssimulacra-out.png");

      [state] = await to(ssimulacra(refPng, webpPng));

      assert.strictEqual(state, true);
    });
  });

  describe("Score in range", function() {
    it("should return a proper SSIMULACRA score", async function() {
      let state, data, score;
      const refPng = path.resolve(__dirname, "images", "ssimulacra-in.png");
      const webpPng = path.resolve(__dirname, "images", "ssimulacra-out.png");

      [state, data] = await to(ssimulacra(refPng, webpPng));

      if (state) {
        score = parseFloat(data.stdout);
      }

      assert.strictEqual(score >= 0 && score <= 1, true);
    });
  });
});
