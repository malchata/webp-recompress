export default `
Usage: webp-recompress -i [input] [...options]

Purpose:
Takes an input JPEG and tries to generate the best possible lossy WebP that is
both smaller and looks as visually similar to its source as possible.

Arguments:
  -i ........... Input image file. Must be either be a JPEG file. Passing any
                 other file type will throw an error. This value is required!
                 All other flags are entirely optional.
  -t N ......... Minimum SSIMULACRA threshold for the WebP file to meet. Lower
                 values mean resulting WebPs will resemble their inputs more,
                 but will also be larger. SSIMULACRA states that values above
                 0.1 means distortions are likely to be perceptible/annoying.
                 Default: 0.02
  -w N ......... The scoring window in either direction for which generated
                 images must fall between. A reasonable window is vital in
                 ensuring that an image is both visually acceptable and smaller
                 than the input JPEG. This number helps webp-recompress create
                 an acceptable SSIMULACRA scoring range. For example, if a
                 threshold of 0.02 and a window value of 0.0025 is specified,
                 the acceptable SSIMULACRA score range becomes 0.0175 to 0.0225.
                 Wider windows make webp-recompress more lenient, but can result
                 in undesired outcomes.
                 Default: 0.00125
  -s N ......... The starting quality from 0 to 100. If the quality of the given
                 JPEG cannot be guessed, this value sets the starting quality
                 level webp-recompress uses to recompress JPEGs to WebP.
                 Default: 75
  -f ........... Whether or not failure is an option. webp-recompress will try
                 its hardest to generate the best result within the specified
                 SSIMULACRA range, but depending on any given image or the
                 settings specified, it may fail to do so. If this happens, this
                 switch controls whether or not webp-recompress will "go for
                 broke" and find an image candidate that's the smallest, yet
                 most visually similar.
                 Default: false
  -k ........... Whether or not to keep the resulting WebP file.
                 Default: false
  -v ........... Toggle verbose console output.
                 Default: false
  -q ........... Silence all console output, including errors (overrides -v).
                 Default: false
  -c ........... Enables the encoding cache. When enabled, webp-recompress will
                 keep track of the best settings for images in a JSON file. When
                 populated, this will speed up repeat builds.
                 Default: false
  -cf [FILE] ... The name of the file which stores the cache JSON.
                 Default: webpcache.json
`;
