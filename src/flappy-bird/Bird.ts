import { WORLD_WIDTH } from "./constants";
import { CanvasObject } from "./CanvasObject";
import {
  GRAVITY,
  LIFT,
  BIRD_X,
  WORLD_HEIGHT,
  BIRD_HEIGHT,
  BIRD_WIDTH,
} from "./constants";

class Bird extends CanvasObject {
  public alive: boolean = true;
  public score: number;
  public velocity: number = -LIFT / 2;

  public up() {
    if (this.alive) this.velocity -= LIFT;
  }

  public update() {
    this.score++;
    this.velocity += GRAVITY;
    this.y += this.velocity;
  }

  public place() {
    this.x = WORLD_WIDTH / 3;
    this.y = WORLD_HEIGHT / 2;
    this.velocity = 0;
  }

  static create(canvasContext: CanvasRenderingContext2D) {
    return new Bird({
      x: BIRD_X,
      y: WORLD_HEIGHT / 2,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT,
      canvasContext: canvasContext,
      image: document.getElementById("bird-sprite")! as HTMLImageElement,
    });
  }

  public getoffsetH(obj: CanvasObject) {
    return this.x - obj.x;
  }
}

export { Bird };
