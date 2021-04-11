import { Neat } from "../Neat";
import { NeatUtils } from "../NeatUtils";

NeatUtils.initializePopulation = jest.fn();
NeatUtils.createNewPopulation = jest.fn();
NeatUtils.speciatePopulation = jest.fn();
NeatUtils.evaluateFitness = jest.fn();
NeatUtils.evaluateCriteria = jest.fn();

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
  describe("Run", () => {
    const neat = new Neat();
    neat.run();
    it("Trigger initialize population method one time", () => {
      expect(NeatUtils.initializePopulation).toHaveBeenCalledTimes(1);
    });
    it("Trigger create new population maxEpoch times", () => {
      expect(NeatUtils.createNewPopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
    it("Trigger evaluate fitness maxEpoch times", () => {
      expect(NeatUtils.evaluateFitness).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
    it("Trigger evaluate criteria maxEpoch times", () => {
      expect(NeatUtils.evaluateCriteria).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
  });
});

//describe("Neat class - unit tests - class methods", () => {});
