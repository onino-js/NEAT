import { NodeType } from "./../models";
import { NeatUtils } from "./../NeatUtils";
import { Neat } from "../Neat";
import { Network } from "../Network";
import { Connexion } from "../Connexion";
import { Node } from "../Node";

describe("class NeatUtils", () => {
  describe("CheckShape", () => {
    it("Throw error if called with null or negative numbers", () => {
      let checkShape = () => NeatUtils.checkShape([1, 0, 1]);
      expect(checkShape).toThrow();
      checkShape = () => NeatUtils.checkShape([-1, 1]);
      expect(checkShape).toThrow();
    });
    it("Throw error if called with float numbers", () => {
      let checkShape = () => NeatUtils.checkShape([1.1, 1]);
      expect(checkShape).toThrow();
      checkShape = () => NeatUtils.checkShape([2, 6.9]);
      expect(checkShape).toThrow();
    });
  });
  describe("generatePerceptron", () => {
    it("Check arguments before proceeding", () => {
      NeatUtils.checkShape = jest.fn();
      NeatUtils.generatePerceptron({ shape: [1, 0, 1] });
      expect(NeatUtils.checkShape).toHaveBeenCalledTimes(1);
    });
    it("Returns a network without errors", () => {
      const createNetwork = () =>
        NeatUtils.generatePerceptron({ shape: [1, 1] });
      expect(createNetwork).not.toThrow();
    });
    it("Returns a network with correct total number of nodes", () => {
      let network = NeatUtils.generatePerceptron({ shape: [1, 1] });
      expect(network.nodes).toHaveLength(2);
      network = NeatUtils.generatePerceptron({ shape: [5, 1] });
      expect(network.nodes).toHaveLength(6);
      network = NeatUtils.generatePerceptron({ shape: [1, 7] });
      expect(network.nodes).toHaveLength(8);
    });
    it("Returns a network with correct number of inputs nodes", () => {
      let network = NeatUtils.generatePerceptron({ shape: [1, 1] });
      expect(network.inputNodes).toHaveLength(1);
      network = NeatUtils.generatePerceptron({ shape: [5, 1] });
      expect(network.inputNodes).toHaveLength(5);
    });
    it("Returns a network with correct number of hiddens nodes", () => {
      let network = NeatUtils.generatePerceptron({ shape: [1, 1] });
      expect(network.hiddenNodes).toHaveLength(0);
      network = NeatUtils.generatePerceptron({ shape: [1, 5, 1] });
      expect(network.hiddenNodes).toHaveLength(5);
    });
    it("Returns a network with correct number of output nodes", () => {
      let shape = [1, 1];
      let network = NeatUtils.generatePerceptron({ shape });
      expect(network.outputNodes).toHaveLength(shape[1]);
      shape = [1, 1, 5];
      network = NeatUtils.generatePerceptron({ shape: [1, 1, 5] });
      expect(network.outputNodes).toHaveLength(shape[2]);
    });
    it("Returns a network with correct number of connexions", () => {
      let network = NeatUtils.generatePerceptron({ shape: [1, 1] });
      expect(network.connexions).toHaveLength(1);
      network = NeatUtils.generatePerceptron({ shape: [1, 1, 5] });
      expect(network.connexions).toHaveLength(6);
    });
    it("All genes have unique innovation number", () => {
      let network = NeatUtils.generatePerceptron({ shape: [3, 4, 3, 1] });
      network.connexions.forEach((c) => {
        const sameInnovation = network.connexions.filter(
          (_c) => _c.innovation === c.innovation
        );
        expect(sameInnovation.length).toEqual(1);
      });
      network.nodes.forEach((c) => {
        const sameInnovation = network.nodes.filter(
          (_c) => _c.innovation === c.innovation
        );
        expect(sameInnovation.length).toEqual(1);
      });
    });
  });
  describe("initialize population", () => {
    it("set the correct number of network", () => {
      const neat = new Neat();
      NeatUtils.initializePopulation(neat);
      expect(neat.population.length).toEqual(neat.configuration.populationSize);
    });
  });
  describe("getNodesFromShape", () => {
    it("Returns an array of Genes", () => {
      let shape = [1, 1];
      let genes = NeatUtils.getNodesFromShape(shape);
      expect(genes.length).toEqual(2);
      expect(genes.filter((g) => g.type === NodeType.INPUT).length).toEqual(
        shape[0]
      );
      expect(genes.filter((g) => g.type === NodeType.OUTPUT).length).toEqual(
        shape[1]
      );
      shape = [2, 3, 4];
      genes = NeatUtils.getNodesFromShape(shape);
      expect(genes.length).toEqual(2 + 3 + 4);
      expect(genes.filter((g) => g.type === NodeType.INPUT).length).toEqual(
        shape[0]
      );
      expect(genes.filter((g) => g.type === NodeType.OUTPUT).length).toEqual(
        shape[2]
      );
      expect(genes.filter((g) => g.type === NodeType.HIDDEN).length).toEqual(
        shape[1]
      );
    });
  });
  describe("computeNumberOfMissmatchGenes - simple net", () => {
    const shape = [1, 1];

    const connexions1 = [
      new Connexion({ innovation: 4 }),
      new Connexion({ innovation: 5 }),
      new Connexion({ innovation: 6 }),
    ];
    const connexions2 = [
      new Connexion({ innovation: 4 }),
      new Connexion({ innovation: 5 }),
      new Connexion({ innovation: 6 }),
    ];
    const network1 = new Network({ shape, connexions: connexions1 });
    const network2 = new Network({ shape, connexions: connexions2 });
    const nodes = [new Node(), new Node(), new Node()];
    nodes.forEach((n) => {
      network1.addNode(n);
    });
    nodes.forEach((n) => {
      network2.addNode(n.clone());
    });
    let d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(0);
    network2.connexions[2].innovation = 7;
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(2);
    // network2.nodes[2].innovation = 8; // nodes are the same in both networks
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(2);
    network2.connexions[0].innovation = 9;
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(4);
  });
  describe("computeNumberOfMissmatchGenes - perceptron", () => {
    it("Retun 0 when the network are equivalent", () => {
      const perceptron1 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const perceptron2 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const d = NeatUtils.computeNumberOfMissmatchGenes([
        perceptron1,
        perceptron2,
      ]);
      expect(d).toEqual(0);
    });
    it("Retun the correct number of missmatching genes - 1", () => {
      const perceptron1 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const perceptron2 = NeatUtils.generatePerceptron({ shape: [2, 3, 1] });
      const d = NeatUtils.computeNumberOfMissmatchGenes([
        perceptron1,
        perceptron2,
      ]);
      expect(d).toEqual(3);
    });
    it("Retun the correct number of missmatching genes - 2", () => {
      const perceptron1 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const perceptron2 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const c = NeatUtils.randomPick(perceptron2.connexions);
      c.innovation = 100;
      const d = NeatUtils.computeNumberOfMissmatchGenes([
        perceptron1,
        perceptron2,
      ]);
      expect(d).toEqual(2);
    });
  });
  describe("computeNumberOfExcessGenes", () => {
    it("Return 0 when networks are equivalents", () => {
      const network1 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const network2 = NeatUtils.generatePerceptron({ shape: [2, 3, 2] });
      const d = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
      expect(d).toEqual(0);
    });
    it("Return the correct number of excess genes - 1", () => {
      const network1 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
      const network2 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
      network1.connectNodes(1, 8, 100);
      const d1 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
      expect(d1).toEqual(1);
      network1.connectNodes(1, 9, 101);
      const d2 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
      expect(d2).toEqual(2);
    });
    // it("Return the correct number of excess genes - 2", () => {
    //   const network1 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
    //   const network2 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
    //   network1.connexions.splice(1, 1);
    //   const d1 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
    //   expect(d1).toEqual(0);
    //   network1.connexions.splice(3, 1);
    //   const d2 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
    //   expect(d2).toEqual(0);
    // });
    // it("Return the correct number of excess genes - 3", () => {
    //   const network1 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
    //   const network2 = NeatUtils.generatePerceptron({ shape: [2, 3, 3, 2] });
    //   network1.connexions.splice(1, 1);
    //   network1.connectNodes(1, 8, 100);
    //   const d1 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
    //   expect(d1).toEqual(1);
    //   network1.connectNodes(1, 9, 101);
    //   network1.connexions.splice(3, 1);
    //   const d2 = NeatUtils.computeNumberOfExcessGenes([network1, network2]);
    //   expect(d2).toEqual(2);
    // });
  });
  describe("getNodeInnovation", () => {
    it("Retreive the same innovation and return it", () => {});
    it("Do not retreive the same innovation and return the max innovation incremented", () => {});
  });
  describe("nodeMutation", () => {
    it("Add two connexions and one hidden node", () => {
      const network1 = NeatUtils.generatePerceptron({ shape: [1, 1] });
      const neat = new Neat();
      neat.species = [[network1]];
      NeatUtils.nodeMutation(network1.connexions[0], network1, neat);
      expect(network1.connexions.length).toEqual(3);
      expect(network1.nodes.length).toEqual(3);
      expect(network1.hiddenNodes.length).toEqual(1);
      NeatUtils.nodeMutation(network1.connexions[1], network1, neat);
      expect(network1.connexions.length).toEqual(5);
      expect(network1.nodes.length).toEqual(4);
      expect(network1.hiddenNodes.length).toEqual(2);
    });
    it("Don't do anything if trying to mutate a connexion that has already been done (same innovation in same network)", () => {
      console.warn = jest.fn();
      const network1 = NeatUtils.generatePerceptron({ shape: [1, 1] });
      const neat = new Neat();
      neat.species = [[network1]];
      NeatUtils.nodeMutation(network1.connexions[0], network1, neat);
      expect(network1.connexions.length).toEqual(3);
      expect(network1.nodes.length).toEqual(3);
      expect(network1.hiddenNodes.length).toEqual(1);
      NeatUtils.nodeMutation(network1.connexions[0], network1, neat);
      expect(network1.connexions.length).toEqual(3);
      expect(network1.nodes.length).toEqual(3);
      expect(network1.hiddenNodes.length).toEqual(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
    it("Desactivate the mutated connexion", () => {
      const network1 = NeatUtils.generatePerceptron({ shape: [1, 1] });
      const neat = new Neat();
      neat.species = [[network1]];
      NeatUtils.nodeMutation(network1.connexions[0], network1, neat);
      expect(network1.connexions[0].active).toEqual(false);
      NeatUtils.nodeMutation(network1.connexions[1], network1, neat);
      expect(network1.connexions[1].active).toEqual(false);
      NeatUtils.nodeMutation(network1.connexions[3], network1, neat);
      expect(network1.connexions[3].active).toEqual(false);
    });
    it("Increment the innovation number when innovation is new", () => {
      const networks = new Array(10)
        .fill(0)
        .map((d) => NeatUtils.generatePerceptron({ shape: [2, 2] }));
      const neat = new Neat();
      neat.species = [networks];
      expect(networks[0].connexions[0].innovation).toEqual(1);
      NeatUtils.nodeMutation(networks[0].connexions[0], networks[0], neat);
      expect(networks[0].connexions[1].innovation).toEqual(2);
      expect(networks[0].connexions[2].innovation).toEqual(3);
    });
    it("Does not increment the innovation number when innovation exists in other networks", () => {
      const neat = new Neat();
      const population = new Array(10)
        .fill(0)
        .map((d) => NeatUtils.generatePerceptron({ shape: [3, 3, 3] }));
      neat.species = [population];
      const maxConnexionInnov1 = Math.max(
        ...neat.population[0].connexions.map((d) => d.innovation)
      );
      const maxNodeInnov1 = Math.max(
        ...neat.population[0].nodes.map((d) => d.innovation)
      );
      NeatUtils.nodeMutation(
        neat.population[0].connexions[0],
        neat.population[0],
        neat
      );
      const maxConnexionInnov2 = Math.max(
        ...neat.population[0].connexions.map((d) => d.innovation)
      );
      const maxNodeInnov2 = Math.max(
        ...neat.population[0].nodes.map((d) => d.innovation)
      );
      expect(maxConnexionInnov2).toEqual(maxConnexionInnov1 + 2);
      expect(maxNodeInnov2).toEqual(maxNodeInnov1 + 1);
      const lastConnextionIndex = neat.population[0].connexions.length - 1;
      const lastNodeIndex = neat.population[0].nodes.length - 1;
      expect(
        neat.population[0].connexions[lastConnextionIndex].innovation
      ).toEqual(maxConnexionInnov2);
      expect(
        neat.population[0].connexions[lastConnextionIndex - 1].innovation
      ).toEqual(maxConnexionInnov2 - 1);
      expect(neat.population[0].nodes[lastNodeIndex].innovation).toEqual(
        maxNodeInnov2
      );
      // Mutate the same connexion again
      NeatUtils.nodeMutation(
        neat.population[1].connexions[0],
        neat.population[1],
        neat
      );
      // Expect the same results
      expect(maxNodeInnov2).toEqual(maxNodeInnov1 + 1);
      expect(
        neat.population[0].connexions[lastConnextionIndex].innovation
      ).toEqual(maxConnexionInnov2);
      expect(
        neat.population[0].connexions[lastConnextionIndex - 1].innovation
      ).toEqual(maxConnexionInnov2 - 1);
      expect(neat.population[0].nodes[lastNodeIndex].innovation).toEqual(
        maxNodeInnov2
      );
    });
  });
  describe("selectPopulation", () => {
    const shape = [1, 1];
    const neat = new Neat();
    const networks = new Array(100).fill(0).map((d) => new Network({ shape }));
    neat.species = [networks];
    networks.forEach((p, i) => (p.adjustedFitness = i));
    it("Remove the correct percentage of the population", () => {
      NeatUtils.selectPopulation(neat);
      expect(neat.population.length).toEqual(50);
      NeatUtils.selectPopulation(neat);
      expect(neat.population.length).toEqual(25);
    });
    it("Only the best survived in each generation", () => {
      neat.population.forEach((p) => expect(p.fitness >= 73));
    });
  });
  describe("removeXPercent", () => {
    const testArray = new Array(100).fill(0);
    const rates = [0.1, 0.4, 0.88];
    it("Remove the correct percentage of the array", () => {
      const test1 = NeatUtils.removeXPercent(testArray, rates[0]);
      expect(test1.length).toEqual(10);
      const test2 = NeatUtils.removeXPercent(testArray, rates[1]);
      expect(test2.length).toEqual(40);
      const test3 = NeatUtils.removeXPercent(testArray, rates[2]);
      expect(test3.length).toEqual(88);
    });
  });
  describe("computeFitness", () => {
    const shape = [1, 1];
    const neat = new Neat();
    const networks = new Array(100).fill(0).map((d) => new Network({ shape }));
    neat.species = [networks];
    const fitnessFunction = jest.fn();
    it("Call the fitness function provided by user for each individual", () => {
      neat.configuration.fitnessFunction = fitnessFunction;
      NeatUtils.computeFitness(neat);
      expect(fitnessFunction).toHaveBeenCalledTimes(100);
    });
    it("Assign the correct value to the individuals", () => {
      neat.configuration.fitnessFunction = () => 10;
      NeatUtils.computeFitness(neat);
      neat.population.forEach((p) => expect(p.fitness).toEqual(10));
    });
  });
  describe("speciatePopulation", () => {
    describe("speciate different weighted networks but same structure", () => {
      it("", () => {
        const neat = new Neat({ maxEpoch: 2 });
        neat.configuration.distanceConfiguration.compatibilityThreshold = 0.2;
        const species = new Array(100)
          .fill(0)
          .map((d) => new Network({ shape: [1, 1] }));
        species.forEach((g, i) => {
          const weight = i < 25 ? 1 : 0;
          g.connexions.push(new Connexion({ weight, innovation: 1 }));
        });
        neat.species = [species];
        NeatUtils.speciatePopulation(neat);
        expect(neat.species.length).toEqual(2);
        expect(neat.species[0].length).toEqual(75);
        expect(neat.species[1].length).toEqual(25);
      });
    });
  });
});
