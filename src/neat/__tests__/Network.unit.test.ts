import { Connexion } from "../Connexion";
import { NodeType } from "../models";
import { NeatUtils } from "../NeatUtils";
import { Network } from "../Network";
import { Node } from "../Node";

describe("class Network", () => {
  describe("Constructor", () => {
    it("Instantiate without error", () => {
      const createNet = () => new Network({ shape: [2, 2] });
      expect(createNet).not.toThrow();
    });
    it("Instantiate with correct number of nodes from shape", () => {
      let net = new Network({ shape: [1, 1] });
      expect(net.nodes.length).toEqual(2);
      net = new Network({ shape: [2, 2] });
      expect(net.nodes.length).toEqual(4);
      net = new Network({ shape: [5, 6] });
      expect(net.nodes.length).toEqual(11);
    });
    it("Instantiate with correct number of input and output nodes from shape", () => {
      let net = new Network({ shape: [1, 1] });
      expect(net.inputNodes.length).toEqual(1);
      expect(net.outputNodes.length).toEqual(1);
      net = new Network({ shape: [2, 2] });
      expect(net.inputNodes.length).toEqual(2);
      expect(net.outputNodes.length).toEqual(2);
      net = new Network({ shape: [5, 6] });
      expect(net.inputNodes.length).toEqual(5);
      expect(net.outputNodes.length).toEqual(6);
    });
  });
  describe("checkinputs", () => {
    const net = new Network({ shape: [3, 4] });
    it("Do not throw when called with correct params", () => {
      //@ts-ignore
      const checkInputs = () => net.checkInputs([1, 1, 1]);
      expect(checkInputs).not.toThrow();
    });
    it("Throw when called with incorrect number of inputs", () => {
      //@ts-ignore
      const checkInputs = () => net.checkInputs([1, 1]);
      expect(checkInputs).toThrow();
    });
    it("Throw when called with incorrect inputs", () => {
      //@ts-ignore
      const checkInputs = () => net.checkInputs([1, 1, "1"]);
      expect(checkInputs).toThrow();
    });
  });
  describe("addNode", () => {
    it("Set node index correctly", () => {
      const net = new Network({ shape: [1, 1] });
      const node = new Node();
      const nIndex = net.addNode(node).nodeIndex;
      expect(net.nodes.length).toEqual(3);
      expect(nIndex).toEqual(3);
      const node2 = new Node();
      net.addNode(node2);
      expect(net.nodes.length).toEqual(4);
      expect(node2.nodeIndex).toEqual(4);
    });
    it("Set type correctly", () => {
      const net = new Network({ shape: [1, 1] });
      const node = new Node();
      net.addNode(node);
      expect(node.type).toEqual(NodeType.HIDDEN);
      const node2 = new Node();
      net.addNode(node2);
      expect(node2.type).toEqual(NodeType.HIDDEN);
    });
  });
  describe("connectNodes", () => {
    it("Add a connexion", () => {
      const net = new Network({ shape: [1, 1] });
      net.connectNodes(1, 2);
      expect(net.connexions.length).toEqual(1);
      const node = new Node();
      net.addNode(node);
      net.connectNodes(3, 2);
      net.connectNodes(1, 3);
      expect(net.connexions.length).toEqual(3);
    });
    it("Node are connected", () => {
      const net = new Network({ shape: [1, 1] });
      net.connectNodes(1, 2);
      const node = new Node();
      net.addNode(node);
      expect(net.connexions[0].input).toEqual(net.getNodeByIndex(1));
      expect(net.connexions[0].output).toEqual(net.getNodeByIndex(2));
      net.connectNodes(3, 2);
      expect(net.connexions[1].input).toEqual(net.getNodeByIndex(3));
      expect(net.connexions[1].output).toEqual(net.getNodeByIndex(2));
      net.connectNodes(1, 3);
      expect(net.connexions[2].input).toEqual(net.getNodeByIndex(1));
      expect(net.connexions[2].output).toEqual(net.getNodeByIndex(3));
    });
    it("Throw error when connexion is not allowed", () => {
      const net = new Network({ shape: [1, 1] });
      const node = new Node();
      net.addNode(node);
      const connect1 = () => net.connectNodes(2, 3);
      expect(connect1).toThrow();
      const connect2 = () => net.connectNodes(3, 1);
      expect(connect2).toThrow();
    });
    it("Throw error when connexion already exists", () => {
      const net = new Network({ shape: [1, 1] });
      net.connectNodes(1, 2);
      const connect = () => net.connectNodes(1, 2);
      expect(connect).toThrow();
    });
  });
  describe("feedForward", () => {
    it("trigger activation function correct number of time - simple network", () => {
      const mockActivation = jest.fn();
      const net = new Network({ shape: [1, 1] });
      const node = new Node({ type: NodeType.HIDDEN });
      const nIndex = net.addNode(node).nodeIndex;
      net.connectNodes(1, nIndex);
      net.connectNodes(nIndex, 2);
      net.feedForward([1], mockActivation);
      expect(mockActivation).toHaveBeenCalledTimes(2);
    });
    it("trigger activation function correct number of time - perceptron", () => {
      const shape1 = [3, 4];
      const perceptron = NeatUtils.generatePerceptron({ shape: [3, 4] });
      const mockActivation = jest.fn();
      perceptron.feedForward([1, 1, 1], mockActivation);
      expect(mockActivation).toHaveBeenCalledTimes(shape1[1]);
      const shape2 = [3, 10, 4];
      const perceptron2 = NeatUtils.generatePerceptron({ shape: [3, 10, 4] });
      const mockActivation2 = jest.fn();
      perceptron2.feedForward([1, 1, 1], mockActivation2);
      expect(mockActivation2).toHaveBeenCalledTimes(shape2[1] + shape2[2]);
    });
    it("trigger activation function correct number of time - recurent network", () => {
      const shape = [3, 4, 3];
      const perceptron = NeatUtils.generatePerceptron({ shape });
      perceptron.connectNodes(4, 4);
      perceptron.connectNodes(5, 5);
      perceptron.connectNodes(6, 6);
      perceptron.connectNodes(7, 7);
      const mockActivation = jest.fn();
      perceptron.feedForward([1, 1, 1], mockActivation);
      expect(mockActivation).toHaveBeenCalledTimes(shape[1] + shape[2]);
    });
    it("trigger feedForward method of each connexion one time - perceptron", () => {
      const shape = [3, 4, 3];
      const feedMock = jest.fn();
      const perceptron = NeatUtils.generatePerceptron({ shape });
      perceptron.connexions.forEach((c) => (c.feedForward = feedMock));
      perceptron.feedForward([1, 1, 1], () => 1);
      expect(feedMock).toHaveBeenCalledTimes(perceptron.connexions.length);
    });
    it("trigger feedForward method of each connexion one time - recurrent perceptron", () => {
      const shape = [3, 4, 3];
      const feedMock = jest.fn();
      const perceptron = NeatUtils.generatePerceptron({ shape });
      perceptron.connexions.forEach((c) => (c.feedForward = feedMock));
      perceptron.feedForward([1, 1, 1], () => 1);
      expect(feedMock).toHaveBeenCalledTimes(perceptron.connexions.length);
    });
  });
});
