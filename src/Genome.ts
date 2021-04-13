import { IGene, NeuronType } from "./models";
import { Axon, Neuron, Phenotype } from "./Phenotype";
import { Identifiable } from "./utils/Identifiable";

/**
 * Class representing a genome.
 * @extends Identifiable
 */
class Genome extends Identifiable {
  public neuronGenes: NeuronGene[] = [];
  public axonGenes: AxonGene[] = [];
  public phenotype: Phenotype;
  public shape: number[];

  /**
   * Create a Genome instance.
   * @param {Partial<Genome>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Genome>) {
    super();
    Object.assign<Genome, Partial<Genome>>(this, opt);
    opt?.shape && this.initialize(opt.shape);
    this.phenotype = new Phenotype(this);
  }

  /**
   * Create NeuronGenes and AxonGenes from a shape object.
   * @param {number} shape - An array of number representing the number of inouts, hiddens and outputs
   */
  private initialize(shape: number[]) {}

  /**
   * Get all genes (Axons and Neurons) in a flat array
   */
  get genes(): IGene[] {
    return (this.neuronGenes as IGene[]).concat(this.axonGenes as IGene[]);
  }
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

  /**
   * Create a NeuronGene instance.
   * @param {Partial<NeuronGene>} opt - An optional parameter to set the properties.
   */
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

  /**
   * Create a AxonGene instance.
   * @param {Partial<NeuronGene>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<AxonGene>) {
    super();
    Object.assign<AxonGene, Partial<AxonGene>>(this, opt);
  }
}

export { Genome, NeuronGene, AxonGene };
