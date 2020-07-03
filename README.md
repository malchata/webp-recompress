# webp-recompress

Inspired by [jpeg-recompress](https://github.com/danielgtaylor/jpeg-archive#jpeg-recompress), webp-recompress is a program that takes a JPEG input and recompresses it to a smaller WebP image within a specified [SSIMULACRA](https://cloudinary.com/blog/detecting_the_psychovisual_impact_of_compression_related_artifacts_using_ssimulacra) threshold to limit quality loss. PNG inputs are also accepted, but they will be converted to lossless WebP with the most aggressive compression settings applied, rather than being converted to lossy WebP. It can be used as a local module or a CLI (recommended). Install webp-recompress globally like so:

```
npm i -g webp-recompress
```

Then get the [help text](https://github.com/malchata/webp-recompress/blob/master/src/lib/help-text.mjs) by running the CLI with no arguments:

```
webp-recompress
```

## CLI usage

If you've ever used jpeg-recompress, webp-recompress is _mostly_ similar. Below is an example of the simplest use of webp-recompress:

```
webp-recompress -i input.jpg
```

When finished, this command will save the best WebP candidate it can find to a file named `input.webp`. There are no output options for webp-recompress as of yet, so all output files will retain the same name as their inputs, just with a `.webp` extension.

There are more arguments the CLI accepts. Though the default behavior of webp-recompress works reasonably well, you can change a few influential arguments to change how it works. Here are those arguments:

### `-i [FILE]` _required_

The input image. This is the only argument required by webp-recompress. JPEG inputs will received the recompression treatment described earlier in this document, whereas PNG inputs will be converted to lossless WebP. Passing any other file types will throw an error.

### `-t [FLOAT]` _default: `0.00875`_

The maximum SSIMULACRA score that webp-recompress will attempt to encode a lossy WebP image within. According to SSIMULACRA's help text, scores above 0.1 mean that distortions are likely to be perceptible, whereas scores below 0.01 mean distortions are like to be imperceptible. Raising this value may result in smaller WebP images, but it could also result in more distorted output. Lowering it could cause WebP recompress to take longer.

### `-m [FLOAT | INTEGER]` _default: `2.375`_

webp-recompress can never guarantee that a smaller lossy WebP image can be generated from an input JPEG below a specified SSIMULACRA score. If webp-recompress can't find a suitable image for a given score, it will multiply the given threshold given in this argument and re-run itself. webp-recompress will do this until a suitable image is found.

### `-s [INTEGER]` _default: `75`_

The quality setting webp-recompress will start at when it tries to find the best possible lossy WebP image candidate. Normally, webp-recompress tries to "guess" the image's quality using [node-imagemagick](https://www.npmjs.com/package/imagemagick), so changing this argument may have no practical effect unless the quality can't be guessed. You probably don't need to override this setting.

### `-v` _default: `false`_

When this switch is present, verbose logging is turned on. This is useful if you want to see what webp-recompress is doing in detail, but it could clutter your deployment logs.

### `-q` _default: `false`_

When present, this switch turns off all logging. Turning this off may not be the best idea for basic usage, as you'll want to know if something goes wrong. If turned on, verbose logging will not work, even if the `-v` argument is provided.

### `-r` _default: `false`_

Prints the current version of webp-recompress. If passed, all other arguments will be ignored and no image processing will occur.

## API usage

If you want to use webp-recompress in a Node.js program, you can do that:

```javascript
import webpRecompress from "webp-recompress";

// Pesky IIFE needed if top-level `await` isn't available
(async () => {
  const input = path.resolve(__dirname, "input.jpg");
  const threshold = 0.005;
  const thresholdMultiplier = 1.75;
  const start = 80;
  const quiet = false;
  const verbose = true;

  const [state, message] = await webpRecompress(input, threshold, thresholdMultiplier, start, quiet, verbose);
})();
```

webp-recompress returns an array with two members. The first is a boolean which indicates the success state. `true` means that everything ran fine, `false` means there was an error. When a `false` value is returned, the error message will be available in the second array member.

Like the CLI, the only required option is the input, which must be a JPEG image. All other parameters are optional. The above example shows how all available options can be set when using the API.

## Notes and caveats

webp-recompress is something I've managed to throw together over the last year or so in my spare time. It performs admirably, but like all open source software, it's not perfect. This section catalogues some of the things I think you should know about webp-recompress before you boldly go and use it indiscriminately.

### You will need OpenCV installed

SSIMULACRA depends on OpenCV. Therefore, so does webp-recompress. OpenCV version 3 is probably the best, as OpenCV 4 requires some fiddling in order for SSIMULACRA to properly build. To install OpenCV on macOS, use brew:

```
brew install opencv@3
```

### ssimulacra-bin has only been tested on macOS.

If you couldn't tell by now, webp-recompress depends on SSIMULACRA. I created an npm package that wraps SSIMULACRA called [ssimulacra-bin](https://www.npmjs.com/package/ssimulacra-bin), which is structured much the same way as other npm-wrapped binaries (such as [cwebp-bin](https://www.npmjs.com/package/cwebp-bin), for example).

Unfortunately, I can only attest that this binary works on macOS Catalina. It probably works on Mojave and may earlier versions, but the macOS binary that is distributed with ssimulacra-bin has been built on Catalina.

One of the things I could use some help with is to expand ssimulacra-bin's compatibility to Windows and Linux. Until such help, or until I can figure that out on my own, this program will only run on macOS.

### Scoring

As stated in the CLI usage section, webp-recompress cannot guarantee that a smaller lossy WebP image can be found within a given SSIMULACRA scoring threshold. The default scoring threshold is `0.00875`. Given that the default threshold multiplier is `2.375`, a suitable lossy WebP image may only be found after the initial trial fails and webp-recompress calls itself with a new scoring threshold of `0.02078125`, or maybe even `0.04935546875`.

Most of the time, this is fine. While SSIMULACRA's help text states that scores under 0.01 are likely to not have perceptible differences, I've found that scores below 0.05 are _generally_ fine. Scores around 0.02 are often acceptable. You may run into issues with images containing geometric patterns or line art, where lossy compression artifacts can be very noticeable, but those images are often best encoded in lossless or vector formats.

## Contributing

If you want to contribute to webp-recompress, please file an issue first before submitting pull requests. This is the best way to foster discussion around a problem or proposed feature/fix. My inclination will be to close any unsolicited PRs that don't have a corresponding issue, but I may make an exception if your PR is exceptionally well documented.
