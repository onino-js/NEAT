import { INeatConfiguration } from "./../../src/models";
let NEAT = require("./build/NEATbundle_cjs");

const fitnessFunction = (a) => {
  let fitness = 4;
  fitness -= Math.abs(a.activate([1, 1])[0]);
  fitness -= Math.abs(a.activate([1, 0])[0] - 1);
  fitness -= Math.abs(a.activate([0, 1])[0] - 1);
  fitness -= Math.abs(a.activate([0, 0])[0]);
  if (a.connections.length < 2) fitness *= 0.001;
  return Math.max(fitness, 0.001);
};

var neat = new NEAT.NEAT();

neat.run();
