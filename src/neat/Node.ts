import { NodeType } from "./models";
import { IActivationFunction } from "./models";
import { Identifiable } from "./../utils/Identifiable";

/**
 * Class representing a neuron.
 * @extends Identifiable
 */
class Node extends Identifiable {
  public value: number = 0;
  public active: boolean = true;
  public type: NodeType;
  public activated: boolean = false;
  public layerIndex?: number;
  public innovation: number;

  /**
   * Create a NodeGene instance from the provided neuron gene.
   * @param {Genome} neuronGene - The neuron gene of the neuron.
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
