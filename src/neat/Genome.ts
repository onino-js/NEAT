import { IGene, NeuronType } from "./models";
import { NeatUtils } from "./NeatUtils";
import { Axon, Neuron, Phenotype } from "./Phenotype";
import { Identifiable } from "./../utils/Identifiable";

/**
 * Class representing a genome.
 * @extends Identifiable
 */
class Genome extends Identifiable {
  public neuronGenes: NeuronGene[] = [];
  public axonGenes: AxonGene[] = [];
  //public phenotype: Phenotype;
  public shape: number[];

  /**
   * Create a Genome instance.
   * @param {Partial<Genome>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Genome>) {
    super();
    Object.assign<Genome, Partial<Genome>>(this, opt);
    opt?.shape && this.initialize(opt.shape);
    // this.phenotype = new Phenotype(this);
  }

  get phenotype() {
    return new Phenotype({ genome: this });
  }

  /**
   * Create NeuronGenes and AxonGenes from a shape object.
   * @param {number} shape - An array of number representing the number of inouts, hiddens and outputs
   */
  private initialize(shape: number[]) {
    //this.neuronGenes = NeatUtils.getNeuronGenesFromShape(shape);
    shape.forEach((layer, layerIndex) => {
      new Array(layer).fill(0).forEach((n) => {
        const type =
          layerIndex === 0
            ? NeuronType.INPUT
            : layerIndex > 0 && layerIndex < shape.length - 1
            ? NeuronType.HIDDEN
            : NeuronType.OUTPUT;
        this.neuronGenes.push(new NeuronGene({ type }));
      });
    });
  }

  /**
   * Get all genes (Axons and Neurons) in a flat array
   */
  get genes(): IGene[] {
    return (this.neuronGenes as IGene[]).concat(this.axonGenes as IGene[]);
  }
  /**
   * Return a copy of the Genome
   */
  public clone() {
    const clone = new Genome({ ...this });
    clone.axonGenes = clone.axonGenes.map((ag) => ag.clone());
    clone.neuronGenes = clone.neuronGenes.map((ng) => ng.clone());
    // reconnect nueron and axons
    clone.axonGenes.forEach((ag) => {
      ag.input = clone.neuronGenes.find(
        (ng) => ng.innovation === ag.input.innovation
      );
      ag.output = clone.neuronGenes.find(
        (ng) => ng.innovation === ag.output.innovation
      );
    });
    return clone;
  }
}

/**
 * Class representing a NeuronGene.
 * @extends Identifiable
 */
class NeuronGene extends Identifiable {
  public type: NeuronType;
  public innovation: number = 0;
  public layerIndex?: number;
  public neuron: Neuron;

  /**
   * Create a NeuronGene instance.
   * @param {Partial<NeuronGene>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<NeuronGene>) {
    super();
    Object.assign<NeuronGene, Partial<NeuronGene>>(this, opt);
    this.neuron = new Neuron({ neuronGene: this });
  }
  /**
   * Return a copy of the NeuronGene
   */
  public clone() {
    return new NeuronGene({ ...this });
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
  public innovation: number = 0;
  public axon: Axon;

  /**
   * Create a AxonGene instance.
   * @param {Partial<NeuronGene>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<AxonGene>) {
    super();
    Object.assign<AxonGene, Partial<AxonGene>>(this, opt);
    this.axon = new Axon({ axonGene: this });
    // !opt.axon && (this.axon = new Axon({ axonGene: this }));
  }
  /**
   * Return a copy of the AxonGene
   */
  public clone() {
    return new AxonGene({
      ...this,
      input: this.input.clone(),
      output: this.output.clone(),
    });
  }
}

export { Genome, NeuronGene, AxonGene };
