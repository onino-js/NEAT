import { ActivationType, INeatConfiguration } from "./models";

// The default configuration object.
// The settings are pretty the same than the original paper
export const INITIAL_CONFIGURATION: INeatConfiguration = {
  populationSize: 10,
  survivalRate: 0.5,
  reproducerRate: 0.4,
  mutationRates: {
    addNode: 1,
    addConnexion: 1,
    removeNode: 0.05,
    removeConnexion: 0.05,
    changeConnexionWeight: 0.8,
  },
  maxEpoch: 30,
  shape: [1, 1],
  distanceConfiguration: {
    c1: 2,
    c2: 0.5,
    c3: 1,
    compatibilityThreshold: 1.5,
  },
  fitnessFunction: (input) => 0,
  activationType: ActivationType.RELU,
  recursive: false,
};
