import util from "util";
import imagemagick from "imagemagick";

const convertAsync = util.promisify(imagemagick.convert);

export default async function(input, output) {
  await convertAsync([input, output]);
}
