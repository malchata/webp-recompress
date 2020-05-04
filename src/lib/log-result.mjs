export default function (quality, score, size, inputSize) {
  let smaller = size < inputSize;
  let change = Math.abs(((size / inputSize) - 1) * 100).toFixed(2);

  console.log(`(q${quality}) SSIMULACRA: ${score} - ${change}% ${smaller ? "smaller" : "larger"}`);
}
