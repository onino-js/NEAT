import { AxonGene, NeuronGene } from "./Genome";
import { Phenotype } from "./Phenotype";

export enum NeuronType {
  INPUT = "INPUT",
  HIDDEN = "HIDDEN",
  OUTPUT = "OUTPUT",
}

export interface ImutationRates {
  addNeuronGene: number; // Mutation rate for adding a new neuron gene in the genome
  addAxonGene: number; // Mutation rate for adding a new axon gene in the genome
  removeNeuronGene: number; // Mutation rate for removing a neuron gene in the genome
  removeAxonGene: number; // Mutation rate for removing an axon gene in the genome
  changeAxonGeneWeight: number; // Mutation rate for changing the weight in an axion gene
}

export interface INeatConfiguration {
  populationSize: number; // The total population size of each generation
  survivalRate: number; // The survival rate to apply during the selection process
  reproducerRate: number; // The rate of indivudals allowed to reproduce through crossover within a species (using fitness to select among the X% performers).
  mutationRates: ImutationRates; // An object representing mutation rates for each kind of mutation
  maxEpoch: number; // The maximum number of iteration of the NEAT algorithm
  shape: [number, number, number]; // The initial shape of the network. The first number is the number of inputs, then hiddens and outputs.
  distanceConfiguration: IdistanceConfiguration; // A object containing informations for the distance calculation. The distance between phenotypes is used to perform speciation.
  fitnessFunction: IfitnessFunction;
}

export interface IdistanceConfiguration {
  c1: number; // Caonstant C1 of the compatibility function TODO - [link text](./../documentation/glossary.md)
  c2: number; // Caonstant C2 of the compatibility function TODO - Ref
  c3: number; // Caonstant C3 of the compatibility function TODO - Ref
  compatibilityThreshold: number; // If the distance between two phenotypes is below this value, they are considered to be of the same species
}

export interface IfitnessFunction {
  (input: Phenotype): number; // User provided function to evaluate the fitness of a given phenotype.
}

export type IGene = NeuronGene | AxonGene;
