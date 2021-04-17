import { AxonGene } from "../../src/neat/Genome";
import { Axon } from "../../src/neat/Phenotype";
import { GraphControls } from "../../src/visualizer/GraphControls";
import Visualizer from "../../src/visualizer/Visualizer";
import { NeatUtils } from "./../../src/neat/NeatUtils";

const main = () => {
  const phenotype = NeatUtils.generatePerceptron([6, 3, 2, 2, 3, 6]);
  // Add recurrent nodes
  phenotype.neurons.filter(n=>n.layerIndex===2).forEach(n=>{
    const axonGene=new AxonGene({input:n.neuronGene, output:n.neuronGene});
    const axon= new Axon(axonGene, {input:n, output:n})
    phenotype.axons.push(axon);
  })
  const a=new AxonGene();
  const n1 = phenotype.neurons[8];
  const n2 = phenotype.neurons[11];
  const ax = new Axon(a, {input:n2, output:n1})
  phenotype.axons.push(ax);
  const visualizer = new Visualizer("canvas", phenotype);

  new GraphControls("controls", visualizer);
};

window.onload = main;
