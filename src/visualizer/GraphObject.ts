abstract class CanvasObject {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  protected canvasContext: CanvasRenderingContext2D;
  constructor(
    _canvasContext: CanvasRenderingContext2D,
    opt: Partial<CanvasObject>
  ) {
    this.canvasContext = _canvasContext;
    Object.assign(this, opt);
  }
}
