import { IActivationFunction } from "./activation-functions";
import { Axon } from "./Axon";
import { Neuron, NeuronType } from "./Neuron";
import { helpers } from "./utils/helpers";


export interface IphenotypeShape {
  in: number;
  hidden?: number;
  out: number;
}

export interface ConnectionStructure {
  fNode: Neuron
  sNode: Neuron;
}

interface IPhenotypeParams {
  shape: IphenotypeShape;
  activationFunction: IActivationFunction;
}

class Phenotype {
  public neurons: Neuron[] = [];
  public axons: Axon[] = [];
  public layers?: number[];
  public fitness: number;
  shape: IphenotypeShape;
  activationFunction: IActivationFunction;

  constructor({ shape, activationFunction }: IPhenotypeParams) {
    this.activationFunction = activationFunction;
    this.addNeurons(shape);
  }

  private addNeurons(shape: IphenotypeShape) {
    this.addNeuronsByType(shape.in, NeuronType.INPUT);
    this.addNeuronsByType(shape.hidden, NeuronType.HIDDEN);
    this.addNeuronsByType(shape.out, NeuronType.OUTPUT);
    this.updateShape();
  }

  private addNeuronsByType(n: number, type: NeuronType) {
    new Array(n)
      .fill(0)
      .forEach((s, i) =>
        this.neurons.push(new Neuron({ innovation: i, type }))
      );
  }

  private updateShape() {
    this.shape.in = this.inputs.length;
    this.shape.hidden = this.hiddens.length;
    this.shape.out = this.outputs.length;
  }

  get inputs() {
    return this.neurons.filter((n) => n.type === NeuronType.INPUT);
  }

  get outputs() {
    return this.neurons.filter((n) => n.type === NeuronType.OUTPUT);
  }

  get hiddens() {
    return this.neurons.filter((n) => n.type === NeuronType.HIDDEN);
  }

  static crossover = {
    // Randomly take genes from parentx or parenty and return newly created genes.
    RANDOM: (genesx: number[], genesy: number[]) =>
      genesx.map((genex, i) => (Math.random() < 0.5 ? genex : genesy[i])),

    // Takes a starting and an ending point in parentx's genes removes the genes in between and replaces them with parenty's genes. (How nature does it.)
    SLICE: (genesx: number[], genesy: number[]) => {
      const randoms = [0, 0].map((d) =>
        Math.floor(Math.random() * genesx.length)
      );
      const start = Math.min(randoms[0], randoms[1]);
      const end = Math.max(randoms[0], randoms[1]);
      return genesx.map((gene, i) =>
        i >= start && i < end ? gene : genesy[i]
      );
    },
  };

  public activate(input: number[]): number[] {
    for (let i = 0; i < this.neurons.length; i++) {
      this.neurons[i].inputCount = Axon.outputConnectionsOfNode(
        this.neurons[i],
        this.axons
      ).length;
      this.neurons[i].inputTimes = 0;
      this.neurons[i].value = 0;
    }

    let stack = this.inputs;
    stack = stack.sort((a, b) => (a.innovation < b.innovation ? -1 : 1));
    for (let i = 0; i < stack.length; i++) {
      stack[i].value = input[i];
    }

    while (stack.length) {
      let node = stack.splice(
        stack.indexOf(stack.filter((n) => n.getState())[0]),
        1
      )[0];
      let axons = Axon.inputConnectionsOfNode(node, this.axons);
      axons.forEach((axon) => {
        axon.feedForward();
        if (axon.output.getState()) {
          axon.output.inputTimes = 0;
          axon.output.applyActivation(this.activationFunction);
          stack.push(axon.output);
        }
      });
    }
    return this.getOutputValues();
  }

  public getOutputValues(): number[] {
    return this.outputs
      .sort((a, b) => (a.innovation < b.innovation ? -1 : 1))
      .map((n) => n.value);
  }

  public hasConnection(innovation: number): Axon | boolean {
    return this.axons.find((a) => a.innovation === innovation) || false;
  }

  public hasNode(innovation: number): Neuron | boolean {
    return this.neurons.find((a) => a.innovation === innovation) || false;
  }

  public randomConnectionStructure(): ConnectionStructure {
    let tries = 0;
    let fNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
    let sNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
    while (
      fNode.id === sNode.id ||
      (fNode.type === NeuronType.INPUT && sNode.type === NeuronType.INPUT) ||
      (fNode.type === NeuronType.OUTPUT && sNode.type === NeuronType.OUTPUT)
    ) {
      sNode = this.neurons[Math.floor(Math.random() * this.neurons.length)];
      tries++;
    }
    if (
      !(
        tries > 20 ||
        fNode.type === NeuronType.OUTPUT ||
        sNode.type === NeuronType.INPUT
      )
    )
      return { fNode: fNode, sNode: sNode };
    else return;
  }

  public addNeuron(rConnection: Axon, neat: NEAT): Neuron {
		let nInnovation = Neuron.neuronExists(rConnection.innovation, neat.nodeDB);
		if (nInnovation) {
			let existing = this.hasNode(nInnovation) as Neuron;
			if (!existing) {
				let newNode = new Neuron({innovation:nInnovation, type:NeuronType.HIDDEN, replacedAxon:rConnection});
				this.neurons.push(newNode);
				return newNode;
			} else {
        existing.active = true;
				return existing;
			}
		} else {
			neat.nodeInnovation++;
			let newNode = new Neuron({neat.nodeInnovation, NodeType.HIDDEN, rConnection});
			this.neurons.push(newNode);
			neat.nodeDB.push(newNode);
			return newNode;
		}
	}

  // Create symetric, fully connected phenotype with arbitrary number of hiddens layers
  // [3, 5, 5, 2] represent a graph with 3 inputs, 2 outputs, 2 hiddens layers of 5 nodes each.
  // Nodes of a layer is connected to all nodes of next layer
  static generate = (layers: number[]) => {
    let neurons: Neuron[] = [];
    let axons: Axon[] = [];
    const total = layers.reduce((acc, cur) => acc + cur, 0);

    // Create array of neurons
    // TODO - replace that crap by nested array
    new Array(total).fill(0).forEach((d, i) => {
      const type =
        i < layers[0]
          ? NeuronType.INPUT
          : i < total - layers[layers.length - 1]
          ? NeuronType.HIDDEN
          : NeuronType.OUTPUT;
      const neuron = new Neuron({
        type,
        layerIndex: helpers.getLayerIndex(layers, i),
      });
      neurons.push(neuron);
    });

    // Create array of axons
    layers.forEach((layer, layerIndex) => {
      // if last layer then return
      if (layerIndex === layers.length - 1) return;
      // Retreive neurons of concerned layer
      const currentLayerNeurons = neurons.filter((n, i) => {
        return n.layerIndex === layerIndex;
      });

      // Retreive neurons of next layer
      const nextLayerNeurons = neurons.filter((n, i) => {
        return n.layerIndex === layerIndex + 1;
      });
      // For each neuron of current, create connection to all neurons of next layer
      currentLayerNeurons.forEach((input) => {
        nextLayerNeurons.forEach((output) => {
          const axon = new Axon({ input, output });
          axons.push(axon);
        });
      });
    });
    return new Phenotype({ neurons, axons, layers });
  };
}

export { Phenotype };
