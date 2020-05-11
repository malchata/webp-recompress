/* global describe it */

import path from "path";
import fs from "fs";
import assert from "assert";
import util from "util";
import url from "url";
import { defaults, jpegRegex, webpRegex, to, roundTo, getQualityInterval, clampQuality, getFinalQuality } from "../src/lib/utils.mjs";
import webpRecompress from "../src/webp-recompress.mjs";

const __dirname = url.fileURLToPath(import.meta.url.replace("/test.mjs", ""));

const testPromise = function(condition) {
  return new Promise((resolve, reject) => {
    if (!condition) {
      reject("The condition was not met!");
      return;
    }

    resolve("The condition was met.");
  });
};

describe("webp-recompress", function() {
  this.timeout(20000);

  const jpegFile = path.resolve(__dirname, "fixtures", "test.jpg");
  const webpFile = path.resolve(__dirname, "fixtures", "test.webp");
  const pngFile = path.resolve(__dirname, "fixtures", "sacrificial.png");

  describe("enforces valid threshold range", function() {
    it("should fail when a threshold greater than 1 is given", async function() {
      return await webpRecompress(jpegFile, 1.1, defaults.thresholdWindow, defaults.thresholdMultiplier, defaults.start, true, false).then(([status]) => {
        assert.strictEqual(status, false);
      }).catch(error => {
        assert.fail(error);
      });
    });

    it("should fail when a threshold less than 1 is given", async function() {
      return await webpRecompress(jpegFile, -0.1, defaults.thresholdWindow, defaults.thresholdMultiplier, defaults.start, true, false).then(([status]) => {
        assert.strictEqual(status, false);
      }).catch(error => {
        assert.fail(error);
      });
    });
  });

  it("should reject a non-JPEG input file", async function() {
    return await webpRecompress(pngFile, defaults.threshold, defaults.thresholdWindow, defaults.thresholdMultiplier, defaults.start, true, false).then(([status]) => {
      assert.strictEqual(status, false);
    }).catch(error => {
      assert.fail(error);
    });
  });

  describe("util modules", function() {
    describe("program defaults", function () {
      const currentDefaults = {
        threshold: 0.01,
        thresholdMultiplier: 1.5,
        start: 75,
        quiet: false,
        verbose: false
      };

      it(`\`threshold\` should be ${currentDefaults.threshold}`, function () {
        assert.strictEqual(defaults.threshold, currentDefaults.threshold);
      });

      it(`\`thresholdMultiplier\` should be ${currentDefaults.thresholdMultiplier}`, function () {
        assert.strictEqual(defaults.thresholdMultiplier, currentDefaults.thresholdMultiplier);
      });

      it(`\`start\` should be ${currentDefaults.start}`, function () {
        assert.strictEqual(defaults.start, currentDefaults.start);
      });

      it(`\`quiet\` should be ${currentDefaults.quiet}`, function () {
        assert.strictEqual(defaults.quiet, currentDefaults.quiet);
      });

      it(`\`verbose\` should be ${currentDefaults.verbose}`, function () {
        assert.strictEqual(defaults.verbose, currentDefaults.verbose);
      });
    });

    describe("regex patterns", function() {
      it("`jpegRegex` should match a JPEG filename", function() {
        assert.strictEqual(jpegRegex.test(jpegFile), true);
      });

      it("`webpRegex` should match a WebP filename", function() {
        assert.strictEqual(webpRegex.test(webpFile), true);
      });
    });

    describe("`to` promise wrapper", function() {
      it("should return success state and a message on resolution.", async function() {
        const [state, message] = await to(testPromise(true));

        assert.strictEqual(state && typeof message === "string", true);
      });

      it("should return failure state and a message on rejection.", async function() {
        const [state, message] = await to(testPromise(false));

        assert.strictEqual(!state && typeof message === "string", true);
      });
    });

    describe("`roundTo`", function() {
      const testFloat = 0.0173427342734234;

      it("should round float to precision of 8 when 2nd param is omitted.", async function() {
        const numberParts = roundTo(testFloat).toString().split(".");
        const expectedPrecision = 8;

        assert.strictEqual(numberParts[1].length, expectedPrecision);
      });

      it("should round float to precision of 2 when 2nd param is 2.", async function() {
        const numberParts = roundTo(testFloat, 2).toString().split(".");
        const expectedPrecision = 2;

        assert.strictEqual(numberParts[1].length, expectedPrecision);
      });

      it("should round float to precision of 10 when 2nd param is 10.", async function() {
        const numberParts = roundTo(testFloat, 10).toString().split(".");
        const expectedPrecision = 10;

        assert.strictEqual(numberParts[1].length, expectedPrecision);
      });
    });

    describe("`getQualityInterval`", function() {
      it("should return the expected quality interval for a given score and threshold.", async function() {
        const score = 0.03243421;
        const threshold = 0.0175;
        const expectedInterval = 6;

        assert.strictEqual(getQualityInterval(score, threshold), expectedInterval);
      });
    });

    describe("`clampQuality`", function() {
      it("should clamp quality below 0 to 0", function() {
        const expectedQuality = 0;

        assert.strictEqual(clampQuality(-50), expectedQuality);
      });

      it("should clamp quality above 100 to 100", function() {
        const expectedQuality = 100;

        assert.strictEqual(clampQuality(150), expectedQuality);
      });
    });

    describe("`getFinalQuality`", function() {
      it("should return the quality with a given score", function() {
        const trials = {
          "63": {
            score: 0.0463753,
            size: 31908,
            attempts: 1
          },
          "68": {
            score: 0.04314674,
            size: 33326,
            attempts: 1
          },
          "73": {
            score: 0.04029841,
            size: 35326,
            attempts: 1
          },
          "78": {
            score: 0.03529406,
            size: 38898,
            attempts: 1
          },
          "84": {
            score: 0.02211762,
            size: 46458,
            attempts: 1
          },
          "85": {
            score: 0.02023962,
            size: 48374,
            attempts: 1
          },
          "86": {
            score: 0.01850309,
            size: 49834,
            attempts: 1
          },
          "87": {
            score: 0.01755471,
            size: 51302,
            attempts: 3
          },
          "92": {
            score: 0.0096297,
            size: 63070,
            attempts: 1
          },
          "93": {
            score: 0.00892895,
            size: 66656,
            attempts: 1
          },
          "94": {
            score: 0.00828751,
            size: 68890,
            attempts: 4
          },
          "100": {
            score: 0.00486658,
            size: 91550,
            attempts: 3
          }
        };

        const expectedQuality = 92;
        const inputScore = 0.0096297;

        assert.strictEqual(getFinalQuality(inputScore, trials), expectedQuality);
      });
    });
  });

  it("should run successfully", async function () {
    return await webpRecompress(jpegFile, defaults.threshold, defaults.thresholdWindow, defaults.thresholdMultiplier, defaults.start, true, false).then(async ([status]) => {
      const exists = await fileExists(webpFile);

      assert.strictEqual(status && exists, true);
    }).catch(error => {
      assert.fail(error);
    });
  });
});

function fileExists (input, shouldNotExist = false) {
  return new Promise((resolve, reject) => {
    let file;

    try {
      file = fs.statSync(input);
    } catch (error) {
      if (shouldNotExist) {
        resolve(typeof file === "undefined");

        return;
      }

      reject(false);

      return;
    }

    resolve(!!file.size);
  });
}
