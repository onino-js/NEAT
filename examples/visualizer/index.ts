import { GraphControls, Visualizer } from "./../../src/index";
import { Phenotype } from "../../src/Phenotype";

const main = () => {
  const phenotype = Phenotype.generate([2, 6, 5, 2]);
  const visualizer = new Visualizer("canvas", phenotype);
  new GraphControls("controls", visualizer);
};

window.onload = main;
