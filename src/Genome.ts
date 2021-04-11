import { NeuronType } from "./models";
import { Identifiable } from "./utils/Identifiable";

/** Class representing a genome manipulated by the neat algorithm */
class Genome extends Identifiable {
  public neuronGenes: NeuronGene[] = [];
  public axonGenes: AxonGene[] = [];
  constructor(shape: [number, number, number]) {
    super();
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
      .forEach((s, i) => this.addNeuronGene(new NeuronGene(type)));
  }
  private addNeuronGene(neuronGene: NeuronGene) {
    this.neuronGenes.push(neuronGene);
  }
}

interface INeuronGeneParams {
  type?: NeuronType;
}

class NeuronGene {
  public type: NeuronType;
  constructor(type: NeuronType) {
    this.type = type;
  }
}

class AxonGene {
  public readonly id: string;
  public weight: number;
  public active: boolean;
  public input: number;
  public output: number;
  public innovation: number;
}

class Species {
  public genomes: Genome[] = [];
  public addGenome(genome: Genome) {
    this.genomes.push(genome);
  }
}

export { Genome, NeuronGene, AxonGene, Species };
