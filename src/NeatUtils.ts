import { Phenotype, Neuron, Axon } from "./Phenotype";
import { Genome } from "./Genome";
import { INeatConfiguration, NeuronType } from "./models";
import { Neat } from "./Neat";
import { Species } from "./Genome";
import { helpers } from "./utils/helpers";

/** Class containing utiliity functions for the NEAT algorithm */
class NeatUtils {
  static checkConfiguration(configuration: Partial<INeatConfiguration>) {
    if (!NeatUtils.utils.isPositiveInteger(configuration.maxEpoch)) {
      throw new Error(
        "Error in configuration - maxEpoch should be a positive integer"
      );
    }
  }

  static utils = {
    isPositiveInteger: (n: any) => Number.isInteger(n) && n >= 0,
  };

  static initializePopulation(neat: Neat) {
    neat.species = [new Species()];
    new Array(neat.configuration.populationSize).fill(0).forEach((n, i) => {
      neat.species[0].addGenome(new Genome(neat.configuration.shape));
    });
  }

  static speciatePopulation(neat: Neat) {}

  static evaluateFitness(neat: Neat) {}

  static selectPopulation(neat: Neat) {}

  static crossoverPopulation(neat: Neat) {}

  static mutatePopulation(neat: Neat) {}

  static evaluateCriteria(neat: Neat): boolean {
    return true;
  }

  static createNewPopulation(neat: Neat) {
    // Step 3.1 - Select best performers based on fitness threshold
    NeatUtils.selectPopulation(neat);
    // Step 3.2 - Sort population into different species
    NeatUtils.speciatePopulation(neat);
    // Step 3.2 - Create new individuals with crossover manupulation
    NeatUtils.crossoverPopulation(neat);
    // Step 3.2 - Create new individuals mutations
    NeatUtils.mutatePopulation(neat);
  }

  static checkShape(shape: number[]) {
    shape.forEach((layer, layerIndex) => {
      if (layer <= 0 || !Number.isInteger(layer))
        throw new Error(
          "Error calling generatePerceptron: parameter should be an array of positive integer"
        );
    });
  }

  private getAllGenomes(neat: Neat) {}

  // Create symetric, fully connected phenotype with arbitrary number of hiddens layers
  // [3, 5, 5, 2] represent a graph with 3 inputs, 2 outputs, 2 hiddens layers of 5 nodes each.
  // Nodes of a layer is connected to all nodes of next layer
  static generatePerceptron = (layers: number[]) => {
    NeatUtils.checkShape(layers);
    let neurons: Neuron[] = [];
    let axons: Axon[] = [];

    // Create neurons
    // For each layer
    layers.forEach((layer, layerIndex) => {
      // For each neuron in the layer
      new Array(layer).fill(0).forEach((n) => {
        const type =
          layerIndex === 0
            ? NeuronType.INPUT
            : layerIndex > 0 && layerIndex < layers.length - 1
            ? NeuronType.HIDDEN
            : NeuronType.OUTPUT;
        const neuron = new Neuron({ type, layerIndex });
        neurons.push(neuron);
      });
    });

    // Create array of axons
    neurons.forEach((neuron) => {
      if (neuron.type === NeuronType.OUTPUT) return;
      const nextLayerNeurons = neurons.filter(
        (n) => n.layerIndex === neuron.layerIndex + 1
      );
      nextLayerNeurons.forEach((n) => {
        const axon = new Axon({ input: neuron, output: n });
        axons.push(axon);
      });
    });

    // layers.forEach((layer, layerIndex) => {
    //   // if last layer then return (no connexion)
    //   if (layerIndex === layers.length - 1) return;
    //   // Retreive neurons of concerned layer
    //   const currentLayerNeurons = neurons.filter((n, i) => {
    //     return n.layerIndex === layerIndex;
    //   });

    //   // Retreive neurons of next layer
    //   const nextLayerNeurons = neurons.filter((n, i) => {
    //     return n.layerIndex === layerIndex + 1;
    //   });
    //   // For each neuron of current, create connection to all neurons of next layer
    //   currentLayerNeurons.forEach((input) => {
    //     nextLayerNeurons.forEach((output) => {
    //       const axon = new Axon({ input, output });
    //       axons.push(axon);
    //     });
    //   });
    // });
    return new Phenotype({ neurons, axons, layers });
  };
}

export { NeatUtils };
