export const defaults = {
  threshold: 0.00875,
  thresholdMultiplier: 2.375,
  start: 75,
  quiet: false,
  verbose: false
};

export const jpegRegex = /\.jpe?g$/i;

export const pngRegex = /\.png$/i;

export const webpRegex = /\.webp$/i;

export const to = promise => promise.then(data => [true, data]).catch(error => [false, error]);

export const roundTo = (n, p = 8) => Number(Math.round(n + "e" + p) + "e-" + p);

export const getQualityInterval = (score, threshold) => Math.round(Math.abs(Math.log2(Math.abs(score - threshold))));

export function clampQuality (q) {
  if (q < 0) {
    return 0;
  } else if (q > 100) {
    return 100;
  }

  return q;
}

export function logResult (quality, score, size, inputSize, quiet) {
  let smaller = size < inputSize;
  let change = roundTo(Math.abs(((size / inputSize) - 1) * 100), 2);

  if (!quiet) {
    console.log(`(q${quality}) SSIMULACRA: ${score} - ${change}% ${smaller ? "smaller" : "larger"}`);
  }
}

export function getFinalQuality (score, trials) {
  const trialKeys = Object.keys(trials);

  for (let trialKeyIndex in trialKeys) {
    const quality = trialKeys[trialKeyIndex];
    const trial = trials[quality];

    if (score === trial.score) {
      return [+quality, trial.size];
    }
  }
}
