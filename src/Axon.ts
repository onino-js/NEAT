import { createId } from "./utils/create-id";
import { Neuron } from "./Neuron";
import { Phenotype } from "./Phenotype";

class Axon {
  public readonly id: string;
  public weight: number;
  public active: boolean;
  public input: Neuron;
  public output: Neuron;
  public innovation: number;

  constructor(opt: Partial<Axon>) {
    Object.assign(this, opt);
    this.id = createId();
  }

  public randomizeWeight() {
    this.weight = Math.random() * 2 - 1;
  }

  public feedForward() {
    if (this.active) {
      this.output.value = this.output.value + this.input.value * this.weight;
    }
  }

  activateAxon() {
    this.active = true;
  }

  deactivateAxon() {
    this.active = false;
  }

  static isRecurrent(axon: Axon, phenotype: Phenotype): boolean {
    let neuron = axon.input;
    let stack = [axon];
    while (stack.length !== 0) {
      let axon = stack.shift();
      if (axon.output.id === neuron.id) return true;
      stack.push(
        ...phenotype.axons.filter((ax) => ax.input.id === axon.output.id)
      );
    }
    return false;
  }

  static exists(
    data: { fNode: Neuron; sNode: Neuron },
    axonDB: Axon[]
  ): number | undefined {
    return axonDB.find(
      (d) =>
        data.fNode.innovation === d.input.innovation &&
        data.sNode.innovation === d.output.innovation
    )?.innovation;
  }

  static inputConnectionsOfNode(neuron: Neuron, axons: Axon[]): Axon[] {
    return axons.filter((ax) => ax.input.id === neuron.id);
  }

  static outputConnectionsOfNode(neuron: Neuron, axons: Axon[]): Axon[] {
    return axons.filter((ax) => ax.output.id === neuron.id);
  }
}

export { Axon };
