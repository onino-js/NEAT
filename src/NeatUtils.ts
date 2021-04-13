import { Phenotype, Neuron, Axon } from "./Phenotype";
import { AxonGene, Genome, NeuronGene } from "./Genome";
import {
  IdistanceConfiguration,
  INeatConfiguration,
  NeuronType,
} from "./models";
import { Neat } from "./Neat";

/**
 * Class containing utiliity functions for the NEAT algorithm .
 * [See more information about implementation](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
 */
class NeatUtils {
  /**
   * Initialize the population of a Neat object
   *
   * @param {Neat} neat A neat object.
   * @return {Genome[]} the population as an array of genomes
   */
  static initializePopulation(neat: Neat): Genome[] {
    neat.species = [[]];
    return [];
  }

  /**
   * Make a selection over a population of species.
   * Remove X% of the population using adjustedFttness as discriminent
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} neat A neat object with truncated population and species
   */
  static selectPopulation(neat: Neat): Neat {
    const species = neat.species.map((s) =>
      s.sort(
        (a, b) => a.phenotype.adjustedFitness - b.phenotype.adjustedFitness
      )
    );
    neat.species = species.map((s) =>
      NeatUtils.removeXPercent(s, neat.configuration.survivalRate)
    );
    return neat;
  }

  /**
   * Remove X percent items of a sorted array
   *
   * @param {any[]} items An array of object.
   * @return {any[]} the truncated array
   */
  static removeXPercent(items: any[], rate) {
    const removeIndex = Math.floor((1 - rate) * items.length);
    return items.slice(removeIndex, items.length);
  }

  /**
   * Compute the adjusted fitness of each phenotype of a Neat project.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} A Neat object whose phenotypes have an adjusted fitness updated property.
   */
  static computeFitness(neat: Neat): Neat {
    neat.population.forEach((phenotype) => {
      phenotype.fitness = neat.configuration.fitnessFunction(phenotype);
      phenotype.adjustedFitness = NeatUtils.computeAdjustedFitness(
        phenotype,
        neat
      );
    });
    return neat;
  }

  /**
   * Speciate the population of a Neat object.
   * The adjusted fitness of each phenotype should have been updated before this operation
   *
   * @param {Neat} neat A neat object.
   * @return {Genome[][]} An array of species.
   */
  static speciatePopulation(neat: Neat): Genome[][] {
    const { distanceConfiguration } = neat.configuration;
    // Pick random representant of actual species
    const representants = neat.species.map((s) => NeatUtils.randomPick(s));
    const newSpecies = representants.map((r) => []);
    // Sort population in a new species array
    neat.population.forEach((p) => {
      let rIndex = 0; // The representant index
      while (rIndex < representants.length) {
        // Compute distance between the representant and the tested genome
        const distance = NeatUtils.computeDistance({
          genomes: [representants[rIndex], p.genome],
          distanceConfiguration,
        });
        // If the two are compatible, push the genome into newSpecies with the same rIndex
        if (distance <= distanceConfiguration.compatibilityThreshold) {
          newSpecies[rIndex].push(p.genome);
          return;
        } else if (rIndex === representants.length - 1) {
          representants.push(p.genome);
          newSpecies.push([p.genome]);
          return;
        } else rIndex++;
      }
    });
    neat.species = newSpecies;
    return newSpecies;
  }

  static mutatePopulation(neat: Neat) {
    const {
      addAxonGene,
      addNeuronGene,
      changeAxonGeneWeight,
    } = neat.configuration.mutationRates;
    neat.species.forEach((s) => {
      s.forEach((g) => {
        NeatUtils.randomDo(addAxonGene) && NeatUtils.addAxonMutation(g, s);
        NeatUtils.randomDo(addNeuronGene) && NeatUtils.addNeuronMutation(g, s);
        NeatUtils.randomDo(changeAxonGeneWeight) &&
          NeatUtils.changeWeightMutation(g);
      });
    });
  }

