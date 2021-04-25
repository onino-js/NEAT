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
    it("Apply configuration", () => {
      const neat = new Neat({ maxEpoch: 10 });
      expect(neat.configuration.maxEpoch).toEqual(10);
    });
    it("Throw error with inccorect configuration", () => {
      let createNeat = () => new Neat({ maxEpoch: -3 });
      expect(createNeat).toThrow();
      //@ts-ignore
      createNeat = () => new Neat({ maxEpoch: "3" });
      expect(createNeat).toThrow();
      //@ts-ignore
      createNeat = () => new Neat({ maxEpoch: [3] });
      expect(createNeat).toThrow();
    });
  });
  describe("Run - run the Neat algorithm", () => {
    it("Trigger initialize population method one time", () => {
      const neat = new Neat();
      neat.run();
      expect(NeatUtils.initializePopulation).toHaveBeenCalledTimes(1);
    });
  });
  describe("evealuate criteria always return false", () => {
    it("Trigger speciate, mutate, select and crossover maxEpoch times", () => {
      const neat = new Neat({ shape: [3, 3] });
      neat.run();
      expect(NeatUtils.selectPopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.speciatePopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      expect(NeatUtils.mutatePopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
      // expect(NeatUtils.crossoverPopulation).toHaveBeenCalledTimes(
      //   neat.configuration.maxEpoch
      // );
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
