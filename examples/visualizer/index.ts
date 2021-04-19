import { Connexion } from "../../src/neat/Connexion";
import { ActivationType } from "../../src/neat/models";
import { GraphControls } from "../../src/visualizer/GraphControls";
import Visualizer from "../../src/visualizer/Visualizer";
import { NeatUtils } from "./../../src/neat/NeatUtils";

const main = () => {
  const network = NeatUtils.generatePerceptron({
    shape: [6, 3, 2, 2, 3, 6],
    randomWeight: true,
    activationType: ActivationType.RELU,
  });
  // Add recurrent nodes
  network.nodes
    .filter((n) => n.layerIndex === 2)
    .forEach((n) => {
      const axon = new Connexion({ input: n, output: n }, true);
      network.connexions.push(axon);
    });
  const n1 = network.nodes[8];
  const n2 = network.nodes[11];
  const ax = new Connexion({ input: n2, output: n1, weight: 1 });

  network.connexions.push(ax);
  const visualizer = new Visualizer("canvas", network);

  network.setUpdateCallback(() => visualizer.refresh());

  new GraphControls("controls", visualizer);

  document.getElementById("feed").addEventListener("click", () => {
    network.feedForward([1, 0, 0, 0, 0, 0], NeatUtils.activationFunctions.TANH);
  });
};

window.onload = main;
