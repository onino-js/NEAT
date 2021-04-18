import { FlappyBird } from "./../../src/games/flappy-bird/FlappyBird";

const main = () => {
  console.log("Begins flappy bird demo ...");
  const game = new FlappyBird();
  game.init("canvas-container");
  game.start();
  document.getElementById("stop-game").addEventListener("click", () => {
    game.stop();
  });
  document.getElementById("start-game").addEventListener("click", () => {
    game.start();
  });
  // document.addEventListener("DOMContentLoaded", run);
  //  run();
};

window.onload = main;
