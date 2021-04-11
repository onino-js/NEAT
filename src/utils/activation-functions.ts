const mutate = {
  // Randomly sets the weights to a completely random value.
  RANDOM: (genes: number[], mutationRate: number) =>
    genes.map((gene, i) =>
      Math.random() < mutationRate ? Math.random() * 2 - 1 : gene
    ),

  // Add a random value to the weights.
  EDIT: (genes: number[], mutationRate: number) =>
    genes.map((gene) =>
      Math.random() < mutationRate ? gene + Math.random() - 0.5 : gene
    ),
};

// Crossover methods
const crossover = {
  // Randomly take genes from parentx or parenty and return newly created genes.
  RANDOM: (genesx: number[], genesy: number[]) =>
    genesx.map((genex, i) => (Math.random() < 0.5 ? genex : genesy[i])),

  // Takes a starting and an ending point in parentx's genes removes the genes in between and replaces them with parenty's genes. (How nature does it.)
  SLICE: (genesx: number[], genesy: number[]) => {
    const randoms = [0, 0].map((d) =>
      Math.floor(Math.random() * genesx.length)
    );
    const start = Math.min(randoms[0], randoms[1]);
    const end = Math.max(randoms[0], randoms[1]);
    return genesx.map((gene, i) => (i >= start && i < end ? gene : genesy[i]));
  },
};

export { mutate, crossover };

export interface IActivationFunction {
  (input: number): number;
}

export const SIGMOID: IActivationFunction = (input) =>
  1 / (1 + Math.exp(-input));

export const TANH: IActivationFunction = (input) => Math.tanh(input);

export const RELU: IActivationFunction = (input) => (input > 0 ? input : 0);

export const LEAKY_RELU: IActivationFunction = (x) => (x > 0 ? x : x * 0.01);

export const SOFTMAX = (array) =>
  array.map(
    (d) => Math.exp(d) / array.reduce((acc, cur) => acc + Math.exp(cur), 0)
  );
