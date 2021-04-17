import { ActivationType, INeatConfiguration } from "./models";

// The default configuration object.
// The settings are pretty the same than the original paper
export const INITIAL_CONFIGURATION: INeatConfiguration = {
  populationSize: 200,
  survivalRate: 0.5,
  reproducerRate: 0.4,
  mutationRates: {
    addNeuronGene: 0.05,
    addAxonGene: 0.05,
    removeNeuronGene: 0.05,
    removeAxonGene: 0.05,
    changeAxonGeneWeight: 0.05,
  },
  maxEpoch: 50,
  shape: [1, 0, 1],
  distanceConfiguration: {
    c1: 2,
    c2: 0.5,
    c3: 1,
    compatibilityThreshold: 1.5,
  },
  fitnessFunction: (input) => 0,
  activationFunction: ActivationType.RELU,
  recursive:false
};
