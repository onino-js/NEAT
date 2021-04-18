import { Axon } from "../../src/neat/Phenotype";
import { GraphControls } from "../../src/visualizer/GraphControls";
import Visualizer from "../../src/visualizer/Visualizer";
import { NeatUtils } from "./../../src/neat/NeatUtils";

const main = () => {
  const phenotype = NeatUtils.generatePerceptron([6, 3, 2, 2, 3, 6], true);
  // Add recurrent nodes
  phenotype.neurons
    .filter((n) => n.layerIndex === 2)
    .forEach((n) => {
      const axon = new Axon({ input: n, output: n }, true);
      //   phenotype.axons.push(axon);
    });
  const n1 = phenotype.neurons[8];
  const n2 = phenotype.neurons[11];
  const ax = new Axon({ input: n2, output: n1, weight: 1 });

  //  phenotype.axons.push(ax);
  const visualizer = new Visualizer("canvas", phenotype);

  phenotype.setUpdateCallback(() => visualizer.refresh());

  new GraphControls("controls", visualizer);

  document.getElementById("feed").addEventListener("click", () => {
    phenotype.feedForward(
      [1, 0, 0, 0, 0, 0],
      NeatUtils.activationFunctions.TANH
    );
  });
};

window.onload = main;
