import { Neat } from "../Neat";
import { NeatUtils } from "../NeatUtils";

NeatUtils.initializePopulation = jest.fn();
NeatUtils.selectPopulation = jest.fn();
NeatUtils.crossoverPopulation = jest.fn();
NeatUtils.mutatePopulation = jest.fn();
NeatUtils.speciatePopulation = jest.fn();
NeatUtils.computeFitness = jest.fn();
NeatUtils.evaluateCriteria = jest.fn(() => false);

afterEach(() => {
  jest.clearAllMocks();
});

describe("class Neat", () => {
  describe("Constructor", () => {
    it("Instantiate without error without configuration", () => {
      const createNeat = () => new Neat();
      expect(createNeat).not.toThrow();
    });
    it("Instantiate without error without correct configuration", () => {
      const createNeat = () => new Neat();
      expect(createNeat).not.toThrow();
    });
    it("Throw error with inccorect configuration", () => {
      expect(() => new Neat({ maxEpoch: -3 })).toThrow();
      //@ts-ignore
      expect(() => new Neat({ maxEpoch: "3" })).toThrow();
      //@ts-ignore
      expect(() => new Neat({ maxEpoch: [3] })).toThrow();
    });
  });
  describe("Run - run the Neat algorithm", () => {
    const neat = new Neat();
    it("Trigger initialize population method maxEpoch time", () => {
      neat.run();
      expect(NeatUtils.initializePopulation).toHaveBeenCalledTimes(1);
    });
  });
  describe("evealuate criteria always return false", () => {
    const neat = new Neat();
    it("Trigger speciate, mutate, select and crossover maxEpoch times", () => {
      neat.run();
      expect(NeatUtils.speciatePopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.mutatePopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.crossoverPopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.computeFitness).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.evaluateCriteria).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
  });
});

//describe("Neat class - unit tests - class methods", () => {});
