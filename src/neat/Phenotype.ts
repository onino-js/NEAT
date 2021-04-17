import { AxonGene, Genome, NeuronGene } from "./Genome";
import { NeuronType } from "./models";
import { IActivationFunction } from "./models";
import { Identifiable } from "./../utils/Identifiable";

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

  
  /**
   * Feed the network forward with input values and return output values.
   * @param {number[]} inputs - An array of input values.
   * @returns {number[]} - the output values.
   */
  public feedForward(
    inputs: number[],
    activationFunction: IActivationFunction
  ): number[] {
    // Check input validity
    this.checkInputs(inputs);
    // Refresh input values and activation status of each neuron
    this.refresh(inputs);
    // Create a stack of all Axons whose input are input neurons
    const stack = this.axons.filter((a) => a.input.type === NeuronType.INPUT);
    // While length of stack is not null
    while (stack.length) {
      // Shift the stack and take the first Axon
      const axon = stack.shift();
      // Check if the output neuron of this axon has already been activated
      if (axon.output.activated) return; // return if yes
      // If no, feed the neuron with all its inputs values
      this.axons
        .filter((a) => a.output === axon.output)
        .forEach((a) => a.feedForward());
      // And activate the neuron
      axon.output.activate(activationFunction);
      // Get all outpout Axons of this neuron and push it to stack
      this.axons
        .filter((a) => a.input === axon.output)
        .forEach((_a) => stack.push(_a));
    }
    return this.outputValues;
  }

   /**
   * Feed the network forward with input values and return output values.
   * Reset the network before. This function should be used instead of feedForward for non recursive networks
   * @param {number[]} inputs - An array of input values.
   * @returns {number[]} - the output values.
   */
  public activate(
    inputs: number[],
    activationFunction: IActivationFunction
  ): number[] {
    this.reset();
    return this.feedForward(inputs, activationFunction);
  }

  private reset() {
    this.neurons.forEach((n) => (n.value = 0));
  }

  private refresh(inputs: number[]) {
    this.neurons.forEach((n) => (n.activated = false));
    // Get input neurons and assign input values
    this.inputNodes
      .sort((a, b) => a.neuronGene.innovation - b.neuronGene.innovation)
      .forEach((n, i) => (n.value = inputs[i]));
  }

  private checkInputs(inputs: number[]){
    // Check number of inputs
    if(inputs.length !== this.inputNodes.length){
      throw new Error(`The number of inputs provided (${inputs.length}) is not equal to the number of input nodes (${this.inputNodes.length})`)
    }
     // Check input values
    inputs.forEach(i=>{
      if(i<0 || i>1){
        console.warn("Inputs are not normalized")
      }
    })
  }

  get outputValues(): number[] {
    return this.outputNodes.map((n) => n.value);
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
  public activated: boolean;
  // public inputCount: number;
  // public inputTimes: number;
  // public replacedAxon: Axon;
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

  public activate(activationFunction: IActivationFunction) {
    this.value = activationFunction(this.value);
    this.activated = true;
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
