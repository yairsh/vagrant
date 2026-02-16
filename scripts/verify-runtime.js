const assert = require("assert");
const { detectLogLevel, shouldHideLogLine, classNameForLevel } = require("../src/log-levels");

assert.equal(detectLogLevel("INFO service started"), "info");
assert.equal(detectLogLevel("warning threshold reached"), "warn");
assert.equal(detectLogLevel("ERR database connection"), "error");
assert.equal(classNameForLevel("fatal"), "lvl-fatal");
assert.equal(shouldHideLogLine("healthcheck ok", ["health"]), true);
assert.equal(shouldHideLogLine("payment succeeded", ["health"]), false);

console.log("runtime checks passed");
