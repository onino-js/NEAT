import { INITIAL_CONFIGURATION } from "./configuration";
import { INeatConfiguration } from "./models";
import { NeatUtils } from "./NeatUtils";
import { Genome } from "./Genome";
import { Phenotype } from "./Phenotype";

/** Class representing the NEAT algorithm */
export class Neat {
  public species: Genome[][] = [[]]; // An array of array of Genomes representing the whole population. Each array representing a species
  public maxInnovation: number = 0;
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

  get population(): Phenotype[] {
    return this.species.flat().map((g) => g.phenotype);
  }

  set population(items: Phenotype[]) {
    this.population = items;
  }

  /**
   * Run the NEAT algorithmn:
   */
  public run() {
    NeatUtils.initializePopulation(this);
    // The population is initialized within one species
    while (!this.finished) {
      NeatUtils.computeFitness(this);
      // Fitnesses and asjusted fitnesses are coputed
      NeatUtils.speciatePopulation(this);
      NeatUtils.selectPopulation(this);
      NeatUtils.mutatePopulation(this);
      NeatUtils.crossoverPopulation(this);
      NeatUtils.evaluateCriteria(this);
      this.epoch++;
    }
  }
  get finished(): boolean {
    return this.configuration.maxEpoch === this.epoch;
  }
}
