import minimist from "minimist";
import webpEquiv from "./webp-equiv";

const argv = minimist(process.argv.slice(2));

webpEquiv(argv.i);
