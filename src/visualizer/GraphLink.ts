import { Iposition } from "./Visualizer";
import { Axon } from "../Phenotype";

/************************************************************/
/************************class GraphLink**********************/
/************************************************************/

const INITIAL_GRAPHNODE_STYLES: IGraphLinkStyles = {
  strokeColor: "green",
  strokeSize: 2,
};

interface IGraphLinkStyles {
  strokeColor: string;
  strokeSize: number;
}

/** Class representing a link between two nodes in the canvas */
class GraphLink {
  public readonly axon: Axon;
  private context: CanvasRenderingContext2D;
  public x1: number = 0;
  public y1: number = 0;
  public x2: number = 0;
  public y2: number = 0;
  styles: IGraphLinkStyles = INITIAL_GRAPHNODE_STYLES;

  /**
   * Create a graphLink.
   * @param {Axon} _axon - The axon corresponding to the node to be drawn.
   * @param {CanvasRenderingContext2D} _canvas - The cannvas context
   * @param {Partial<GraphLink>} opt - Override parameters
   */
  constructor(
    _axon: Axon,
    _context: CanvasRenderingContext2D,
    styles?: Partial<IGraphLinkStyles>
  ) {
    styles && Object.assign(this.styles, styles);
    this.axon = _axon;
    this.context = _context;
    this.setStyles();
  }

  /**
   * Draw the graphNode in the canvas (circle)
   */
  public draw = () => {
    this.context.beginPath();
    this.context.lineWidth = this.styles.strokeSize;
    this.context.moveTo(this.x1, this.y1);
    this.context.lineTo(this.x2, this.y2);
    this.context.stroke();
  };

  public setStartPoint({ x, y }: Iposition) {
    this.x1 = x;
    this.y1 = y;
  }

  public setEndPoint({ x, y }: Iposition) {
    this.x2 = x;
    this.y2 = y;
  }

  public update() {}

  private setStyles() {}
}

export { GraphLink, IGraphLinkStyles };
