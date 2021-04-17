import { NeuronType } from "../neat/models";
import { Neuron } from "../neat/Phenotype";
import { INITIAL_GRAPHNODE_STYLES } from "./constants";
import {  IGraphNodeStyles, IGraphNodeParams } from "./models";


/************************************************************/
/************************class GrapNode**********************/
/************************************************************/

/** Class representing a node displayed in the canvas. */
class GraphNode {
  public readonly neuron: Neuron;
  public x: number;
  public y: number;
  public styles: IGraphNodeStyles = INITIAL_GRAPHNODE_STYLES;
  public nodeIndex: number;
  private context: CanvasRenderingContext2D;
  public fill: string;

  /**
   * Create a graphNode.
   * @param {Neuron} _neuron - The neuron corresponding to the node to be drawn.
   * @param {CanvasRenderingContext2D} _canvas - The cannvas context
   * @param {Partial<GraphNode>} opt - Override parameters
   */
  constructor(params: IGraphNodeParams) {
    Object.assign<GraphNode, IGraphNodeParams>(this, params);
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
    this.drawIndex();
  };

  private drawIndex() {
    if (this.nodeIndex !== undefined) {
      this.context.font = '15px sans-serif';
      this.context.textAlign = "center";
      this.context.strokeStyle = "#000000";
      this.context.strokeText(this.nodeIndex.toString(), this.x, this.y + 5);
    }
  }

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
