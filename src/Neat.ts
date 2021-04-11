import { INITIAL_CONFIGURATION } from "./configuration";
import { INeatConfiguration } from "./models";
import { NeatUtils } from "./NeatUtils";
import { Species } from "./Genome";

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
