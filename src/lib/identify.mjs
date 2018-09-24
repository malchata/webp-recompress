import util from "util";
import imagemagick from "imagemagick";

const identifyAsync = util.promisify(imagemagick.identify);

export default async function(input) {
  return await identifyAsync(["-format", "%Q", input]);
}
