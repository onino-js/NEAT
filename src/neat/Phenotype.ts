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
  public updateCallback?: (p: Phenotype) => void;
  private activationFunction: IActivationFunction;

  /**
   * Create a Phenotype instance from the provided genome.
   * @param {Genome} genome - The genome of the phenotype.
   * @param {Partial<Genome>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Phenotype>) {
    super();
    Object.assign(this, opt);
    opt.genome && this.build();
  }

  private build() {
    this.genome.axonGenes.forEach((axonGene) =>
      this.axons.push(new Axon({ axonGene }))
    );
    this.genome.neuronGenes.forEach((neuronGene) =>
      this.neurons.push(new Neuron({ neuronGene }))
    );
    this.axons.forEach((a) => {
      a.input = this.neurons.find((n) => n.neuronGene === a.axonGene.input);
      a.output = this.neurons.find((n) => n.neuronGene === a.axonGene.output);
    });
  }

  /**
   * Feed the network forward with input values and return output values.
   * @param {number[]} inputs - An array of input values.
   * @param {IActivationFunction} activationFunction - The activation function to apply at each node.
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
      // If the output neuron of this axon has not already been activated
      if (!axon.output.activated) {
        // Retreive all axons that have the same output neuron
        const outAxons = this.axons.filter((a) => a.output === axon.output);
        const rec = outAxons.find((a) => a.input === a.output);
        const initialValue = rec ? rec.input.value : 0;
        // Reset the neron value to its initial value
        axon.output.value = initialValue;
        // Get back all input axons of this neuron
        this.axons
          .filter((a) => a.output === axon.output)
          .filter((a) => a.input !== a.output)
          // Feed forward them
          .forEach((a) => a.feedForward());
        // And activate the neuron
        axon.output.activate(activationFunction);
        // Get all output Axons of this neuron and push it to the stack
        this.axons
          .filter((a) => a.input === axon.output)
          .forEach((_a) => stack.push(_a));
      }
    }
    // If defined, trigger a userdefined callback
    this.updateCallback && this.updateCallback(this);
    // return output values
    return this.outputValues;
  }

  /**
   * Feed the network forward with input values and return output values.
   * Reset the network before. This function should be used instead of feedForward for non recursive networks
   * @param {number[]} inputs - An array of input values.
   * @returns {number[]} - the output values.
   */
  public activate(inputs: number[]): number[] {
    this.reset();
    return this.feedForward(inputs, this.activationFunction);
  }

  private reset() {
    this.neurons.forEach((n) => (n.activated = false));
    this.neurons.forEach((n) => (n.value = 0));
  }

  /**
   * Refresh the network values
   * @param {number[]} inputs - An array of input values.
   */
  private refresh(inputs: number[]) {
    this.neurons.forEach((n) => (n.activated = false));
    // Get input neurons and assign input values
    this.inputNodes
      .sort((a, b) => a.neuronGene.innovation - b.neuronGene.innovation)
      .forEach((n, i) => (n.value = inputs[i]));
  }

  /**
   * Check validity of provided inputs.
   * Throw error if not valid
   * @param {number[]} inputs - An array of input values.
   */
  private checkInputs(inputs: number[]) {
    // Check number of inputs
    if (inputs.length !== this.inputNodes.length) {
      throw new Error(
        `The number of inputs provided (${inputs.length}) is not equal to the number of input nodes (${this.inputNodes.length})`
      );
    }
    // Check input values
    inputs.forEach((i) => {
      if (i < 0 || i > 1) {
        console.warn("Inputs are not normalized");
      }
    });
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

  public setUpdateCallback(callback: (p: Phenotype) => void) {
    this.updateCallback = callback;
  }
}

/**
 * Class representing a neuron.
 * @extends Identifiable
 */
class Neuron extends Identifiable {
  public neuronGene: NeuronGene;
  public value: number = 0;
  public active: boolean = true;
  public type: NeuronType;
  public activated: boolean = false;
  public layerIndex?: number;

  /**
   * Create a NeuronGene instance from the provided neuron gene.
   * @param {Genome} neuronGene - The neuron gene of the neuron.
   * @param {Partial<Neuron>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Neuron>) {
    super();
    if (opt?.neuronGene) {
      this.neuronGene = opt.neuronGene;
      this.type = opt.neuronGene.type;
    }
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
  public active: boolean = true;
  public input: Neuron;
  public output: Neuron;
  public innovation: number;

  /**
   * Create an Axon instance from the provided axon gene.
   * @param {AxonGene} axonGene - The axon gene of the axon.
   * @param {boolean} randomWeight - Apply random weight.
   * @param {Partial<Neuron>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Axon>, randomWeight?: boolean) {
    super();
    Object.assign<Axon, Partial<Axon>>(this, opt);
    if (randomWeight) this.weight = Math.random();
  }

  /**
   * Update the output node value.
   */
  public feedForward() {
    if (this.active) {
      this.output.value += (this.input.value || 0) * this.weight;
    }
  }
}

export { Phenotype, Neuron, Axon };
