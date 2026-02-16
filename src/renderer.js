const { LensRendererExtension } = require("@k8slens/extensions");
const { PodLogEnhancer } = require("./pod-log-enhancer");

class PodLogControlsRendererExtension extends LensRendererExtension {
  onActivate() {
    this.enhancer = new PodLogEnhancer();
    this.enhancer.activate();
  }

  onDeactivate() {
    if (this.enhancer) {
      this.enhancer.deactivate();
      this.enhancer = null;
    }
  }
}

module.exports = PodLogControlsRendererExtension;
