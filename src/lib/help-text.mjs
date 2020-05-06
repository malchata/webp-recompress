// App modules
import { defaults } from "./utils.mjs";

export default `
Usage: webp-recompress -i [input] [...options]

Purpose:
Takes an input JPEG and tries to generate the best possible lossy WebP that is
both smaller and looks as visually similar to its source as possible.

Arguments:
  -i [file] .... Input image file. Must be a JPEG file. Passing any other file
                 type will throw an error. This is the only required argument.
  -t N ......... Target SSIMULACRA threshold for the WebP file to meet. Lower
                 values mean resulting WebPs will resemble their inputs more,
                 but will also be larger. SSIMULACRA states that values above
                 0.1 means distortions are likely to be perceptible/annoying.
                 webp-recompress can't guarantee that the image you supply can
                 be recompressed as a lossy WebP beneath the threshold you set,
                 but will try again after adjusting the threshold upward by an
                 amount determined by the multipler flag described below.
                 Default: ${defaults.threshold}
  -m N ......... The number by which the threshold is multiplied in the event a
                 suitable image candidate can't be determined with the initial
                 threshold given. This ensures that a suitable candidate can
                 eventually be generated rather than failing outright. Lower
                 multipliers take more time, but may find more visually similar
                 candidates, whereas higher multipliers will take less time, but
                 find less visually similar candidates.
                 Default: ${defaults.thresholdMultiplier}
  -s N ......... The starting quality from 0 to 100. If the quality of the given
                 JPEG cannot be guessed, this value sets the starting quality
                 level webp-recompress uses to recompress JPEGs to WebP.
                 Default: ${defaults.start}
  -v ........... Verbose logging. This reveals more information about what might
                 be going on as webp-recompress runs.
                 Default: ${defaults.verbose}
  -q ........... Silence all console output, including errors (overrides -v).
                 Default: ${defaults.quiet}
`;
