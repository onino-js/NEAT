enum NeuronType {
  INPUT = "INPUT",
  HIDDEN = "HIDDEN",
  OUTPUT = "OUTPUT",
}

interface INeuronGeneParams {
  type?: NeuronType;
}

export class NeuronGene {
  public readonly id: string;
  public type: NeuronType = NeuronType.INPUT;

  constructor(opt?: INeuronGeneParams) {
    Object.assign(this, opt);
  }
}

export class AxonGene {
  public readonly id: string;
  public weight: number;
  public active: boolean;
  public input: NeuronGene;
  public output: NeuronGene;
  public innovation: number;
}

/** Class representing a genome manipulated by the neat algorithm */
export class Genotype {
  public neuronGenes: NeuronGene[];
  public axonGenes: AxonGene[];
  constructor(shape: [number, number, number]) {
    this.initialize(shape);
  }
  private initialize(shape: [number, number, number]) {
    this.addNeuronGenesByType(shape[0], NeuronType.INPUT);
    this.addNeuronGenesByType(shape[1], NeuronType.HIDDEN);
    this.addNeuronGenesByType(shape[2], NeuronType.OUTPUT);
  }
  private addNeuronGenesByType(n: number, type: NeuronType) {
    new Array(n)
      .fill(0)
      .forEach((s, i) => this.addNeuronGene(new NeuronGene({ type })));
  }
  private addNeuronGene(neuronGene: NeuronGene) {
    this.neuronGenes.push(neuronGene);
  }
}

export class Phenotype {
  public genotype: Genotype;
  public fitness: number;
  public outputs: number[] = [];
  constructor() {}
  public feedForward(inputs: number[]): number[] {
    return this.outputs;
  }
}

interface ImutationRates {
  addNeuronGene: number; // Mutation rate for adding a new neuron gene in the genome
  addAxonGene: number; // Mutation rate for adding a new axon gene in the genome
  removeNeuronGene: number; // Mutation rate for removing a neuron gene in the genome
  removeAxonGene: number; // Mutation rate for removing an axon gene in the genome
  changeAxonGeneWeight: number; // Mutation rate for changing the weight in an axion gene
}

export interface INeatConfiguration {
  populationSize: number; // The total population size of each generation
  mutationRates: ImutationRates; // An object representing mutation rates for each kind of mutation
  maxEpoch: number; // The maximum number of iteration of the NEAT algorithm
  shape: [number, number, number]; // The initial shape of the network. The first number is the number of inputs, then hiddens and outputs.
  distanceConfiguration: IdistanceConfiguration; // A object containing informations for the distance calculation. The distance between phenotypes is used to perform speciation.
}

export interface IdistanceConfiguration {
  c1: number; // Caonstant C1 of the compatibility function TODO - [link text](./../documentation/glossary.md)
  c2: number; // Caonstant C2 of the compatibility function TODO - Ref
  c3: number; // Caonstant C3 of the compatibility function TODO - Ref
  compatibilityThreshold: number; // If the distance between two phenotypes is below this value, they are considered to be of the same species
}

interface IfitnessFunction {
  (input: Phenotype): number; // User provided function to evaluate the fitness of a given phenotype.
}

const INITIAL_CONFIGURATION: INeatConfiguration = {
  populationSize: 200,
  mutationRates: {
    addNeuronGene: 0.05,
    addAxonGene: 0.05,
    removeNeuronGene: 0.05,
    removeAxonGene: 0.05,
    changeAxonGeneWeight: 0.05,
  },
  maxEpoch: 50,
  shape: [1, 0, 1],
  distanceConfiguration: {
    c1: 2,
    c2: 0.5,
    c3: 1,
    compatibilityThreshold: 1.5,
  },
};

export class Species {
  public genomes: Genotype[] = [];
  public addGenome(genome: Genotype) {
    this.genomes.push(genome);
  }
}

/** Class representing the NEAT algorithm */
export class Neat {
  public species: Species[]; // An array of species representing the whole population
  public configuration: INeatConfiguration = INITIAL_CONFIGURATION; // A configuration object for the NEAT algorithm
  private epoch: number = 0; // The actual iteration index

  /**
   * Create a Neat instance.
   * @param {INeatConfiguration} _configuration - A configuration object.
   */
  constructor(_configuration?: Partial<INeatConfiguration>) {
    //Throw error if configuration is not acceptable
    _configuration && NeatUtils.checkConfiguration(_configuration);
    // Apply user defined configuration
    Object.assign(this.configuration, _configuration);
  }

  /**
   * Run the NEAT algorithmn:
   * Step 1 - Initialize population with random individuals
   * Step 2 - For each individual, evaluate fitness
   * Step 3 - Create new population
   * Step 4 - Evaluate criteria
   */
  public run() {
    NeatUtils.initializePopulation(this);
    while (this.configuration.maxEpoch > this.epoch) {
      NeatUtils.evaluateFitness(this);
      NeatUtils.createNewPopulation(this);
      NeatUtils.evaluateCriteria(this);
      this.epoch++;
    }
  }
}

/** Class containing utiliity functions for the NEAT algorithm */
export class NeatUtils {
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
      neat.species[0].addGenome(new Genotype(neat.configuration.shape));
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

  private getAllGenotypes(neat: Neat) {}
}
