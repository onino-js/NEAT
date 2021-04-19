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
  describe("computeNumberOfMissmatchGenes", () => {
    const shape = [1, 1];
    const nodes = [
      new Node({ innovation: 1 }),
      new Node({ innovation: 2 }),
      new Node({ innovation: 3 }),
    ];
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
    const network1 = new Network({ shape, nodes, connexions: connexions1 });
    const network2 = new Network({ shape, nodes, connexions: connexions2 });
    let d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(0);
    network2.connexions[2].innovation = 7;
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(2);
    network2.nodes[2].innovation = 8; // nodes are the same in both networks
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(2);
    network2.connexions[0].innovation = 9;
    d = NeatUtils.computeNumberOfMissmatchGenes([network1, network2]);
    expect(d).toEqual(4);
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
      it("", () => {
        NeatUtils.speciatePopulation(neat);
        expect(neat.species.length).toEqual(2);
        expect(neat.species[0].length).toEqual(75);
        expect(neat.species[1].length).toEqual(25);
      });
    });
  });
});
