import { Axon } from "../neat/Phenotype";
import { INITIAL_GRAPHLINK_STYLES } from "./constants";
import { GraphNode } from "./GraphNode";
import { IGraphLinkParams, IGraphLinkStyles, Iposition } from "./models";

/************************************************************/
/************************class GraphLink**********************/
/************************************************************/

/** Class representing a link between two nodes in the canvas */
class GraphLink {
  public readonly axon: Axon;
  private context: CanvasRenderingContext2D;
  public input: GraphNode;
  public output: GraphNode;
  public type: "link" | "recurrent" = "link"
  styles: IGraphLinkStyles = INITIAL_GRAPHLINK_STYLES;

  /**
   * Create a graphLink.
   * @param {Axon} _axon - The axon corresponding to the node to be drawn.
   * @param {CanvasRenderingContext2D} _canvas - The cannvas context
   * @param {Partial<GraphLink>} opt - Override parameters
   */
  constructor(params: IGraphLinkParams) {
    Object.assign<GraphLink, IGraphLinkParams>(this, params);
    this.setStyles();
  }

  /**
   * Draw the graphNode in the canvas (circle)
   */
  public draw = () => {
    if (this.type==="recurrent") {
      this.drawRecurrent();
    } else this.drawLink();
  };

  private drawLink() {
    this.context.beginPath();
    this.context.strokeStyle="#000000"
    this.context.lineWidth = this.styles.strokeSize;
    this.context.moveTo(this.input.x, this.input.y);
    this.context.lineTo(this.output.x, this.output.y);
    this.context.stroke();
  }

  private drawRecurrent() {
    if (this.output === this.input) {
      this.drawSelfRecurent();
    } else this.drawDistantRecurent();
  }

  private drawDistantRecurent() {
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.strokeStyle="#FF0000"
    this.context.moveTo(this.input.x, this.input.y);
    this.context.lineTo(this.output.x, this.output.y);
    this.context.stroke();
    // Draw output link 

    // Draw inupt link
  }

  private drawSelfRecurent() {
    const size = 10;
    const offset = +this.input.styles.nodeRadius;
    const p1 = [this.input.x + offset, this.input.y - offset];
    const p2 = [p1[0], p1[1] - size];
    const p3 = [p2[0] - size, p2[1]];
    const p4 = [p3[0], p3[1] + size / 2];
    this.context.beginPath();
    this.context.lineWidth = this.styles.strokeSize;
    this.context.moveTo(p1[0], p1[1]);
    this.context.lineTo(p2[0], p2[1]);
    this.context.lineTo(p3[0], p3[1]);
    this.context.lineTo(p4[0], p4[1]);
    this.context.stroke();
  }

  public update() {}

  private setStyles() {}
}

export { GraphLink, IGraphLinkStyles };
