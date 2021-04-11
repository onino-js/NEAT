import { NeatUtils } from "./../NeatUtils";

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
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.outputNodes).toHaveLength(1);
      phenotype = NeatUtils.generatePerceptron([1, 1, 5]);
      expect(phenotype.outputNodes).toHaveLength(5);
    });
    it("Returns a phenotype with correct number of connexions", () => {
      let phenotype = NeatUtils.generatePerceptron([1, 1]);
      expect(phenotype.axons).toHaveLength(1);
      phenotype = NeatUtils.generatePerceptron([1, 1, 5]);
      expect(phenotype.axons).toHaveLength(6);
    });
  });
  describe("computeNumberOfDisjointGenes", () => {});
});
