import {
  IActivationFunction,
  NodeType,
  INetworkParams,
  ActivationType,
} from "./models";
import { Identifiable } from "./../utils/Identifiable";
import { Node } from "./Node";
import { Connexion } from "./Connexion";
import { NeatUtils } from "./NeatUtils";

/**
 * Class representing a phenotype.
 * @extends Identifiable
 */
class Network extends Identifiable {
  public shape: number[];
  public nodes: Node[] = [];
  public connexions: Connexion[] = [];
  public fitness: number;
  public adjustedFitness: number;
  public updateCallback?: (p: Network) => void;
  public activationFunction: IActivationFunction =
    NeatUtils.activationFunctions[ActivationType.SIGMOID];

  /**
   * Create a Network instance from the provided genome.
   * @param {Partial<Genome>} opt - An optional parameter to set the properties.
   */
  constructor(opt: INetworkParams, init: boolean = true) {
    super();
    Object.assign(this, opt);
    init && this.initialize(opt.shape);
  }

  get outputValues(): number[] {
    return this.outputNodes.map((n) => n.value);
  }

  get inputNodes() {
    return this.nodes.filter((n) => n.type === NodeType.INPUT);
    // .sort((a, b) => a.innovation - b.innovation);
  }
  get hiddenNodes() {
    return this.nodes.filter((n) => n.type === NodeType.HIDDEN);
    //  .sort((a, b) => a.innovation - b.innovation);
  }
  get outputNodes() {
    return this.nodes.filter((n) => n.type === NodeType.OUTPUT);
    //  .sort((a, b) => a.innovation - b.innovation);
  }
  get nodeIndex(): number {
    return this.nodes.reduce((acc, cur) => Math.max(acc, cur.nodeIndex), 0);
  }

  /**
   * Create NeuronGenes and AxonGenes from a shape object.
   * @param {number} shape - An array of number representing the number of inouts, hiddens and outputs
   */
  private initialize(shape: number[]) {
    let innovation = 1;
    shape.forEach((layer, layerIndex) => {
      new Array(layer).fill(0).forEach((n, i) => {
        const type =
          layerIndex === 0
            ? NodeType.INPUT
            : layerIndex > 0 && layerIndex < shape.length - 1
            ? NodeType.HIDDEN
            : NodeType.OUTPUT;
        this.addNode(new Node({ type, layerIndex, innovation }));
        innovation++;
      });
    });
    return this.nodes;
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
    // Refresh input values and activation status of each node
    this.refresh(inputs);
    // Create a stack of all Connexions whose input are input nodes
    const stack = this.connexions.filter(
      (a) => a.input.type === NodeType.INPUT
    );
    // While length of stack is not null
    while (stack.length) {
      // Shift the stack and take the first Connexion
      const connexion = stack.shift();
      // If the output node of this connexion has not already been activated
      if (!connexion.output.activated) {
        // Retreive all connexions that have the same output node
        const outConnexions = this.connexions.filter(
          (a) => a.output === connexion.output
        );
        const rec = outConnexions.find((a) => a.input === a.output);
        const initialValue = rec ? rec.input.value : 0;
        // Reset the neron value to its initial value
        connexion.output.value = initialValue;
        // Get back all input connexions of this node
        this.connexions
          .filter((a) => a.output === connexion.output)
          .filter((a) => a.input !== a.output) // Remove recurent connexions
          // Feed forward them
          .forEach((a) => a.feedForward());
        // And activate the node
        connexion.output.activate(activationFunction);
        // Get all output Connexions of this node and push it to the stack
        this.connexions
          .filter((a) => a.input === connexion.output)
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
    this.nodes.forEach((n) => (n.activated = false));
    this.nodes.forEach((n) => (n.value = 0));
  }

  /**
   * Refresh the network values
   * @param {number[]} inputs - An array of input values.
   */
  private refresh(inputs: number[]) {
    this.nodes.forEach((n) => (n.activated = false));
    // Get input nodes and assign input values
    this.inputNodes
      .sort((a, b) => a.innovation - b.innovation)
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
      if (isNaN(i) || !Number.isInteger(i)) {
        throw new Error(`Inputs should be positive integers`);
      }
    });
    inputs.forEach((i) => {
      if (i < 0 || i > 1) {
        console.warn("Inputs are not normalized");
      }
    });
  }

  public setUpdateCallback(callback: (p: Network) => void) {
    this.updateCallback = callback;
  }

  /**
   * Add a new node to the network. Set the correct nodeIndex.
   * @param {Node} node - The node to be added
   */
  public addNode(node: Node): Node {
    node.nodeIndex = this.nodeIndex + 1;
    !node.type && (node.type = NodeType.HIDDEN);
    this.nodes.push(node);
    return node;
  }

  /**
   * Create a new connextion between two nodes.
   * @param {number} n1 - The input node index.
   * @param {number} n2 - The output node index.
   */
  public connectNodes(n1: number, n2: number, innovation?: number) {
    const input = this.getNodeByIndex(n1);
    const output = this.getNodeByIndex(n2);
    const existing = this.connexions.find(
      (c) => c.input === input && c.output === output
    );
    if (existing) {
      throw new Error(
        `Connection already exists between nodes with indexes ${n1} and ${n2}.`
      );
    }
    if (!input || !output) {
      throw new Error(`Unable to connect nodes with indexes ${n1} and ${n2}.`);
    } else if (input.type === NodeType.OUTPUT) {
      throw new Error(`Output node can't be connected as input node`);
    } else if (output.type === NodeType.INPUT) {
      throw new Error(`Output node can't be connected as input node`);
    } else {
      const newConnexion = new Connexion({ input, output, innovation });
      this.connexions.push(newConnexion);
      return newConnexion;
    }
  }

  /**
   * Get a node with corresponding node index
   * @param {number} nodeIndex - The index of the node
   * @return a Node
   */
  public getNodeByIndex(nodeIndex: number): Node {
    return this.nodes.find((n) => n.nodeIndex === nodeIndex);
  }

  /**
   * Return a copy of the Genome
   */
  public clone() {
    const clone = new Network({ ...this }, false);
    clone.connexions = clone.connexions.map((ag) => ag.clone());
    clone.nodes = clone.nodes.map((ng) => ng.clone());
    // reconnect nueron and axons
    clone.connexions.forEach((ag) => {
      ag.input = clone.nodes.find(
        (ng) => ng.innovation === ag.input.innovation
      );
      ag.output = clone.nodes.find(
        (ng) => ng.innovation === ag.output.innovation
      );
    });
    return clone;
  }
}

export { Network };
