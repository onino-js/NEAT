import { NeuronType } from "../models";
import { Neuron } from "../Phenotype";

/************************************************************/
/************************class GrapNode**********************/
/************************************************************/

interface IGraphNodeStyles {
  nodeRadius: number;
  inputFillColor: string;
  hiddenFillColor: string;
  outputFillColor: string;
  nodeFillColor: string;
  nodeActiveFillColor: string;
}

const INITIAL_GRAPHNODE_STYLES: IGraphNodeStyles = {
  inputFillColor: "green",
  hiddenFillColor: "#FFFFFF",
  outputFillColor: "red",
  nodeFillColor: "#FFFFFF",
  nodeActiveFillColor: "#FFFFFF",
  nodeRadius: 20,
};

/** Class representing a node displayed in the canvas. */
class GraphNode {
  public readonly neuron: Neuron;
  public fill: string = "#FFFFFF";
  public x: number;
  public y: number;
  public styles: IGraphNodeStyles = INITIAL_GRAPHNODE_STYLES;
  private context: CanvasRenderingContext2D;

  /**
   * Create a graphNode.
   * @param {Neuron} _neuron - The neuron corresponding to the node to be drawn.
   * @param {CanvasRenderingContext2D} _canvas - The cannvas context
   * @param {Partial<GraphNode>} opt - Override parameters
   */
  constructor(
    _neuron: Neuron,
    _context: CanvasRenderingContext2D,
    styles?: Partial<IGraphNodeStyles>
  ) {
    styles && Object.assign(this.styles, styles);
    this.neuron = _neuron;
    this.context = _context;
    this.setColors();
  }

  /**
   * Draw the graphNode in the canvas (circle)
   */
  public draw = () => {
    this.context.beginPath();
    this.context.fillStyle = this.fill;
    this.context.arc(
      this.x,
      this.y,
      this.styles.nodeRadius,
      0,
      Math.PI * 2,
      true
    );
    this.context.fill();
  };

  /**
   * Set position of the graphNode in the canvas
   * @param {Ipos} pos - Object position
   * @param {x} pos.x - Horizontal position from left to right
   * @param {y} pos.y - Vertical position from top to bottom
   */
  public setPosition({ x, y }: { x?: number; y?: number }) {
    x && (this.x = x);
    y && (this.y = y);
  }

  private setColors() {
    switch (this.neuron.type) {
      case NeuronType.INPUT:
        this.fill = this.styles.inputFillColor;
        break;
      case NeuronType.HIDDEN:
        this.fill = this.styles.hiddenFillColor;
        break;
      case NeuronType.OUTPUT:
        this.fill = this.styles.outputFillColor;
        break;
    }
  }
}

export { GraphNode, IGraphNodeStyles };
