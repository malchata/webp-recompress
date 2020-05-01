// App modules
import { defaults } from "./utils.mjs";

export default `
Usage: webp-recompress -i [input] [...options]

Purpose:
Takes an input JPEG and tries to generate the best possible lossy WebP that is
both smaller and looks as visually similar to its source as possible.

Arguments:
  -i ........... Input image file. Must be a JPEG file. Passing any other file
                 type will throw an error. This value is required! All other
                 flags are optional.
  -t N ......... Minimum SSIMULACRA threshold for the WebP file to meet. Lower
                 values mean resulting WebPs will resemble their inputs more,
                 but will also be larger. SSIMULACRA states that values above
                 0.1 means distortions are likely to be perceptible/annoying.
                 Default: ${defaults.threshold}
  -w N ......... The scoring window in either direction for which generated
                 images must fall between. A reasonable window is vital in
                 ensuring that an image is both visually acceptable and smaller
                 than the input JPEG. This number helps webp-recompress create
                 an acceptable SSIMULACRA scoring range. For example, if a
                 threshold of 0.02 and a window value of 0.0025 is specified,
                 the acceptable SSIMULACRA score range becomes 0.0175 to 0.0225.
                 Wider windows make webp-recompress more lenient (and faster).
                 If any given combination of a threshold and its window can't
                 produce a desirable result, then this value is multiplied by
                 the value given in the -m flag and webp-recompress runs again.
                 Default: ${defaults.thresholdWindow}
  -m N ......... The number by which the threshold window is multipled in the
                 event a suitable image candidate can't be encoded with the
                 initial threshold window. This effectively widens the window
                 so that a suitable candidate can eventually be generated rather
                 than failing outright. Lower multipliers will take more time,
                 but find more visually similar candidates, whereas higher
                 multipliers will take less time, but find less visually similar
                 candidates.
                 Default: ${defaults.thresholdMultiplier}
  -s N ......... The starting quality from 0 to 100. If the quality of the given
                 JPEG cannot be guessed, this value sets the starting quality
                 level webp-recompress uses to recompress JPEGs to WebP.
                 Default: ${defaults.start}
  -k ........... Whether or not to keep the resulting WebP file.
                 Default: ${defaults.keepWebp}
  -v ........... Verbose logging. This reveals more information about what might
                 be going on as webp-recompress runs.
  -q ........... Silence all console output, including errors (overrides -v).
                 Default: ${defaults.quiet}
`;
