import {
  WORLD_WIDTH,
  PIPE_HEIGHT,
  PIPE_SPEED,
  PIPE_OFFSET,
  PIPE_GAP,
  PIPE_WIDTH,
} from "./constants";
import { CanvasObject, ICanvasObjectParams } from "./CanvasObject";

class Pipe extends CanvasObject {
  public velocity: number = PIPE_SPEED;
  public image = document.getElementById("pipe-sprite")! as HTMLImageElement;
  public update() {
    this.x -= this.velocity;
  }
}

class PipePair {
  public pipes: [Pipe, Pipe];
  constructor(opts: ICanvasObjectParams) {
    const DELTA_H = this.getDelta();
    this.pipes = [
      new Pipe({ ...opts, y: PIPE_HEIGHT + PIPE_GAP + DELTA_H - PIPE_OFFSET }),
      new Pipe({
        ...opts,
        y: opts.y + DELTA_H - PIPE_OFFSET,
        rotated: true,
      }),
    ];
  }

  get offscreen() {
    return this.pipes[0].x + PIPE_WIDTH <= 0;
  }

  public render() {
    this.pipes.forEach((p) => p.render());
  }

  public update() {
    this.pipes.forEach((p) => p.update());
  }

  public place() {
    const DELTA_H = this.getDelta();
    this.pipes[0].x = WORLD_WIDTH;
    this.pipes[1].x = WORLD_WIDTH;
    this.pipes[0].y = PIPE_HEIGHT + PIPE_GAP + DELTA_H - PIPE_OFFSET;
    this.pipes[1].y = DELTA_H - PIPE_OFFSET;
  }

  private getDelta() {
    return Math.round((Math.random() - 0.5) * 100) * 2;
  }
}

export { Pipe, PipePair };
