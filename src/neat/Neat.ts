import { INITIAL_CONFIGURATION } from "./configuration";
import { INeatConfiguration } from "./models";
import { NeatUtils } from "./NeatUtils";
import { Network } from "./Network";

/** Class representing the NEAT algorithm */
export class Neat {
  public species: Network[][] = [[]]; // An array of array of Genomes representing the whole population. Each array representing a species
  public configuration: INeatConfiguration = { ...INITIAL_CONFIGURATION }; // A configuration object for the NEAT algorithm
  private epoch: number = 0; // The actual iteration index

  /**
   * Create a Neat instance.
   * @param {INeatConfiguration} _configuration - A configuration object.
   */
  constructor(_configuration?: Partial<INeatConfiguration>) {
    // Apply user defined configuration if any
    _configuration && Object.assign(this.configuration, { ..._configuration });
    //Throw error if configuration is not acceptable
    NeatUtils.checkConfiguration(this.configuration);
  }

  // Return population as a flat array of phenotypes
  get population(): Network[] {
    return this.species.flat();
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
    //console.log(this.species);
    while (!this.finished) {
      // console.log(this.population.length);
      NeatUtils.computeFitness(this); // Fitnesses and asjusted fitnesses are coputed
      NeatUtils.speciatePopulation(this); // Genomes are sorted into species in the species property
      NeatUtils.selectPopulation(this); // Some phenotypes didn't survived, the species arrays are truncated
      NeatUtils.mutatePopulation(this); // Some genomes have mutated through one  of the three mutation type
      //NeatUtils.crossoverPopulation(this); // New genomes are created with crossover, the population size is full again
      if (NeatUtils.evaluateCriteria(this)) break; // beak the loop if convergence is acheived
      this.epoch++;
      // console.log(this.species);
    }
    //   console.log(this.species);
  }
}
