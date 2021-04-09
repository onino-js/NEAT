import { IActivationFunction } from "./activation-functions";
import { Axon } from "./Axon";
import { createId } from "./utils/create-id";

enum NeuronType {
  INPUT = "INPUT",
  HIDDEN = "HIDDEN",
  OUTPUT = "OUTPUT",
}

const INITIAL_NEURON_STATE = {
  inputCount: 0,
  inputTimes: 0,
  _active: true,
  _type: NeuronType.INPUT,
  _value: 0,
};

interface INeuronParams {
  innovation: number;
  type: NeuronType;
  replacedAxon?: Axon;
  id?: string;
  value?: number;
}

class Neuron {
  public readonly id: string;
  public value: number;
  public active: boolean;
  public type: NeuronType;
  public inputCount: number;
  public inputTimes: number;
  public layerIndex?: number;
  public innovation: number;
  public replacedAxon: Axon;

  constructor(opt?: INeuronParams) {
    Object.assign(this, INITIAL_NEURON_STATE, opt);
    this.id = createId();
  }

  public applyActivation(func: IActivationFunction) {
    this.value = func(this.value);
  }

  static getNeuronsByType(type: NeuronType, neurons: Neuron[]): Neuron[] {
    return neurons.filter((neuron) => neuron.type === type);
  }

  static neuronExists(
    innovation: number,
    neuronDB: Neuron[]
  ): number | undefined {
    return neuronDB.find((n) => n.replacedAxon.innovation === innovation)
      ?.innovation;
  }

  public getState(): boolean {
    return this.inputTimes === this.inputCount;
  }
}

export { Neuron, NeuronType };
