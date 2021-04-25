import { NodeType } from "./models";
import { IActivationFunction } from "./models";
import { Identifiable } from "./../utils/Identifiable";

/**
 * Class representing a neuron.
 * @extends Identifiable
 */
class Node extends Identifiable {
  public value: number = 0; // The value outputed by the node.
  public active: boolean = true; // Is the node active or not. If not, the node does not output value.
  public type: NodeType; // input, hidden or output.
  public activated: boolean = false; // Wether or not the not has already been activated. Usefull to feedforward the network.
  public layerIndex?: number; // The layer number of the node in case it is part of a layered network.
  public innovation: number; // The innovation number (see documentation on neat implementation).
  public nodeIndex: number = 0; // A number that tracks the order in which nodes have been added.

  /**
   * Create a NodeGene instance from the provided neuron gene.
   * @param {Partial<Node>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Node>) {
    super();
    Object.assign<Node, Partial<Node>>(this, opt);
  }

  public activate(activationFunction: IActivationFunction) {
    this.value = activationFunction(this.value);
    this.activated = true;
  }

  /**
   * Return a copy of the NeuronGene
   */
  public clone() {
    return new Node({ ...this });
  }
}

export { Node };
