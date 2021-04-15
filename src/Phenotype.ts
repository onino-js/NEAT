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
    this.genome = genome;
    this.update();
    Object.assign(this, opt);
  }

  public update() {
    this.genome.axonGenes.forEach(({ axon }) => this.axons.push(axon));
    this.genome.neuronGenes.forEach(({ neuron }) => this.neurons.push(neuron));
  }

  public feedForward(inputs: number[]): number[] {
    // Get input neurons and assign input values
    this.inputNodes
      .sort((a, b) => a.neuronGene.innovation - b.neuronGene.innovation)
      .forEach((n, i) => (n.value = inputs[i]));
    // Create a stack of all Axons whose input are input neurons
    const stack = this.axons.filter((a) => a.input.type === NeuronType.INPUT);
    while (stack.length) {}

    // While length of stack is not null
    // Shift the stack and take the first Axon
    // Get the output Neuron of that axon
    // Feed the neuron

    return this.outputValues;
  }

  private reset() {
    this.neurons.forEach((n) => (n.value = 0));
  }

  get inputNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.INPUT);
    // .sort((a, b) => a.innovation - b.innovation);
  }
  get hiddenNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.HIDDEN);
    //  .sort((a, b) => a.innovation - b.innovation);
  }
  get outputNodes() {
    return this.neurons.filter((n) => n.type === NeuronType.OUTPUT);
    //  .sort((a, b) => a.innovation - b.innovation);
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

  public feedForward() {
    if (this.active) {
      this.output.value += this.input.value * this.weight;
    }
  }
}

export { Phenotype, Neuron, Axon };
