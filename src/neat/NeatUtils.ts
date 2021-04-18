import { Phenotype, Neuron, Axon } from "./Phenotype";
import { AxonGene, Genome, NeuronGene } from "./Genome";
import {
  ActivationType,
  IdistanceConfiguration,
  IGene,
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
  static initializePopulation(neat: Neat): Genome[][] {
    const initialSpecies: Genome[][] = [[]];
    new Array(neat.configuration.populationSize).fill(0).forEach(() => {
      const newGenome = new Genome({ shape: neat.configuration.shape });
      initialSpecies[0].push(newGenome);
    });
    neat.species = initialSpecies;
    return initialSpecies;
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
   * Remove X percent items of a sorted array.
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
    // Create a new Species array
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
          // Else set  a new representant of a new Species
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

  /**
   * Mutate the population of a Neat object.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} The neat object with a new population.
   */
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
    return neat;
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
    // Try to find an axonGene in all genes with same input and output innovations
    const sameAxonGene = allAxonGenes.find(
      (ag) =>
        ag.input.innovation === input.innovation &&
        ag.output.innovation === output.innovation
    );
    // If found, assign the same innovation, else, assign the incremented global innovation number
    const innovation =
      sameAxonGene?.innovation || NeatUtils.getMaxInnovation(allAxonGenes) + 1;
    // create a new neuron gene
    const neuronGene = new NeuronGene({ innovation });
    // create two new axons following instructions given in "#Node Mutation" of the documentation (neat-implementation)
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
   * Mutate a genome with an "add connexion mutation"
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

    // pick an neron to be the input - don't allow to be of type output
    const input = NeatUtils.randomPick(
      genome.neuronGenes.filter((n) => n.type !== NeuronType.OUTPUT)
    );
    // pick an neron to be the output - don't allow to be of type input
    const output = NeatUtils.randomPick(
      genome.neuronGenes.filter((n) => n.type !== NeuronType.INPUT)
    );

    // Create a new Axon by picking random NeuronGene
    const axonGene = new AxonGene({ input, output, weight: Math.random() });
    // Do nothing if the new connexion is recurrent
    if (NeatUtils.isConnexionRecurent(axonGene, allAxonGenes)) {
      return; // TODO - retry !!!!
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

  /**
   * Perfom corssovers on each species of the population to fill
   * the maximum number of individuals
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} The neat object with a new population.
   */
  static crossoverPopulation(neat: Neat) {
    // First, get the next population size
    const newSizes = NeatUtils.getPopulationSizeBySpecies(neat);
    // For each species of the population
    neat.species.forEach((s, i) => {
      // As long as the population of the species is not full
      while (s.length <= newSizes[i]) {
        // Pick randomly two genomes among th best performers (defined by the rate reproducerRate of configuration)
        const bestIndex = Math.floor(
          s.length * neat.configuration.reproducerRate
        );
        const bestGenomes = s
          .sort((a, b) => a.phenotype.fitness - b.phenotype.fitness)
          .filter((g, i) => i >= bestIndex);

        if (bestGenomes.length > 2) {
          // Get a new gene from a crossover operation
          // TODO - retry if the same genomes are picked
          const newGenome = NeatUtils.crossOverTwoGenomes([
            NeatUtils.randomPick(bestGenomes),
            NeatUtils.randomPick(bestGenomes),
          ]);
          s.push(newGenome);
        }
      }
    });
    // return the neat object with updated population
    return neat;
  }

  /**
   * Create a neaw genome from crossing two genomes
   *
   * @param {Genome[]} genomes An array of two genomes.
   * @return {Genome} the created genome.
   */
  static crossOverTwoGenomes(genomes: [Genome, Genome]): Genome {
    if (genomes[0] === genomes[1]) return genomes[0]; // This shouldn't happen
    // get the index of the best performing genome
    const bestGenomeIndex = genomes.reduce(
      (acc, cur, i) => (acc <= cur.phenotype.fitness ? i : acc),
      0
    );
    // Get Axon genes in an array indexed by innovation for the two genes.
    const genes = genomes.map(
      (g) => NeatUtils.getGenesIndexedByInnovation(g.axonGenes) as AxonGene[]
    );
    // Zip the two innovation arrays into one
    const zipedGenes = NeatUtils.zipArrays<AxonGene>(genes[0], genes[1]);
    // Create the new Genome to be returned with empty genes with same initial shape
    const newGenome = new Genome({ shape: genomes[0].shape });
    // For each innovation of the innovation array
    zipedGenes.forEach((agPair) => {
      // Create a reference for the new axonGene
      let agReference: AxonGene;
      // If the innovation is present is both genes
      if (agPair[0] && agPair[1]) {
        // Pick randomly the gene to copy
        const r = Math.random() > 0.5 ? 1 : 0;
        agReference = agPair[r];
      }
      // Else pick the best performer structure
      else {
        agReference = agPair[bestGenomeIndex]; // ! can be undefined
      }

      if (agReference !== undefined) {
        // Use this function to make sure neurons and genes are correctly connected
        NeatUtils.copyAxonGeneToGenome(agReference, newGenome);
      }
    });
    return newGenome;
  }

  /**
   * copy an axon gene into a genome.
   * Make sure that the cloned neurons integrate well in the genome structure
   *
   * @param {AxonGene} axonGene the axon gene to copy.
   * @return {Genome} the genome where the axon gene will be copied.
   */
  static copyAxonGeneToGenome(axonGene: AxonGene, genome: Genome) {
    // Don't forget to clone the reference !
    const newAxonGene = axonGene.clone();
    // The clone has also cloned the neurons, let's check if they already exist
    const existingInputNeuron = genome.neuronGenes.find(
      (ng) => (ng.innovation = newAxonGene.input.innovation)
    );
    const existingOutputNeuron = genome.neuronGenes.find(
      (ng) => (ng.innovation = newAxonGene.output.innovation)
    );
    if (existingInputNeuron) {
      newAxonGene.input = existingInputNeuron;
    } else {
      genome.neuronGenes.push(existingInputNeuron);
    }
    if (existingOutputNeuron) {
      newAxonGene.output = existingOutputNeuron;
    } else {
      genome.neuronGenes.push(existingOutputNeuron);
    }
    genome.axonGenes.push(newAxonGene);
    return genome;
  }

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

  /**
   * Pick randomly an item into an array
   *
   * @param {any[]} items An array of items
   * @return {any} the picked item
   */
  static randomPick<T = any>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Return true with a provided probability, else false.
   *
   * @param {number} rate The probability to return true
   * @return {boolean} do you get lucky ?
   */
  static randomDo<T = any>(rate): boolean {
    return Math.random() > rate;
  }

  /**
   * Return max innovation number found in an array of genes
   *
   * @param {IGene[]} genes An array of genes
   * @return {number} the max innovation number found
   */
  static getMaxInnovation(genes: IGene[]): number {
    return genes.reduce(
      (acc, cur) => (acc >= cur.innovation ? acc : cur.innovation),
      0
    );
  }

  /**
   * Basic implementation of zip method on two arrays
   *
   */
  static zipArrays = <T = any>(a: T[], b: T[]) =>
    Array(Math.max(b.length, a.length))
      .fill(0)
      .map((_, i) => [a[i], b[i]]);

  /**
   * Check wether or not a connexion is recurrent within a stack of connexions
   *
   * @param {AxonGene} axonGene The connexion gene to test.
   * @param {AxonGene[]} axonGenes An array of all axionGenes.
   * @return {boolean} true if the connexion is recurrent, else false.
   */
  static isConnexionRecurent(
    axonGene: AxonGene,
    axonGenes: AxonGene[]
  ): boolean {
    let output = axonGene.output;
    let stack = [axonGene];
    while (stack.length !== 0) {
      let connection = stack.shift();
      if (connection.input === output) return true;
      stack.push(
        ...axonGenes.filter((gene) => gene.output === connection.input)
      );
    }
    return false;
  }

  /**
   * Check wether or not a connexion is recurrent within a stack of connexions
   *
   * @param {AxonGene} axonGene The connexion gene to test.
   * @param {AxonGene[]} axonGenes An array of all axionGenes.
   * @return {boolean} true if the connexion is recurrent, else false.
   */
  static isLinkRecurent(axon: Axon, axons: Axon[]): boolean {
    let max = 200;
    let input = axon.input;
    let stack = [axon];
    while (stack.length !== 0 && max > 0) {
      let connection = stack.shift();
      if (input === connection.output) {
        return true;
      }
      stack.push(
        ...axons.filter(
          (axon) =>
            axon.input === connection.output &&
            axon.output.type !== NeuronType.OUTPUT
        )
      );
      max--;
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
    let nbOdMatchingGene = 0;
    let totalDofference = 0;
    genomes[0].axonGenes.forEach((ag) => {
      const twin = genomes[1].axonGenes.find(
        (_ag) => _ag.innovation === ag.innovation
      )!;
      if (twin !== undefined) {
        nbOdMatchingGene += 1;
        totalDofference += Math.abs(twin.weight - ag.weight);
      }
    });
    return totalDofference / nbOdMatchingGene;
  }

  static getGenesIndexedByInnovation(genes: IGene[]): IGene[] {
    let result = [];
    genes.forEach((g) => {
      result[g.innovation] = g;
    });
    return result;
  }

  /**
   * Compute the adjusted fitness of each phenotype of a Neat project.
   * The "normal" fitness should have been computed before.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} A Neat object whose phenotypes have an adjusted fitness updated property.
   */
  static computeAdjustedFitness(phenotype: Phenotype, neat: Neat): number {
    const { distanceConfiguration } = neat.configuration;
    const fitness = phenotype.fitness;
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
   * @param {boolean} randomWeight apply random weight on axons creation or not.
   * @return {Phenotype} A perceptron network
   */
  static generatePerceptron = (shape: number[], randomWeight?: boolean) => {
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
      // create a connexion with each neuron of next layers
      nextLayerNeurons.forEach((n) => {
        const axonGene = new AxonGene();
        const axon = new Axon(
          { axonGene, input: neuron, output: n },
          randomWeight
        );
        axons.push(axon);
      });
    });
    return new Phenotype(genome, { neurons, axons, shape });
  };

  static activationFunctions = {
    [ActivationType.SIGMOID]: function (input: number): number {
      return 1 / (1 + Math.exp(-input));
    },

    [ActivationType.TANH]: function (input: number): number {
      return Math.tanh(input);
    },

    [ActivationType.RELU]: function (input: number): number {
      return input > 0 ? input : 0;
    },
  };
}

export { NeatUtils };
