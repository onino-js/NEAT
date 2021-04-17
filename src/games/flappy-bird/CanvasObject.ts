import { WORLD_WIDTH, WORLD_HEIGHT } from "./constants";
interface ICanvasObjectParams {
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  rotated?: boolean;
  canvasContext: CanvasRenderingContext2D;
}

abstract class CanvasObject {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public rotated?: boolean = false;
  protected image: HTMLImageElement;
  protected canvasContext: CanvasRenderingContext2D;

  constructor(opt: ICanvasObjectParams) {
    Object.assign(this, opt);
  }

  public render() {
    this.canvasContext.beginPath();
    this.rotated && this.rotateContext();
    this.canvasContext.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.rotated && this.canvasContext.restore();
  }
  public get offscreen() {
    return (
      this.x <= 0 ||
      this.x + this.width >= WORLD_WIDTH ||
      this.y <= 0 ||
      this.y + this.height >= WORLD_HEIGHT
    );
  }

  public hasCollide(obj: CanvasObject): boolean {
    return (
      obj.x < this.x + this.width &&
      obj.x + obj.width > this.x &&
      obj.y < this.y + this.height &&
      obj.height + obj.y > this.y
    );
  }

  private rotateContext() {
    this.canvasContext.save();
    this.canvasContext.translate(
      this.x + this.width / 2,
      this.y + this.height / 2
    );
    this.canvasContext.rotate(Math.PI);
    this.canvasContext.translate(
      -this.x - this.width / 2,
      -this.y - this.height / 2
    );
  }
}

export { CanvasObject, ICanvasObjectParams };
