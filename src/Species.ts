import { Phenotype, StructureConfig } from "./Phenotype";
import { DistanceConfig, NEAT } from "./NEAT";

class Species {
  public phenotypes: Phenotype[] = [];
  public populationCap: number = 0;
  public adjustedFitness: number = 0;

  constructor() {}

  addPhenotype(phenotype: Phenotype) {
    this.phenotypes.push(phenotype);
  }

  randomPhenotype(): Phenotype {
    return this.phenotypes[Math.floor(Math.random() * this.phenotypes.length)];
  }

  adjustFitness(): number {
    this.adjustedFitness = this.phenotypes.reduce(
      (acc, cur) => acc + cur.fitness / this.phenotypes.length,
      0
    );
    return this.adjustedFitness;
  }

  public repopulate(config: StructureConfig) {
    this.phenotypes = this.phenotypes.sort((a, b) => b.fitness - a.fitness);
    let half_length = Math.ceil(this.phenotypes.length / 2);
    this.phenotypes = this.phenotypes.splice(0, half_length);
    let newPhenotypes = [];
    while (newPhenotypes.length < this.populationCap) {
      newPhenotypes.push(
        Phenotype.crossover(
          this.randomPhenotype(),
          this.randomPhenotype(),
          config
        )
      );
    }
    this.phenotypes = newPhenotypes;
  }

  public mutateConnection(rate: number, neat: NEAT) {
    this.phenotypes.forEach(
      (p) => Math.random() < rate && p.mutateConnection(neat)
    );
  }

  public mutateDeactivateConnection(rate: number) {
    this.phenotypes.forEach(
      (p) => Math.random() < rate && p.mutateDeactivateConnection(neat)
    );
  }

  public mutateNode(rate: number, neat: NEAT) {
    this.phenotypes.forEach((p) => Math.random() < rate && p.mutateNode(neat));
  }

  public mutateDeactivateNode(rate: number) {
    this.phenotypes.forEach(
      (p) => Math.random() < rate && p.mutateDeactivateNode(neat)
    );
  }

  mutateWeight(rate: number) {
    this.phenotypes.forEach(
      (p) => Math.random() < rate && p.mutateWeights(neat)
    );
  }

  static speciate(phenotypes: Phenotype[], config: DistanceConfig): Species[] {
    let species: Species[] = [];
    let firstSpecies = new Species();
    firstSpecies.addPhenotype(phenotypes[0]);
    species.push(firstSpecies);

    for (let i = 1; i < phenotypes.length; i++) {
      let foundMatch = false;
      for (let o = 0; o < species.length; o++) {
        if (
          Phenotype.isCompatible(
            phenotypes[i],
            species[o].phenotypes[0],
            config
          )
        ) {
          species[o].addPhenotype(phenotypes[i]);
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) {
        let newSpecies = new Species();
        newSpecies.addPhenotype(phenotypes[i]);
        species.push(newSpecies);
      }
    }
    return species;
  }
}

export { Species };
