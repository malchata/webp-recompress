// Global modules
import util from "util";
import imagemagick from "imagemagick";

// Promisified methods
const identifyAsync = util.promisify(imagemagick.identify);

export default async (input) => await identifyAsync([
  "-format",
  "%Q",
  input
]);
