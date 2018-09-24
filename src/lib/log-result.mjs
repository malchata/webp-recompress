import chalk from "chalk";

export default function(q, score, size, inputSize) {
  let smaller = size < inputSize;
  let improvement = Math.abs(((size / inputSize) - 1) * 100).toFixed(2);
  console.log(`${smaller === true ? "✅" : "🚫"} (q${q}) SSIMULACRA: ${score} - ${improvement}% ${smaller === true ? chalk.green.bold("smaller") : chalk.red.bold("bigger")}`);
}
