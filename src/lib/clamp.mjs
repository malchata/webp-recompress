export default function(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
