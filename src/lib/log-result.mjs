import chalk from "chalk";

export default function(q, score, size, inputSize, min, max) {
  let smaller = size < inputSize;
  let improvement = Math.abs(((size / inputSize) - 1) * 100).toFixed(2);
  let withinThreshold = score <= max && score >= min;
  console.log(`${withinThreshold === true ? "✅" : "🚫"} (q${q}) SSIMULACRA: ${withinThreshold === true ? chalk.green(score) : chalk.red(score)} - ${improvement}% ${smaller === true ? "smaller" : "bigger"}`);
}
