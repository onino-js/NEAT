import { Neat } from "../../src/neat/Neat";
import { Network } from "../../src/neat/Network";

const fitnessFunction = (a: Network) => {
  let fitness = 4;
  fitness -= Math.abs(a.activate([1, 1])[0]);
  fitness -= Math.abs(a.activate([1, 0])[0] - 1);
  fitness -= Math.abs(a.activate([0, 1])[0] - 1);
  fitness -= Math.abs(a.activate([0, 0])[0]);
  if (a.connexions.length < 2) fitness *= 0.001;
  return Math.max(fitness, 0.001);
};

const main = () => {
  document.getElementById("start").addEventListener("click", () => {
    start();
  });
};

const start = () => {
  const neat = new Neat({ shape: [2, 1], fitnessFunction });
  console.log("Start running neat algorithm....");
  neat.run();
};

window.onload = main;