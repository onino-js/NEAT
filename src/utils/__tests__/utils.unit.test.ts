import { createId } from "./../create-id";
import { helpers } from "../helpers";
import { Identifiable } from "../Identifiable";

describe("utils", () => {
  describe("helpers", () => {
    describe("function getLayerIndex", () => {
      it("throw if incorrect inputs", () => {
        const layers = [1, -3, 2];
        const test = () => helpers.getLayerIndex(layers, 1);
        expect(test).toThrow();
      });
      it("return correct values", () => {
        const layers = [1, 3, 2];
        const layerIndex = 1;
        const res = helpers.getLayerIndex(layers, layerIndex);
        expect(res).toEqual(1);
      });
    });
  });

  describe("function createId", () => {
    const id = createId();
    expect(id).toHaveLength(36);
    //  expect(id).toBeInstanceOf("string");
  });

  describe("class Identifiable", () => {
    const identifiable = new Identifiable();
    expect(identifiable.id).toBeDefined();
    expect(identifiable.id).toHaveLength(36);
    //  expect(id).toBeInstanceOf("string");
  });
});
