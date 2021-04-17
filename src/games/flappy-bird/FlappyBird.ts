import { Bird } from "./Bird";
import { PipePair } from "./Pipe";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PIPE_HEIGHT,
  PIPE_WIDTH,
  NB_PIPE_PAIRS,
  PIPE_DISTANCE,
  LIFT,
} from "./constants";

export interface IFlappyBirdInputs {
  y: number;
  v: number;
  h1: number;
  h2: number;
}

class FlappyBird {
  public canvasRef: HTMLCanvasElement;
  public canvasContext: CanvasRenderingContext2D;
  public loopCallback: (d: IFlappyBirdInputs) => void;
  private isRunning: boolean = false;
  private animationId: number;
  private bird: Bird;
  private pipePairs: PipePair[] = [];

  public init(id: string) {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLCanvasElement)) {
      throw "Visualizer can't initialize. Provided id doesn't match any canvas element in the dom";
    } else {
      this.canvasRef = el;
      this.canvasContext = el.getContext("2d");
      el.width = WORLD_WIDTH;
      el.height = WORLD_HEIGHT;
      this.bird = Bird.create(this.canvasContext);
      this.createPipePairs();
      this.addKeyboardControls();
    }
  }

  private createPipePairs() {
    const pairs: PipePair[] = [];
    new Array(NB_PIPE_PAIRS).fill(0).forEach((d, i) => {
      const pair = new PipePair({
        x: WORLD_WIDTH + i * PIPE_DISTANCE,
        y: 0,
        width: PIPE_WIDTH,
        height: PIPE_HEIGHT,
        canvasContext: this.canvasContext,
        image: document.getElementById("pipe-sprite")! as HTMLImageElement, // TODO - remove that
      });
      pairs.push(pair);
    });
    this.pipePairs = pairs;
  }

  private update() {
    this.bird.update();
    this.pipePairs.forEach((pipePair) => pipePair.update());
    this.pipePairs.forEach((pipePair) => {
      if (pipePair.offscreen) {
        pipePair.place();
      }
    });
  }

  private render() {
    this.clear();
    this.renderBackground();
    this.bird.render();
    this.pipePairs.forEach((pipePair) => pipePair.render());
  }

  private restart() {
    this.bird.place();
    this.bird.velocity = -LIFT / 2;
    this.createPipePairs();
  }

  private run() {
    this.animationId = requestAnimationFrame(() => {
      this.run();
    });
    this.loop();
  }

  public start() {
    if (!this.isRunning) this.run();
    this.isRunning = true;
  }

  public stop() {
    window.cancelAnimationFrame(this.animationId);
    this.restart();
    this.render();
    this.isRunning = false;
  }

  private loop() {
    this.pipePairs.forEach((pipePair) =>
      pipePair.pipes.forEach((pipe) => {
        if (this.bird.hasCollide(pipe)) {
          this.restart();
        }
      })
    );
    if (this.bird.offscreen) {
      this.restart();
    } else {
      this.update();
      this.render();
    }
  }

  public clear() {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasRef.width,
      this.canvasRef.height
    );
  }

  private addKeyboardControls() {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          this.bird.up();
      }
    });
  }

  private renderBackground() {
    this.canvasContext.drawImage(
      document.getElementById("background-sprite")! as HTMLImageElement,
      0,
      0
    );
  }

  public setLoopCallback(loopCallback) {
    this.loopCallback = loopCallback;
  }

  public get inputs() {
    return {
      y: this.bird.y,
      v: this.bird.velocity,
      h1: this.pipePairs
        .map((pp) => this.bird.x - pp.pipes[0].x)
        .reduce((acc, cur) => {
          return acc <= cur ? acc : cur;
        }, 0),
      h2: this.pipePairs
        .map((pp) => this.bird.y - pp.pipes[0].y)
        .reduce((acc, cur) => {
          return acc <= cur ? acc : cur;
        }, 0),
    };
  }

  public get normalizeInputs() {
    const inputs = this.inputs;
    return {
      y: inputs.y / WORLD_HEIGHT,
      v: inputs.v / 50,
      h1: inputs.h1 / WORLD_HEIGHT,
      h2: inputs.h2 / WORLD_HEIGHT,
    };
  }
}

export { FlappyBird };
