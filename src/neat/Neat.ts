import { INITIAL_CONFIGURATION } from "./configuration";
import { INeatConfiguration } from "./models";
import { NeatUtils } from "./NeatUtils";
import { Genome } from "./Genome";
import { Phenotype } from "./Phenotype";

/** Class representing the NEAT algorithm */
export class Neat {
  public species: Genome[][] = [[]]; // An array of array of Genomes representing the whole population. Each array representing a species
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

  // Return population as a flat array of phenotypes
  get population(): Phenotype[] {
    return this.species.flat().map((g) => g.phenotype);
  }

  // Return true if the last iteration step has been done
  get finished(): boolean {
    return this.configuration.maxEpoch === this.epoch;
  }

  /**
   * Run the NEAT algorithmn:
   */
  public run() {
    NeatUtils.initializePopulation(this); // The population is initialized within one species
    while (!this.finished) {
      NeatUtils.computeFitness(this); // Fitnesses and asjusted fitnesses are coputed
      NeatUtils.speciatePopulation(this); // Genomes are sorted into species in the species property
      NeatUtils.selectPopulation(this); // Some phenotypes didn't survived, the species arrays are truncated
      NeatUtils.mutatePopulation(this); // Some genomes have mutated through one  of the three mutation type
      NeatUtils.crossoverPopulation(this); // New genomes are created with crossover, the population size is full again
      if (NeatUtils.evaluateCriteria(this)) break; // beak the loop if convergence is acheived
      this.epoch++;
    }
  }
}
