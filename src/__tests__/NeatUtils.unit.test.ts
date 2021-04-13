import { NeuronType } from "./../models";
import { AxonGene, Genome, NeuronGene } from "../Genome";
import { NeatUtils } from "./../NeatUtils";
import { Neat } from "../Neat";
import { Phenotype } from "../Phenotype";

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
      NeatUtils.generatePerceptron([1, 0, 1]);
      expect(NeatUtils.checkShape).toHaveBeenCalledTimes(1);
    });
    it("Returns a phenotype without errors", () => {
      const createPhenotype = () => NeatUtils.generatePerceptron([1, 1]);
      expect(createPhenotype).not.toThrow();
    });
    it("Returns a phenotype with correct total number of nodes", () => {
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.neurons).toHaveLength(2);
      phenotype = NeatUtils.generatePerceptron([5, 1]);
      expect(phenotype.neurons).toHaveLength(6);
      phenotype = NeatUtils.generatePerceptron([1, 7]);
      expect(phenotype.neurons).toHaveLength(8);
    });
    it("Returns a phenotype with correct number of inputs nodes", () => {
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.inputNodes).toHaveLength(1);
      phenotype = NeatUtils.generatePerceptron([5, 1]);
      expect(phenotype.inputNodes).toHaveLength(5);
    });
    it("Returns a phenotype with correct number of hiddens nodes", () => {
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.hiddenNodes).toHaveLength(0);
      phenotype = NeatUtils.generatePerceptron([1, 5, 1]);
      expect(phenotype.hiddenNodes).toHaveLength(5);
    });
    it("Returns a phenotype with correct number of output nodes", () => {
      let shape = [1, 1];
      let phenotype = NeatUtils.generatePerceptron(shape);
      expect(phenotype.outputNodes).toHaveLength(shape[1]);
      shape = [1, 1, 5];
      phenotype = NeatUtils.generatePerceptron([1, 1, 5]);
      expect(phenotype.outputNodes).toHaveLength(shape[2]);
    });
    it("Returns a phenotype with correct number of connexions", () => {
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.axons).toHaveLength(1);
      phenotype = NeatUtils.generatePerceptron([1, 1, 5]);
      expect(phenotype.axons).toHaveLength(6);
    });
  });
  describe("getNeuronGenesFromShape", () => {
    it("Returns an array of Genes", () => {
      let shape = [1, 1];
      let genes = NeatUtils.getNeuronGenesFromShape(shape);
      expect(genes.length).toEqual(2);
      expect(genes.filter((g) => g.type === NeuronType.INPUT).length).toEqual(
        shape[0]
      );
      expect(genes.filter((g) => g.type === NeuronType.OUTPUT).length).toEqual(
        shape[1]
      );
      shape = [2, 3, 4];
      genes = NeatUtils.getNeuronGenesFromShape(shape);
      expect(genes.length).toEqual(2 + 3 + 4);
      expect(genes.filter((g) => g.type === NeuronType.INPUT).length).toEqual(
        shape[0]
      );
      expect(genes.filter((g) => g.type === NeuronType.OUTPUT).length).toEqual(
        shape[2]
      );
      expect(genes.filter((g) => g.type === NeuronType.HIDDEN).length).toEqual(
        shape[1]
      );
    });
  });
  describe("computeNumberOfMissmatchGenes", () => {
    const neuronGenes = [
      new NeuronGene({ innovation: 1 }),
      new NeuronGene({ innovation: 2 }),
      new NeuronGene({ innovation: 3 }),
    ];
    const axonGenes1 = [
      new AxonGene({ innovation: 4 }),
      new AxonGene({ innovation: 5 }),
      new AxonGene({ innovation: 6 }),
    ];
    const axonGenes2 = [
      new AxonGene({ innovation: 4 }),
      new AxonGene({ innovation: 5 }),
      new AxonGene({ innovation: 6 }),
    ];
    const genome1 = new Genome({ neuronGenes, axonGenes: axonGenes1 });
    const genome2 = new Genome({ neuronGenes, axonGenes: axonGenes2 });
    let d = NeatUtils.computeNumberOfMissmatchGenes([genome1, genome2]);
    expect(d).toEqual(0);
    genome2.axonGenes[2].innovation = 7;
    d = NeatUtils.computeNumberOfMissmatchGenes([genome1, genome2]);
    expect(d).toEqual(2);
    genome2.neuronGenes[2].innovation = 8; // neuronGenes are the same in both genomes
    d = NeatUtils.computeNumberOfMissmatchGenes([genome1, genome2]);
    expect(d).toEqual(2);
    genome2.axonGenes[0].innovation = 9;
    d = NeatUtils.computeNumberOfMissmatchGenes([genome1, genome2]);
    expect(d).toEqual(4);
  });
  describe("selectPopulation", () => {
    const neat = new Neat();
    const genomes = new Array(100).fill(0).map((d) => new Genome());
    const g1 = new Genome();
    const g2 = new Genome();
    neat.population = genomes
      .map((g) => g.phenotype)
      .map((p, i) => ({ ...p, adjustedFitness: i } as Phenotype));
    it("Remove the correct percentage of the population", () => {
      NeatUtils.selectPopulation(neat);
      expect(neat.population.length).toEqual(50);
    });
    it("Only the bests survived", () => {});
  });
});
