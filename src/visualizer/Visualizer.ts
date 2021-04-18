import { Phenotype } from "../neat/Phenotype";
import { GraphNode } from "./GraphNode";
import { GraphLink } from "./GraphLink";
import { NeuronType } from "../neat/models";
import { IvisualizerStyles, Iposition } from "./models";
import { INITIAL_VISUALIZER_STYLES } from "./constants";
import { NeatUtils } from "./../neat/NeatUtils";

export class Visualizer {
  public canvasRef: HTMLCanvasElement;
  public canvasContext: CanvasRenderingContext2D;
  public graphNodes: GraphNode[] = [];
  public graphLinks: GraphLink[] = [];
  public styles: IvisualizerStyles;
  public phenotype: Phenotype;
  private _grid: Iposition[];

  constructor(
    canvasId: string,
    phenotype: Phenotype,
    styles?: Partial<IvisualizerStyles>
  ) {
    Object.assign(
      this,
      { styles: INITIAL_VISUALIZER_STYLES, phenotype },
      styles
    );
    this.init(canvasId);
    this.draw();
  }

  private init = (canvasId: string) => {
    const el = document.getElementById(canvasId);
    if (!(el instanceof HTMLCanvasElement)) {
      throw "Visualizer can't initialize. Provided id doesn't match any canvas element in the dom";
    } else {
      this.canvasRef = el;
      this.canvasContext = el.getContext("2d");
      el.width = this.styles.width;
      el.height = this.styles.height;
      el.style.backgroundColor = this.styles.backgroundColor;
    }
    if (this.phenotype) {
      this.draw();
    }
  };

  public refresh() {
    this.clear();
    // Render links first to be behind nodes
    this.graphLinks.forEach((gl) => gl.draw());
    this.graphNodes.forEach((gn) => gn.draw());
  }

  public draw() {
    if (!this.phenotype) return;
    else {
      this.reset();
      this.computeGrid();
      this.addGraphNodes();
      this.addGraphLinks();
      this.refresh();
    }
  }

  private computeGrid() {
    let grid: Iposition[] = [];
    this.phenotype.shape.forEach((layer, layerIndex) => {
      for (let rowIndex = 0; rowIndex < layer; rowIndex++) {
        grid.push({
          x: this.computeXPos(layerIndex),
          y: this.computeYPos(layerIndex, rowIndex),
        });
      }
    });
    this._grid = grid;
  }

  private computeXPos(layerIndex: number): number {
    const w = this.styles.width - 2 * this.styles.padding[1];
    const n = this.phenotype.shape.length;
    return this.styles.padding[1] + (layerIndex * w) / (n - 1);
  }

  private computeYPos(layerIndex: number, rowIndex: number): number {
    const h = this.styles.height - 2 * this.styles.padding[0];
    const layers = this.phenotype.shape;
    const n = layers[layerIndex] - 1;
    const rowGap = Math.min(this.styles.minGap, h / n);
    const additionalPadding = (h - rowGap * n) / 2;
    return this.styles.padding[0] + rowGap * rowIndex + additionalPadding;
  }

  public addGraphNodes = () => {
    this.phenotype.neurons.forEach((neuron, nodeIndex) => {
      const { x, y } = this._grid[nodeIndex];
      const graphNode = new GraphNode({
        neuron,
        context: this.canvasContext,
        nodeIndex,
        x,
        y,
      });
      this.graphNodes.push(graphNode);
    });
  };

  public addGraphLinks() {
    this.phenotype.axons.forEach((axon, axonIndex) => {
      // retreive graphnodes
      const input = this.graphNodes.find((gn) => gn.neuron === axon.input);
      const output = this.graphNodes.find((gn) => gn.neuron === axon.output);
      const isRecurrent = NeatUtils.isLinkRecurent(axon, this.phenotype.axons);
      const graphLink = new GraphLink({
        axon,
        context: this.canvasContext,
        input,
        output,
        type: isRecurrent ? "recurrent" : "link",
      });
      this.graphLinks.push(graphLink);
    });
  }

  public getContext() {
    return this.canvasContext;
  }

  public clear() {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasRef.width,
      this.canvasRef.height
    );
  }

  public reset() {
    this.clear();
    this.graphLinks = [];
    this.graphNodes = [];
  }

  public getInputNodes() {
    return this.graphNodes.filter((n) => n.neuron.type === NeuronType.INPUT);
  }
  public getHiddenNodes() {
    return this.graphNodes.filter((n) => n.neuron.type === NeuronType.HIDDEN);
  }
  public getOutputNodes() {
    return this.graphNodes.filter((n) => n.neuron.type === NeuronType.OUTPUT);
  }

  public setStyles(styles: Partial<IvisualizerStyles>) {
    Object.assign(this.styles, styles);
    this.draw();
  }

  public getNeuronByGraphIndex(index: number) {
    return this.graphNodes.find((gn) => gn.nodeIndex === index).neuron;
  }
}

export default Visualizer;