  /**
   * Mutate a genome with a "add neuron mutation"
   * We must provide the array of genomes of the same species to make innovation tracking.
   *
   * @param {Genome} genome The genome to mutate.
   * @param {Genome[]} genomes TAn array of genomes of the same species.
   * @return {Genome[]} An array of species.
   */
  static addNeuronMutation(genome: Genome, genomes: Genome[]) {
    // Get all axonGenes in the concerned species
    const allAxonGenes = genomes.map((g) => g.axonGenes).flat();
    // Pick randomly an existing axon gene.
    const axonToMutate = NeatUtils.randomPick(genome.axonGenes);
    // Disable the connexion
    axonToMutate.active = false;
    // Get the innovation number for this mutation
    const innovation = NeatUtils.getInnovationFromNeuronMutation(
      axonToMutate,
      allAxonGenes
    );
    // create a new neuron gene
    const neuronGene = new NeuronGene({ innovation });
    // create two new axons folowing instructions given in "#Node Mutation" of the documentation (neat-implementation)
    const { input, output } = axonToMutate;
    const axonGeneIn = new AxonGene({
      weight: 1,
      output: neuronGene,
      input,
      innovation,
    });
    const axonGeneOut = new AxonGene({
      weight: axonToMutate.weight,
      input: neuronGene,
      output,
      innovation,
    });
    // Push the new axonGenes into the genome
    genome.axonGenes.push(axonGeneIn, axonGeneOut);
    // Push the new neuronGene into the genome
    genome.neuronGenes.push(neuronGene);
    return genome;
  }

  /**
   * Retuns the innovation number to apply for an "add node mutation".
   *
   * @param {AxonGene} axonGene The axonGene where the new neuron will be placed.
   * @param {AxonGene[]} axonGenes an array of axonGenes of the same species.
   * @return {number} The innovation number.
   */
  static getInnovationFromNeuronMutation(
    axonGene: AxonGene,
    axonGenes: AxonGene[]
  ): number {
    // Get max innovation number
    const maxInnovation = NeatUtils.getMaxInnovation(axonGenes);
    // get back input and output neuron genes
    const { input, output } = axonGene;
    // Get all axons that have the same input and output
    const sameInputAxonGenes = axonGenes.filter((ag) => ag.input === input);
    const sameOutputAxonGenes = axonGenes.filter((ag) => ag.output === output);
    let innovation = maxInnovation + 1;
    // Check if the structural innovation already exists
    sameInputAxonGenes.forEach((iag) => {
      const samePair = sameOutputAxonGenes.find(
        (oag) => oag.input === iag.output
      );
      samePair !== undefined && (innovation = iag.innovation);
    });
    return innovation;
  }

  /**
   * Mutate a genome with a "add connexion mutation"
   * Wu must provide the array of genomes of the same species to make innovation tracking
   * and to avoid recurrent mutations.
   *
   * @param {Genome} genome The genome to mutate.
   * @param {Genome[]} genomes TAn array of genomes of the same species.
   * @return {Genome} The mutated genome.
   */
  static addAxonMutation(genome: Genome, genomes: Genome[]) {
    // Get all axonGenes in the concerned species
    const allAxonGenes = genomes.map((g) => g.axonGenes).flat();
    // Get the max innovation number of all genes
    const maxInnovation = NeatUtils.getMaxInnovation(allAxonGenes);
    // Create a new Axon by picking random NeuronGene
    const input = NeatUtils.randomPick(genome.neuronGenes);
    const output = NeatUtils.randomPick(genome.neuronGenes);
    // TODO - can connect and retry !!!!
    const axonGene = new AxonGene({ input, output, weight: Math.random() });
    // Do nothing if the new connexion is recurrent
    if (NeatUtils.isConnexionRecurent(axonGene, allAxonGenes)) {
      return;
    }
    // Retreive the same innovation in the genes array
    const innovationIndex =
      allAxonGenes.find((g) => g.input === input && g.output === output)
        ?.innovation || -1;
    // if the same innovation exists, apply the same innovation number to the mutated gene
    // if not, increment the max innovation number and apply it
    axonGene.innovation =
      innovationIndex !== -1 ? innovationIndex : maxInnovation + 1;
    genome.axonGenes.push(axonGene);
    // Retun the mutated genome
    return genome;
  }

  /**
   * Mutate a gene by picking randomly a gene and assign it a random weight
   *
   * @param {AxonGene} axonGene The connexion gene to test.
   * @param {AxonGene[]} axonGenes An array of all axionGenes.
   * @return {AxonGene} the mutated axon gene.
   */
  static changeWeightMutation(genome: Genome) {
    const gene = NeatUtils.randomPick(genome.axonGenes);
    gene.weight = Math.random();
    return gene;
  }

  static crossoverPopulation(neat: Neat) {}

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

  /******************************************************/
  /********************UTILITIES*************************/
  /******************************************************/

  /**
   * Check if provided argument is a positive integer.
   *
   * @param {any} n the variable to verify.
   */
  static isPositiveInteger(n: any) {
    return Number.isInteger(n) && n >= 0;
  }

