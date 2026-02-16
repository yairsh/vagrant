const fs = require("fs");
const path = require("path");
const assert = require("assert");

function hasPattern(filePath, pattern) {
  const content = fs.readFileSync(filePath, "utf8");
  return pattern.test(content);
}

const mainPath = path.join(__dirname, "..", "src", "main.js");
const rendererPath = path.join(__dirname, "..", "src", "renderer.js");

assert.equal(hasPattern(mainPath, /module\.exports\.default\s*=\s*PodLogControlsMainExtension/), true);
assert.equal(hasPattern(rendererPath, /module\.exports\.default\s*=\s*PodLogControlsRendererExtension/), true);

console.log("export checks passed");
