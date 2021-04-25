import { Connexion } from "./Connexion";
import {
  ActivationType,
  IdistanceConfiguration,
  IGene,
  IgeneratePerceptronParams,
  INeatConfiguration,
  NodeType,
} from "./models";
import { Neat } from "./Neat";
import { Network } from "./Network";
import { Node } from "./Node";

/**
 * Class containing utiliity functions for the NEAT algorithm .
 * [See more information about implementation](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
 */
class NeatUtils {
  /**
   * Initialize the population of a Neat object
   *
   * @param {Neat} neat A neat object.
   * @return {Network[]} the population as an array of networks
   */
  static initializePopulation(neat: Neat): Network[][] {
    const initialSpecies: Network[][] = [[]];
    new Array(neat.configuration.populationSize).fill(0).forEach(() => {
      const { shape, activationType } = neat.configuration;
      const activationFunction = NeatUtils.activationFunctions[activationType];
      const newNetwork = new Network({ shape, activationFunction });
      initialSpecies[0].push(newNetwork);
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
      s.sort((a, b) => a.adjustedFitness - b.adjustedFitness)
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
   * Compute the adjusted fitness of each network of a Neat project.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} A Neat object whose networks have an adjusted fitness updated property.
   */
  static computeFitness(neat: Neat): Neat {
    neat.population.forEach((network) => {
      network.fitness = neat.configuration.fitnessFunction(network);
      //console.log(network.fitness);
      network.adjustedFitness = NeatUtils.computeAdjustedFitness(network, neat);
    });
    return neat;
  }

  /**
   * Speciate the population of a Neat object.
   * The adjusted fitness of each network should have been updated before this operation
   *
   * @param {Neat} neat A neat object.
   * @return {Network[][]} An array of species.
   */
  static speciatePopulation(neat: Neat): Network[][] {
    const { distanceConfiguration } = neat.configuration;
    // Pick random representant of actual species
    // console.log(neat.species);
    const representants = neat.species.map((s) => NeatUtils.randomPick(s));
    // Create a new Species array
    const newSpecies = representants.map((r) => [r]);
    // Sort population in a new species array
    neat.population.forEach((p) => {
      // Do nothing if it is a representant (already sorted in species)
      if (representants.findIndex((r) => r === p) !== -1) return;
      let rIndex = 0; // The representant index
      while (rIndex < representants.length) {
        // Compute distance between the representant and the tested network
        const distance = NeatUtils.computeDistance({
          networks: [representants[rIndex], p],
          distanceConfiguration,
        });
        // console.log(distance);
        // If the two are compatible, push the network into newSpecies with the same rIndex
        if (distance <= distanceConfiguration.compatibilityThreshold) {
          newSpecies[rIndex].push(p);
          return;
          // Else set  a new representant of a new Species
        } else if (rIndex === representants.length - 1) {
          representants.push(p);
          newSpecies.push([p]);
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
      addConnexion,
      addNode,
      changeConnexionWeight,
    } = neat.configuration.mutationRates;
    neat.population.forEach((p) => {
      NeatUtils.randomDo(addConnexion) &&
        NeatUtils.addConnexionMutation(p, neat);
      NeatUtils.randomDo(addNode) && NeatUtils.addNodeMutation(p, neat);
      NeatUtils.randomDo(changeConnexionWeight) &&
        NeatUtils.changeWeightMutation(p);
    });
    return neat;
  }

  /**
   * Mutate a network with a "add node mutation"
   * We must provide the array of networks of the same species to make innovation tracking.
   *
   * @param {Network} network The network to mutate.
   * @param {Network[]} networks An array of networks of the same species.
   * @return {Network[]} An array of species.
   */
  static addNodeMutation(network: Network, neat: Neat) {
    // Get all connexions in the concerned species
    const allConnexions = neat.population.map((g) => g.connexions).flat();
    if (allConnexions.length === 0) return;
    // Pick randomly an existing connexion gene.
    const connexionToMutate = NeatUtils.randomPick(
      network.connexions.filter((c) => c.active)
    );
    // Return if no connexion
    if (!connexionToMutate) return;
    // Disable the connexion
    connexionToMutate.active = false;
    const { input, output } = connexionToMutate;
    // Retreive the innovation number for this mutation
    const innovation = NeatUtils.getNodeInnovation(connexionToMutate, neat);
    // create a new node gene
    const node = new Node({ innovation });
    network.addNode(node);
    // create two new connexions following instructions given in "#Node Mutation" of the documentation (neat-implementation)
    const connexionIn = new Connexion({
      weight: 1,
      output: node,
      input,
    });
    connexionIn.innovation = NeatUtils.getConnexionInnovation(
      connexionIn,
      neat
    );
    network.connexions.push(connexionIn);
    const connexionOut = new Connexion({
      weight: connexionToMutate.weight,
      input: node,
      output,
    });
    connexionOut.innovation = NeatUtils.getConnexionInnovation(
      connexionOut,
      neat
    );
    // Push the new connexions into the network
    network.connexions.push(connexionOut);
    // Push the new node into the network
    return network;
  }

  static getNodeInnovation(connexion: Connexion, neat: Neat): number {
    const allConnexions = neat.population.map((p) => p.connexions).flat();
    const { input, output } = connexion;
    const allConnexionfromInput = allConnexions.filter(
      (c) => c.input.innovation === input.innovation
    );
    const allConnexionfromOutput = allConnexions.filter(
      (c) => c.output.innovation === output.innovation
    );
    const sameConnexion = allConnexionfromInput.find(
      (cInput) =>
        allConnexionfromOutput.find(
          (cOutput) => cOutput.input.innovation === cInput.output.innovation
        ) !== undefined
    );
    return (
      sameConnexion?.output.innovation ||
      NeatUtils.getMaxNodeInnovation(neat) + 1
    );
  }

  /**
   * Mutate a network with an "add connexion mutation"
   * Wu must provide the array of networks of the same species to make innovation tracking
   * and to avoid recurrent mutations.
   *
   * @param {Network} network The network to mutate.
   * @param {Network[]} networks TAn array of networks of the same species.
   * @return {Network} The mutated network.
   */
  static addConnexionMutation(network: Network, neat: Neat) {
    // pick an neron to be the input - don't allow to be of type output
    const input = NeatUtils.randomPick(
      network.nodes.filter((n) => n.type !== NodeType.OUTPUT)
    );
    // pick an neron to be the output - don't allow to be of type input
    const output = NeatUtils.randomPick(
      network.nodes.filter((n) => n.type !== NodeType.INPUT)
    );
    // Create a new Connexion by picking random Node
    const connexion = new Connexion({ input, output, weight: Math.random() });
    // Do nothing if the new connexion is recurrent
    if (NeatUtils.isConnexionRecurent(connexion, network.connexions)) {
      return; // TODO - retry !!!!
    }
    // Do nothing if the new connexion already exists
    if (
      network.connexions.find((c) => c.input === input && c.output === output)
    ) {
      return; // TODO - retry !!!!
    }
    // Retreive the innovation number for this mutation
    const innovation = NeatUtils.getConnexionInnovation(connexion, neat);
    connexion.innovation = innovation;
    network.connexions.push(connexion);
    // Retun the mutated network
    return network;
  }

  static getConnexionInnovation(connexion: Connexion, neat: Neat): number {
    const allConnexions = neat.population.map((p) => p.connexions).flat();
    const innovationIndex = allConnexions.find(
      (g) =>
        g.input.innovation === connexion.input.innovation &&
        g.output.innovation === connexion.output.innovation
    )?.innovation;
    // if the same innovation exists, apply the same innovation number to the mutated gene
    // if not, increment the max innovation number and apply it
    return innovationIndex !== undefined
      ? innovationIndex
      : NeatUtils.getMaxConnexionInnovation(neat) + 1;
  }

  /**
   * Mutate a gene by picking randomly a gene and assign it a random weight
   *
   * @param {Connexion} connexion The connexion gene to test.
   * @param {Connexion[]} connexions An array of all axionGenes.
   * @return {Connexion} the mutated connexion gene.
   */
  static changeWeightMutation(network: Network) {
    const gene = NeatUtils.randomPick(network.connexions);
    if (!gene) return;
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
        // Pick randomly two networks among th best performers (defined by the rate reproducerRate of configuration)
        const bestIndex = Math.floor(
          s.length * neat.configuration.reproducerRate
        );
        const bestNetworks = s
          .sort((a, b) => a.fitness - b.fitness)
          .filter((g, i) => i >= bestIndex);

        if (bestNetworks.length > 2) {
          // Get a new gene from a crossover operation
          // TODO - retry if the same networks are picked
          const newNetwork = NeatUtils.crossOverTwoNetworks([
            NeatUtils.randomPick(bestNetworks),
            NeatUtils.randomPick(bestNetworks),
          ]);
          s.push(newNetwork);
        }
      }
    });
    // return the neat object with updated population
    return neat;
  }

  /**
   * Create a neaw network from crossing two networks
   *
   * @param {Network[]} networks An array of two networks.
   * @return {Network} the created network.
   */
  static crossOverTwoNetworks(networks: [Network, Network]): Network {
    if (networks[0] === networks[1]) return networks[0]; // This shouldn't happen
    // get the index of the best performing network
    const bestNetworkIndex = networks.reduce(
      (acc, cur, i) => (acc <= cur.fitness ? i : acc),
      0
    );
    // Get Connexion genes in an array indexed by innovation for the two genes.
    const genes = networks.map(
      (g) => NeatUtils.getGenesIndexedByInnovation(g.connexions) as Connexion[]
    );
    // Zip the two innovation arrays into one
    const zipedGenes = NeatUtils.zipArrays<Connexion>(genes[0], genes[1]);
    // Create the new Network to be returned with empty genes with same initial shape
    const newNetwork = new Network({
      shape: networks[0].shape,
      activationFunction: networks[0].activationFunction,
    });
    // For each innovation of the innovation array
    zipedGenes.forEach((agPair) => {
      // Create a reference for the new connexion
      let agReference: Connexion;
      // If the innovation is present is both genes
      if (agPair[0] && agPair[1]) {
        // Pick randomly the gene to copy
        const r = Math.random() > 0.5 ? 1 : 0;
        agReference = agPair[r];
      }
      // Else pick the best performer structure
      else {
        agReference = agPair[bestNetworkIndex]; // ! can be undefined
      }

      if (agReference !== undefined) {
        // Use this function to make sure nodes and genes are correctly connected
        NeatUtils.copyConnexionToNetwork(agReference, newNetwork);
      }
    });
    return newNetwork;
  }

  /**
   * copy a connexion gene into a network.
   * Make sure that the cloned nodes integrate well in the network structure
   *
   * @param {Connexion} connexion the connexion gene to copy.
   * @return {Network} the network where the connexion gene will be copied.
   */
  static copyConnexionToNetwork(connexion: Connexion, network: Network) {
    // Don't forget to clone the reference !
    const newConnexion = connexion.clone();
    // The clone has also cloned the nodes, let's check if they already exist
    const existingInputNode = network.nodes.find(
      (ng) => (ng.innovation = newConnexion.input.innovation)
    );
    const existingOutputNode = network.nodes.find(
      (ng) => (ng.innovation = newConnexion.output.innovation)
    );
    if (existingInputNode) {
      newConnexion.input = existingInputNode;
    } else {
      network.nodes.push(existingInputNode);
    }
    if (existingOutputNode) {
      newConnexion.output = existingOutputNode;
    } else {
      network.nodes.push(existingOutputNode);
    }
    network.connexions.push(newConnexion);
    return network;
  }

  static evaluateCriteria(neat: Neat): boolean {
    return false;
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
  static randomDo(rate: number): boolean {
    return Math.random() < rate;
  }

  /**
   * Return max innovation number found in a neat object
   *
   * @param {Neat} neat An array of genes
   * @return {number} the max innovation number found
   */
  static getMaxNodeInnovation(neat: Neat): number {
    const allInnovations: number[] = neat.population
      .map((p) => p.nodes.map((c) => c.innovation))
      .flat();
    return allInnovations.reduce((acc, cur) => Math.max(acc, cur), 0);
  }

  /**
   * Return max innovation number found in a neat object
   *
   * @param {Neat} neat An array of genes
   * @return {number} the max innovation number found
   */
  static getMaxConnexionInnovation(neat: Neat): number {
    const allInnovations: number[] = neat.population
      .map((p) => p.connexions.map((c) => c.innovation))
      .flat();
    return allInnovations.reduce((acc, cur) => Math.max(acc, cur), 0);
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
   * @param {Connexion} connexion The connexion gene to test.
   * @param {Connexion[]} connexions An array of all axionGenes.
   * @return {boolean} true if the connexion is recurrent, else false.
   */
  static isConnexionRecurent(
    connexion: Connexion,
    connexions: Connexion[]
  ): boolean {
    let output = connexion.output;
    let stack = [connexion];
    while (stack.length !== 0) {
      let connection = stack.shift();
      if (connection.input === output) return true;
      stack.push(
        ...connexions.filter((gene) => gene.output === connection.input)
      );
    }
    return false;
  }

  /**
   * Check wether or not a connexion is recurrent within a stack of connexions
   *
   * @param {Connexion} connexion The connexion gene to test.
   * @param {Connexion[]} connexions An array of all axionGenes.
   * @return {boolean} true if the connexion is recurrent, else false.
   */
  static isLinkRecurent(
    connexion: Connexion,
    connexions: Connexion[]
  ): boolean {
    let max = 200;
    let input = connexion.input;
    let stack = [connexion];
    while (stack.length !== 0 && max > 0) {
      let connection = stack.shift();
      if (input === connection.output) {
        return true;
      }
      stack.push(
        ...connexions.filter(
          (connexion) =>
            connexion.input === connection.output &&
            connexion.output.type !== NodeType.OUTPUT
        )
      );
      max--;
    }
    return false;
  }

  /**
   * Compute the distance between two Networks using
   * [equation 2](https://github.com/onino-js/NEAT/blob/main/documentation/neat-implementation.md)
   *
   * @param {[Network, Network]} networks An array of exactly two Networks.
   * @return {number} the distance between the two Networks.
   */
  static computeDistance({
    networks,
    distanceConfiguration,
  }: {
    networks: [Network, Network];
    distanceConfiguration: IdistanceConfiguration;
  }): number {
    const { c1, c2, c3 } = distanceConfiguration;
    const E = NeatUtils.computeNumberOfExcessGenes(networks);
    const D = NeatUtils.computeNumberOfDisjointGenes(networks);
    const W = NeatUtils.computeAverageWieghtDifference(networks);
    const N = Math.max(
      networks[0].connexions.length,
      networks[1].connexions.length
    );
    //console.log(E, D, W);
    return N === 0 ? 0 : (c1 * E) / N + (c2 * D) / N + c3 * W;
  }

  /**
   * Compute the number of genes who missmatch between two networks.
   *
   * @param {[Network, Network]} networks An array of exactly two Networks.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfMissmatchGenes(networks: [Network, Network]): number {
    const set1 = new Set(networks[0].connexions.map((c) => c.innovation));
    const set2 = new Set(networks[1].connexions.map((c) => c.innovation));
    const fullSet = Array.from(set1).concat(Array.from(set2));
    const doubleRemoved = new Set(fullSet);
    const diff = fullSet.length - doubleRemoved.size;
    return fullSet.length - 2 * diff;
  }

  /**
   * Compute the number of disjoint genes between two networks.
   *
   * @param {[Network, Network]} networks An array of exactly two Networks.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfDisjointGenes(networks: [Network, Network]): number {
    if (
      NeatUtils.computeNumberOfMissmatchGenes(networks) -
        NeatUtils.computeNumberOfExcessGenes(networks) <
      0
    ) {
      console.warn(
        "Error:",
        networks.map((n) => n.clone())
      );
    }
    return (
      NeatUtils.computeNumberOfMissmatchGenes(networks) -
      NeatUtils.computeNumberOfExcessGenes(networks)
    );
  }

  /**
   * Compute the number of excess genes between two networks.
   *
   * @param {[Network, Network]} networks An array of exactly two Networks.
   * @return {number} the number of disjoint genes.
   */
  static computeNumberOfExcessGenes(networks: [Network, Network]): number {
    return Math.abs(
      networks[0].connexions.length - networks[1].connexions.length
    );
  }

  /**
   * Compute the average weight difference of matching genes between two networks.
   *
   * @param {[Network, Network]} networks An array of exactly two Networks.
   * @return {number} the average weight difference of matching genes.
   */
  static computeAverageWieghtDifference(networks: [Network, Network]): number {
    let nbOdMatchingGene = 0;
    let totalDifference = 0;
    networks[0].connexions.forEach((ag) => {
      const twin = networks[1].connexions.find(
        (_ag) => _ag.innovation === ag.innovation
      );
      if (twin !== undefined) {
        nbOdMatchingGene += 1;
        totalDifference += Math.abs(twin.weight - ag.weight);
      }
    });
    return nbOdMatchingGene ? totalDifference / nbOdMatchingGene : 0;
  }

  static getGenesIndexedByInnovation(genes: IGene[]): IGene[] {
    let result = [];
    genes.forEach((g) => {
      result[g.innovation] = g;
    });
    return result;
  }

  /**
   * Compute the adjusted fitness of each network of a Neat project.
   * The "normal" fitness should have been computed before.
   *
   * @param {Neat} neat A neat object.
   * @return {Neat} A Neat object whose networks have an adjusted fitness updated property.
   */
  static computeAdjustedFitness(network: Network, neat: Neat): number {
    const { distanceConfiguration } = neat.configuration;
    const fitness = network.fitness;
    let sumSh = neat.population.reduce((acc, cur) => {
      const d = this.computeDistance({
        networks: [cur, network],
        distanceConfiguration: distanceConfiguration,
      });
      //  console.log(d);
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
      s.reduce((acc, cur) => acc + cur.adjustedFitness, 0)
    );
    const totFs = fs.reduce((cur, acc) => acc + cur, 0);
    return fs.map((f) => (f / totFs) * neat.configuration.populationSize);
  }

  /**
   * Get an array of Node object from a shape.
   *
   * @param {number[]} shape A shape object.
   * @return {Node[]} An array of Node with number of input, hidden and output nodes defined in shape.
   */
  static getNodesFromShape(shape: number[]) {
    let res: Node[] = [];
    shape.forEach((layer, layerIndex) => {
      new Array(layer).fill(0).forEach((n) => {
        const type =
          layerIndex === 0
            ? NodeType.INPUT
            : layerIndex > 0 && layerIndex < shape.length - 1
            ? NodeType.HIDDEN
            : NodeType.OUTPUT;
        res.push(new Node({ type }));
      });
    });
    return res;
  }

  /**
   * Create symetric, fully connected network with arbitrary number of hiddens layers
   * 3, 5, 5, 2] represent a graph with 3 inputs, 2 outputs, 2 hiddens layers of 5 nodes each.
   *  Nodes of a layer is connected to all nodes of next layer
   *
   * @param {number[]} shape A shape object.
   * @param {boolean} randomWeight apply random weight on connexions creation or not.
   * @return {Network} A perceptron network
   */
  static generatePerceptron = ({
    shape,
    activationType = ActivationType.SIGMOID,
    randomWeight,
  }: IgeneratePerceptronParams) => {
    // Check shape and throw error if any
    NeatUtils.checkShape(shape);
    // Get back the activation function
    const activationFunction = NeatUtils.activationFunctions[activationType];
    const network = new Network({ shape, activationFunction });

    // Create array of connexions
    network.nodes.forEach((node) => {
      if (node.type === NodeType.OUTPUT) return;
      const nextLayerNodes = network.nodes.filter(
        (n) => n.layerIndex === node.layerIndex + 1
      );
      // create a connexion with each node of next layers
      nextLayerNodes.forEach((n) => {
        const connexion = new Connexion(
          { input: node, output: n },
          randomWeight
        );
        network.connexions.push(connexion);
      });
    });
    return network;
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
