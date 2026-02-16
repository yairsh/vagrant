import { LensRendererExtension } from "@k8slens/extensions";
import { PodLogEnhancer } from "./pod-log-enhancer";
import "./styles.css";

export default class PodLogControlsRendererExtension extends LensRendererExtension {
  private enhancer: PodLogEnhancer | null = null;

  onActivate(): void {
    this.enhancer = new PodLogEnhancer();
    this.enhancer.activate();
  }

  onDeactivate(): void {
    this.enhancer?.deactivate();
    this.enhancer = null;
  }
}
