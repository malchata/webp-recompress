export default `
Usage: webp-equiv -i [input] [...options]

Purpose:
Takes a PNG, JPEG, or GIF image and will try to generate the best possible lossy
WebP candidate that a) is smaller and b) looks as visually identical to its
source as possible.

Arguments:
  -i ...... Input image file. Must be either be a JPEG, PNG, or GIF file. Passing
            a WebP file will throw an error. This value is required!
  -t N .... Minimum SSIMULACRA threshold for the WebP file to meet. Lower values
            mean resulting WebPs will resemble their inputs more, but will also
            be larger. SSIMULACRA states that values above 0.1 means distortions
            are likely to be perceptible/annoying.
            Default: 0.02
  -w N .... The scoring window in either direction for which generated images
            must fall between. Targeting a window is key to ensuring images that
            are a) visually acceptable and b) smaller than their inputs. This
            number helps webp-equiv create an acceptable SSIMULACRA scoring
            range. For example, if a threshold of 0.02 and a window value of
            0.0025 are specified, the acceptable SSIMULACRA score range becomes
            0.0175 to 0.0225. Wider windows makes webp-equiv more lenient, but
            can also result in undesired outcomes.
            Default: 0.00125
  -s N .... The starting quality from 0 to 100. For JPEGs, this value sets the
            starting quality level webp-equiv uses to recompress JPEGs to WebP
            (assuming webp-equiv can't guess the quality of the JPEG, which is
            the default behavior). For PNGs, this value is always used (as PNGs
            are lossless), so setting this to a sensible default can reduce
            processing time for PNGs.
            Default: 75
  -f ...... Whether or not failure is an option. webp-equiv will try its hardest
            to generate a lossy WebP equivalent that is both smaller and falls
            within the specified SSIMULACRA range, but depending on any given
            image, may fail to do so. If this happens, this switch controls
            whether or not webp-equiv will "go for broke" and find an image
            candidate that's the smallest, yet most visually similar.
            Default: false
  -k ...... Whether or not to keep the resulting WebP file.
            Default: false
  -v ...... Toggle verbose console output.
            Default: false
  -q ...... Silence all console output, including errors (overrides -v).
            Default: false
  -n ...... Activates the WebP encoder's "near lossless" mode. Warning: This
            mode can run significantly slower, and may not always be successful.
            Default: false
`;
