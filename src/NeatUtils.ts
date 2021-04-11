import { INITIAL_CONFIGURATION } from "./configuration";
import { Phenotype, Neuron, Axon } from "./Phenotype";
import { AxonGene, Genome, NeuronGene } from "./Genome";
import { INeatConfiguration, NeuronType } from "./models";
import { Neat } from "./Neat";
import { Species } from "./Genome";

/**
 * Class containing utiliity functions for the NEAT algorithm .
 * [See more information about implementation](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
 */
class NeatUtils {
  public configuration = INITIAL_CONFIGURATION;
  constructor(configuration: Partial<INeatConfiguration>) {
    Object.assign(this.configuration, configuration);
    NeatUtils.checkConfiguration(this.configuration);
  }
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
      neat.species[0].addGenome(
        new Genome({ shape: neat.configuration.shape })
      );
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
   * Compute the distance between two Genomes using
   * [equation 2](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the distance between the two Genomes.
   */
  public computeDistance({ genomes }: { genomes: [Genome, Genome] }): number {
    const { c1, c2, c3 } = this.configuration.distanceConfiguration;
    const E = NeatUtils.computeNumberOfExcessGenes(genomes);
    const D = NeatUtils.computeNumberOfDisjointGenes(genomes);
    const W = NeatUtils.computeAverageWieghtDifference(genomes);
    const N = Math.max(genomes[0].genes.length, genomes[1].genes.length);
    return (c1 * E) / N + (c2 * D) / N + c3 * W;
  }

  /**
   * Compute the number of genes who missmatch between two genomes.
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfMissmatchGenes(genomes: [Genome, Genome]): number {
    return genomes[0].genes
      .concat(genomes[1].genes)
      .map((g) => g.innovation)
      .reduce(
        (acc, cur, i, arr) =>
          arr.filter((a) => a === cur).length === 2 ? acc : acc + 1,
        0
      );
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
    const genes1 = NeatUtils.getGenesIndexedByInnovation(genomes[0].axonGenes);
    const genes2 = NeatUtils.getGenesIndexedByInnovation(genomes[1].axonGenes);
    return Math.abs(genes1.length - genes2.length);
  }

  /**
   * Compute the average weight difference of matching genes between two genomes.
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
   * @return {number} the average weight difference of matching genes.
   */
  static computeAverageWieghtDifference(genomes: [Genome, Genome]): number {
    return 0;
  }

  static getGenesIndexedByInnovation(genes: AxonGene[]): AxonGene[] {
    let result = [];
    genes.forEach((g) => {
      result[g.innovation] = g;
    });
    return result;
  }

  /**
   * Compute the adjusted fitness of a Genome.
   *
   * @param {[Phenotype, Phenotype]} phenotypes An array of exactly two Phenotypes.
   * @return {number} The adjusted fitness of the phenotype.
   */
  public computeAdjustedFitness(
    phenotype: Phenotype,
    population: Phenotype[]
  ): number {
    const sh = (d: number) =>
      d > this.configuration.distanceConfiguration.compatibilityThreshold
        ? 0
        : 1;
    const fitness = this.configuration.fitnessFunction(phenotype);
    let sumSh = population.reduce((acc, cur) => {
      const d = this.computeDistance({
        genomes: [cur.genome, phenotype.genome],
      });
      return acc + sh(d);
    }, 0);
    return fitness / sumSh;
  }

  /**
   * Make a selection over a population of species
   *
   * @param {Species[]} species An array of exactly two Phenotypes.
   * @return {Species[]} The adjusted fitness of the phenotype.
   */
  public selectPopulation(species: Species[]): Species[] {
    const fs = species.map((s) =>
      s.genomes.reduce(
        (acc, cur) =>
          acc +
          this.computeAdjustedFitness(
            Phenotype.create(cur),
            NeatUtils.getPopulationFromSpecies(species)
          ),
        0
      )
    );
    const totFs = fs.reduce((cur, acc) => acc + cur, 0);
    const percentages = fs.map((f) => f / totFs);
    return species;
  }

  /**
   * Get a flat array of Phenotypes from a nested array of Genomes (Species)
   *
   * @param {Species[]} species An array of exactly two Phenotypes.
   * @return {Phenotype[]} An array of Phenotypes.
   */
  static getPopulationFromSpecies(species: Species[]): Phenotype[] {
    return species
      .map((s) => s.genomes)
      .flat()
      .map((g) => Phenotype.create(g));
  }

  private getAllGenomes(neat: Neat) {}

  /**
   * Get an array of NeuronGene object from a shape.
   *
   * @param {number[]} shape A shape object.
   * @return {NeuronGene[]} An array of NeuronGene with number of input, hidden and output nodes defined in shape.
   */
  static getNeuronGenesFromShape(shape: number[]) {
    let res: NeuronGene[] = [];
    shape.forEach((layer, layerIndex) => {
      new Array(layer).fill(0).forEach((n) => {
        const type =
          layerIndex === 0
            ? NeuronType.INPUT
            : layerIndex > 0 && layerIndex < shape.length - 1
            ? NeuronType.HIDDEN
            : NeuronType.OUTPUT;
        res.push(new NeuronGene({ type }));
      });
    });
    return res;
  }

  /**
   * Create symetric, fully connected phenotype with arbitrary number of hiddens layers
   * 3, 5, 5, 2] represent a graph with 3 inputs, 2 outputs, 2 hiddens layers of 5 nodes each.
   *  Nodes of a layer is connected to all nodes of next layer
   *
   * @param {number[]} shape A shape object.
   * @return {Phenotype} A perceptron network
   */
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
