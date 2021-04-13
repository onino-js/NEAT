import { AxonGene, Genome, NeuronGene } from "./Genome";
import { NeuronType } from "./models";
import { Identifiable } from "./utils/Identifiable";

/**
 * Class representing a phenotype.
 * @extends Identifiable
 */
class Phenotype extends Identifiable {
  public genome: Genome;
  public neurons: Neuron[] = [];
  public axons: Axon[] = [];
  public fitness: number;
  public adjustedFitness: number;
  public outputValues: number[] = [];
  public shape?: number[];

  /**
   * Create a Phenotype instance from the provided genome.
   * @param {Genome} genome - The genome of the phenotype.
   * @param {Partial<Genome>} opt - An optional parameter to set the properties.
   */
  constructor(genome: Genome, opt?: Partial<Phenotype>) {
    super();
    this.build(genome);
    Object.assign(this, opt);
  }

  private build(genome: Genome) {
    this.genome = genome;
    genome.axonGenes.forEach((ag) => this.axons.push(new Axon(ag)));
    genome.neuronGenes.forEach((ng) => this.neurons.push(new Neuron(ng)));
  }

  public feedForward(inputs: number[]): number[] {
    return this.outputValues;
  }

  get inputNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.INPUT);
  }
  get hiddenNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.HIDDEN);
  }
  get outputNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.OUTPUT);
  }
  get layered(): boolean {
    return this.shape && this.shape.length > 0;
  }
}

/**
 * Class representing a neuron.
 * @extends Identifiable
 */
class Neuron extends Identifiable {
  public neuronGene: NeuronGene;
  public value: number;
  public active: boolean;
  public type: NeuronType;
  public inputCount: number;
  public inputTimes: number;
  public innovation: number;
  public replacedAxon: Axon;
  public layerIndex?: number;

  /**
   * Create a NeuronGene instance from the provided neuron gene.
   * @param {Genome} neuronGene - The neuron gene of the neuron.
   * @param {Partial<Neuron>} opt - An optional parameter to set the properties.
   */
  constructor(neuronGene: NeuronGene, opt?: Partial<Neuron>) {
    super();
    this.neuronGene = neuronGene;
    Object.assign<Neuron, Partial<Neuron>>(this, opt);
  }
}

/**
 * Class representing an axon (or connexion).
 * @extends Identifiable
 */
class Axon extends Identifiable {
  public axonGene: AxonGene;
  public weight: number;
  public active: boolean;
  public input: Neuron;
  public output: Neuron;
  public innovation: number;

  /**
   * Create an Axon instance from the provided axon gene.
   * @param {AxonGene} axonGene - The axon gene of the axon.
   * @param {Partial<Neuron>} opt - An optional parameter to set the properties.
   */
  constructor(axonGene: AxonGene, opt?: Partial<Axon>) {
    super();
    this.axonGene = axonGene;
    Object.assign<Axon, Partial<Axon>>(this, opt);
  }
}

export { Phenotype, Neuron, Axon };
