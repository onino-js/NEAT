export const helpers = {
  /**
   * Returns the layer index of the nth element.
   *
   * @param {number[]} layers Layers in the form of an array of number. Each array item represents the number of neurons in the corresponding layer
   * @param {number} neuronIndex The neuron index
   * @return {number} the layer index or the neuron
   */
  getLayerIndex: (layers: number[], neuronIndex: number): number => {
    layers.forEach((n) => {
      if (n <= 0) {
        throw new Error("Error: layers should be an array of positive integer");
      }
    });
    let res = 0;
    let acc = 0;
    layers.forEach((l) => {
      acc += l;
      if (neuronIndex >= acc) res += 1;
    });
    return res;
  },
  getRowIndex: (layers: number[], neuronIndex: number): number => {
    let res = 0;
    let acc = 0;
    layers.forEach((l) => {
      acc += l;
      if (neuronIndex >= acc) res += 1;
    });
    return res;
  },
};
