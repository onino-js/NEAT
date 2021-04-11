import { GraphControls } from "../../src/visualizer/GraphControls";
import Visualizer from "../../src/visualizer/Visualizer";
import { NeatUtils } from "./../../src/NeatUtils";

const main = () => {
  const phenotype = NeatUtils.generatePerceptron([2, 6, 5, 2]);
  const visualizer = new Visualizer("canvas", phenotype);
  new GraphControls("controls", visualizer);
};

window.onload = main;
