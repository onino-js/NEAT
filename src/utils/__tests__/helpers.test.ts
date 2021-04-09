import { helpers } from "./../helpers";

describe("helpers", () => {
  describe("getLayerIndex", () => {
    test("throw if incorrect inputs", () => {
      const layers = [1, -3, 2];
      const test = () => helpers.getLayerIndex(layers, 1);
      expect(test).toThrow();
    });
    test("return correct values", () => {
      const layers = [1, 3, 2];
      const layerIndex = 1;
      const res = helpers.getLayerIndex(layers, layerIndex);
      expect(res).toEqual(1);
    });
  });
});
