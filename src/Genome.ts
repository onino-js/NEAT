import { IGene, NeuronType } from "./models";
import { Axon, Neuron, Phenotype } from "./Phenotype";
import { Identifiable } from "./utils/Identifiable";

interface IGenomeParams extends Partial<Genome> {
  shape?: number[];
}

/**
 * Class representing a genome.
 * @extends Identifiable
 */
class Genome extends Identifiable {
  public neuronGenes: NeuronGene[] = [];
  public axonGenes: AxonGene[] = [];
  public phenotype: Phenotype;
  public shape: number[];

  constructor(opt?: IGenomeParams) {
    super();
    Object.assign<Genome, Partial<Genome>>(this, opt);
    opt?.shape && this.initialize(opt.shape);
    this.phenotype = new Phenotype(this);
  }

  private initialize(shape: number[]) {}

  private addNeuronGenesByType(n: number, type: NeuronType) {
    new Array(n)
      .fill(0)
      .forEach((s, i) => this.addNeuronGene(new NeuronGene({ type })));
  }
  private addNeuronGene(neuronGene: NeuronGene) {
    this.neuronGenes.push(neuronGene);
  }

  get genes(): IGene[] {
    return (this.neuronGenes as IGene[]).concat(this.axonGenes as IGene[]);
  }
}

interface INeuronGeneParams {
  type?: NeuronType;
}

/**
 * Class representing a NeuronGene.
 * @extends Identifiable
 */
class NeuronGene extends Identifiable {
  public type: NeuronType;
  public innovation: number;
  public layerIndex?: number;
  public neuron: Neuron;
  constructor(opt?: Partial<NeuronGene>) {
    super();
    Object.assign<NeuronGene, Partial<NeuronGene>>(this, opt);
  }
}

/**
 * Class representing a AxonGene.
 * @extends Identifiable
 */
class AxonGene extends Identifiable {
  public weight: number;
  public active: boolean;
  public input: NeuronGene;
  public output: NeuronGene;
  public innovation: number;
  public axon: Axon;

  constructor(opt?: Partial<NeuronGene>) {
    super();
    Object.assign<AxonGene, Partial<AxonGene>>(this, opt);
  }
}

/**
 * Class representing a Species.
 * @extends Identifiable
 */
class Species extends Identifiable {
  public genomes: Genome[] = [];
  public addGenome(genome: Genome) {
    this.genomes.push(genome);
  }
}

export { Genome, NeuronGene, AxonGene, Species };
