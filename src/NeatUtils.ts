import { Phenotype, Neuron, Axon } from "./Phenotype";
import { Genome } from "./Genome";
import {
  IdistanceConfiguration,
  INeatConfiguration,
  NeuronType,
} from "./models";
import { Neat } from "./Neat";
import { Species } from "./Genome";

/**
 * Class containing utiliity functions for the NEAT algorithm .
 * [See more information about implementation](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
 */
class NeatUtils {
  /**
   * Check the configuration object provided by user. Throw error if any.
   *
   * @param {Partial<INeatConfiguration>} configuration the configuration object.
   */
  static checkConfiguration(configuration: Partial<INeatConfiguration>) {
    if (!NeatUtils.utils.isPositiveInteger(configuration.maxEpoch)) {
      throw new Error(
        "Error in configuration - maxEpoch should be a positive integer"
      );
    }
  }

  /**
   * Check a shape object. Throw error if any.
   *
   * @param {number[]} shape the configuration object.
   */
  static checkShape(shape: number[]) {
    shape.forEach((layer, layerIndex) => {
      if (layer <= 0 || !Number.isInteger(layer))
        throw new Error(
          "Error calling generatePerceptron: parameter should be an array of positive integer"
        );
    });
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

  /**
   * Compute the distance between two Genomes using [equation 2](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @param {IdistanceConfiguration} distanceConfiguration A distance configuration object.
   * @return {number} the distance between the two Genomes.
   */
  static computeDistance({
    genomes,
    distanceConfiguration,
  }: {
    genomes: [Genome, Genome];
    distanceConfiguration: IdistanceConfiguration;
  }): number {
    const { c1, c2, c3 } = distanceConfiguration;
    const E = NeatUtils.computeNumberOfExcessGenes(genomes);
    const D = NeatUtils.computeNumberOfDisjointGenes(genomes);
    const W = NeatUtils.computeAverageWieghtDifference(genomes);
    const N = Math.max(genomes[0].genes.length, genomes[1].genes.length);
    return (c1 * E) / N + (c2 * D) / N + c3 * W;
  }

  /**
   * Compute the number of disjoint genes between two genomes.
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfDisjointGenes(genomes: [Genome, Genome]): number {
    return 0;
  }

  /**
   * Compute the number of excess genes between two genomes.
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfExcessGenes(genomes: [Genome, Genome]): number {
    return 0;
  }

  /**
   * Compute the average weight difference between two genomes.
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the number of disjoint genes.
   */
  static computeAverageWieghtDifference(genomes: [Genome, Genome]): number {
    return 0;
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
    return new Phenotype({ neurons, axons, layers });
  };
}

export { NeatUtils };
