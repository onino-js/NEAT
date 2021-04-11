import { Genome } from "./Genome";
import { NeuronType } from "./models";
import { Identifiable } from "./utils/Identifiable";

class Phenotype extends Identifiable {
  public genotype: Genome;
  public neurons: Neuron[];
  public axons: Axon[];
  public fitness: number;
  public outputValues: number[] = [];
  public layers?: number[];
  constructor(opt: Partial<Phenotype>) {
    super();
    Object.assign(this, opt);
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
}

class Neuron extends Identifiable {
  public value: number;
  public active: boolean;
  public type: NeuronType;
  public inputCount: number;
  public inputTimes: number;
  public innovation: number;
  public replacedAxon: Axon;
  public layerIndex?: number;
  constructor(opt: Partial<Neuron>) {
    super();
    Object.assign<Neuron, Partial<Neuron>>(this, opt);
  }
}

class Axon extends Identifiable {
  public readonly id: string;
  public weight: number;
  public active: boolean;
  public input: Neuron;
  public output: Neuron;
  public innovation: number;
  constructor(opt: Partial<Axon>) {
    super();
    Object.assign<Axon, Partial<Axon>>(this, opt);
  }
}

export { Phenotype, Neuron, Axon };

// import { IActivationFunction } from "./activation-functions";
// import { Axon } from "./Axon";
// import { Neuron, NeuronType } from "./Neuron";
// import { helpers } from "./utils/helpers";

// export interface IphenotypeShape {
//   in: number;
//   hidden?: number;
//   out: number;
// }

// export interface ConnectionStructure {
//   fNode: Neuron
//   sNode: Neuron;
// }

// interface IPhenotypeParams {
//   shape: IphenotypeShape;
//   activationFunction: IActivationFunction;
// }

// class Phenotype {
//   public neurons: Neuron[] = [];
//   public axons: Axon[] = [];
//   public layers?: number[];
//   public fitness: number;
//   shape: IphenotypeShape;
//   activationFunction: IActivationFunction;

//   constructor({ shape, activationFunction }: IPhenotypeParams) {
//     this.activationFunction = activationFunction;
//     this.addNeurons(shape);
//   }

//   private addNeurons(shape: IphenotypeShape) {
//     this.addNeuronsByType(shape.in, NeuronType.INPUT);
//     this.addNeuronsByType(shape.hidden, NeuronType.HIDDEN);
//     this.addNeuronsByType(shape.out, NeuronType.OUTPUT);
//     this.updateShape();
//   }

//   private addNeuronsByType(n: number, type: NeuronType) {
//     new Array(n)
//       .fill(0)
//       .forEach((s, i) =>
//         this.neurons.push(new Neuron({ innovation: i, type }))
//       );
//   }

//   private updateShape() {
//     this.shape.in = this.inputs.length;
//     this.shape.hidden = this.hiddens.length;
//     this.shape.out = this.outputs.length;
//   }

//   get inputs() {
//     return this.neurons.filter((n) => n.type === NeuronType.INPUT);
//   }

//   get outputs() {
//     return this.neurons.filter((n) => n.type === NeuronType.OUTPUT);
//   }

//   get hiddens() {
//     return this.neurons.filter((n) => n.type === NeuronType.HIDDEN);
//   }

//   static crossover = {
//     // Randomly take genes from parentx or parenty and return newly created genes.
//     RANDOM: (genesx: number[], genesy: number[]) =>
//       genesx.map((genex, i) => (Math.random() < 0.5 ? genex : genesy[i])),

//     // Takes a starting and an ending point in parentx's genes removes the genes in between and replaces them with parenty's genes. (How nature does it.)
//     SLICE: (genesx: number[], genesy: number[]) => {
//       const randoms = [0, 0].map((d) =>
//         Math.floor(Math.random() * genesx.length)
//       );
//       const start = Math.min(randoms[0], randoms[1]);
//       const end = Math.max(randoms[0], randoms[1]);
//       return genesx.map((gene, i) =>
//         i >= start && i < end ? gene : genesy[i]
//       );
//     },
//   };

//   public activate(input: number[]): number[] {
//     for (let i = 0; i < this.neurons.length; i++) {
//       this.neurons[i].inputCount = Axon.outputConnectionsOfNode(
//         this.neurons[i],
//         this.axons
//       ).length;
//       this.neurons[i].inputTimes = 0;
//       this.neurons[i].value = 0;
//     }

//     let stack = this.inputs;
//     stack = stack.sort((a, b) => (a.innovation < b.innovation ? -1 : 1));
//     for (let i = 0; i < stack.length; i++) {
//       stack[i].value = input[i];
//     }

//     while (stack.length) {
//       let node = stack.splice(
//         stack.indexOf(stack.filter((n) => n.getState())[0]),
//         1
//       )[0];
//       let axons = Axon.inputConnectionsOfNode(node, this.axons);
//       axons.forEach((axon) => {
//         axon.feedForward();
//         if (axon.output.getState()) {
//           axon.output.inputTimes = 0;
//           axon.output.applyActivation(this.activationFunction);
//           stack.push(axon.output);
//         }
//       });
//     }
//     return this.getOutputValues();
//   }

//   public getOutputValues(): number[] {
//     return this.outputs
//       .sort((a, b) => (a.innovation < b.innovation ? -1 : 1))
//       .map((n) => n.value);
//   }

//   public hasConnection(innovation: number): Axon | boolean {
//     return this.axons.find((a) => a.innovation === innovation) || false;
//   }

//   public hasNode(innovation: number): Neuron | boolean {
//     return this.neurons.find((a) => a.innovation === innovation) || false;
//   }

//   public randomConnectionStructure(): ConnectionStructure {
//     let tries = 0;
//     let fNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
//     let sNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
//     while (
//       fNode.id === sNode.id ||
//       (fNode.type === NeuronType.INPUT && sNode.type === NeuronType.INPUT) ||
//       (fNode.type === NeuronType.OUTPUT && sNode.type === NeuronType.OUTPUT)
//     ) {
//       sNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
//       tries++;
//     }
//     if (
//       !(
//         tries > 20 ||
//         fNode.type === NeuronType.OUTPUT ||
//         sNode.type === NeuronType.INPUT
//       )
//     )
//       return { fNode: fNode, sNode: sNode };
//     else return;
//   }

//   public addNeuron(rConnection: Axon, neat: NEAT): Neuron {
// 		let nInnovation = Neuron.neuronExists(rConnection.innovation, neat.nodeDB);
// 		if (nInnovation) {
// 			let existing = this.hasNode(nInnovation) as Neuron;
// 			if (!existing) {
// 				let newNode = new Neuron({innovation:nInnovation, type:NeuronType.HIDDEN, replacedAxon:rConnection});
// 				this.neurons.push(newNode);
// 				return newNode;
// 			} else {
//         existing.active = true;
// 				return existing;
// 			}
// 		} else {
// 			neat.nodeInnovation++;
// 			let newNode = new Neuron({neat.nodeInnovation, NodeType.HIDDEN, rConnection});
// 			this.neurons.push(newNode);
// 			neat.nodeDB.push(newNode);
// 			return newNode;
// 		}
// 	}

// }

// export { Phenotype };

// import { createId } from "./utils/create-id";
// import { Neuron } from "./Neuron";
// import { Phenotype } from "./Phenotype";

// class Axon {
//   public readonly id: string;
//   public weight: number;
//   public active: boolean;
//   public input: Neuron;
//   public output: Neuron;
//   public innovation: number;

//   constructor(opt: Partial<Axon>) {
//     Object.assign(this, opt);
//     this.id = createId();
//   }

//   public randomizeWeight() {
//     this.weight = Math.random() * 2 - 1;
//   }

//   public feedForward() {
//     if (this.active) {
//       this.output.value = this.output.value + this.input.value * this.weight;
//     }
//   }

//   activateAxon() {
//     this.active = true;
//   }

//   deactivateAxon() {
//     this.active = false;
//   }

//   static isRecurrent(axon: Axon, phenotype: Phenotype): boolean {
//     let neuron = axon.input;
//     let stack = [axon];
//     while (stack.length !== 0) {
//       let axon = stack.shift();
//       if (axon.output.id === neuron.id) return true;
//       stack.push(
//         ...phenotype.axons.filter((ax) => ax.input.id === axon.output.id)
//       );
//     }
//     return false;
//   }

//   static exists(
//     data: { fNode: Neuron; sNode: Neuron },
//     axonDB: Axon[]
//   ): number | undefined {
//     return axonDB.find(
//       (d) =>
//         data.fNode.innovation === d.input.innovation &&
//         data.sNode.innovation === d.output.innovation
//     )?.innovation;
//   }

//   static inputConnectionsOfNode(neuron: Neuron, axons: Axon[]): Axon[] {
//     return axons.filter((ax) => ax.input.id === neuron.id);
//   }

//   static outputConnectionsOfNode(neuron: Neuron, axons: Axon[]): Axon[] {
//     return axons.filter((ax) => ax.output.id === neuron.id);
//   }
// }

// export { Axon };
