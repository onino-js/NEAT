const { Neat } = require("./../Neat");

describe("Neat class - unit tests - instance methods", () => {
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
      expect(() => new Neat({ maxEpoch: "3" })).toThrow();
      expect(() => new Neat({ maxEpoch: [3] })).toThrow();
    });
  });

  describe("Run", () => {
    const neat = new Neat();
    neat.initializePopulation = jest.fn();
    neat.createNewPopulation = jest.fn();
    neat.speciatePopulation = jest.fn();
    neat.evaluateFitness = jest.fn();
    neat.evaluateCriteria = jest.fn();
    neat.run();
    it("Trigger initialize population method one time", () => {
      expect(neat.initializePopulation).toHaveBeenCalledTimes(1);
    });
    it("Trigger create new population maxEpoch times", () => {
      expect(neat.createNewPopulation).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
    it("Trigger evaluate fitness maxEpoch times", () => {
      expect(neat.evaluateFitness).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
    it("Trigger evaluate criteria maxEpoch times", () => {
      expect(neat.evaluateCriteria).toHaveBeenCalledTimes(
        neat.configuration.maxEpoch
      );
    });
  });
});

describe("Neat class - unit tests - class methods", () => {});