  /**
   * Check the configuration object provided by user. Throw error if any.
   *
   * @param {Partial<INeatConfiguration>} configuration the configuration object.
   */
  static checkConfiguration(configuration: Partial<INeatConfiguration>) {
    if (!NeatUtils.isPositiveInteger(configuration.maxEpoch)) {
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

  static randomPick<T = any>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  static randomDo<T = any>(rate): boolean {
    return Math.random() > rate;
  }

  static getMaxInnovation(genes: AxonGene[]): number {
    return genes.reduce(
      (acc, cur) => (acc >= cur.innovation ? acc : cur.innovation),
      0
    );
  }

  /**
   * Check wether or not a connexion is recurrent within a stack of connexion
   *
   * @param {AxonGene} axonGene The connexion gene to test.
   * @param {AxonGene[]} axonGenes An array of all axionGenes.
   * @return {boolean} true if the connexion is recurrent, else false.
   */
  static isConnexionRecurent(
    axonGene: AxonGene,
    axonGenes: AxonGene[]
  ): boolean {
    let input = axonGene.input;
    let stack = [axonGene];
    while (stack.length !== 0) {
      let connection = stack.shift();
      if (connection.output === input) return true;
      stack.push(
        ...axonGenes.filter((gene) => gene.input === connection.output)
      );
    }
    return false;
  }

  /**
   * Compute the distance between two Genomes using
   * [equation 2](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
   *
   * @param {[Genome, Genome]} genomes An array of exactly two Genomes.
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
    return (
      NeatUtils.computeNumberOfMissmatchGenes(genomes) -
      NeatUtils.computeNumberOfExcessGenes(genomes)
    );
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
   * Compute the adjusted fitness of each phenotype of a Neat project.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} A Neat object whose phenotypes have an adjusted fitness updated property.
   */
  static computeAdjustedFitness(phenotype: Phenotype, neat: Neat): number {
    const { fitnessFunction, distanceConfiguration } = neat.configuration;
    const fitness = fitnessFunction(phenotype);
    let sumSh = neat.population.reduce((acc, cur) => {
      const d = this.computeDistance({
        genomes: [cur.genome, phenotype.genome],
        distanceConfiguration: distanceConfiguration,
      });
      return (
        acc +
        NeatUtils.shFunction(d, distanceConfiguration.compatibilityThreshold)
      );
    }, 0);
    return fitness / sumSh;
  }

  static shFunction(d: number, compatibilityThreshold: number) {
    return d > compatibilityThreshold ? 0 : 1;
  }

  /**
   * For each , get the numper of individuals for the next generation
   *
   * @param {Neat} neat A neat object.
   * @return {number[]} An array of number representing the total number of individual for the next generation.
   */
  static getPopulationSizeBySpecies(neat: Neat): number[] {
    const fs = neat.species.map((s) =>
      s.reduce((acc, cur) => acc + cur.phenotype.adjustedFitness, 0)
    );
    const totFs = fs.reduce((cur, acc) => acc + cur, 0);
    return fs.map((f) => (f / totFs) * neat.configuration.populationSize);
  }

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
  static generatePerceptron = (shape: number[]) => {
    NeatUtils.checkShape(shape);
    const genome = new Genome({ shape });
    let neurons: Neuron[] = [];
    let axons: Axon[] = [];

    // Create neurons
    // For each layer
    shape.forEach((layer, layerIndex) => {
      // For each neuron in the layer
      new Array(layer).fill(0).forEach((n) => {
        const type =
          layerIndex === 0
            ? NeuronType.INPUT
            : layerIndex > 0 && layerIndex < shape.length - 1
            ? NeuronType.HIDDEN
            : NeuronType.OUTPUT;
        const neuronGene = new NeuronGene({ type });
        const neuron = new Neuron(neuronGene, { type, layerIndex });
        neurons.push(neuron);
      });
    });

    // Create array of axons
    neurons.forEach((neuron) => {
      if (neuron.type === NeuronType.OUTPUT) return;
      const nextLayerNeurons = neurons.filter(
        (n) => n.layerIndex === neuron.layerIndex + 1
      );
      // create a connexion with each neuron of next layer
      nextLayerNeurons.forEach((n) => {
        const axonGene = new AxonGene();
        const axon = new Axon(axonGene, { input: neuron, output: n });
        axons.push(axon);
      });
    });
    return new Phenotype(genome, { neurons, axons, shape });
  };
}

export { NeatUtils };
