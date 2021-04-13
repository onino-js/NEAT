import { Phenotype } from "../Phenotype";
import { GraphNode, IGraphNodeStyles } from "./GraphNode";
import { GraphLink } from "./GraphLink";
import { NeuronType } from "../models";

const INITIAL_VISUALIZER_STYLES = {
  width: 640,
  height: 480,
  nodeRadius: 20,
  backgrounColor: "#AAA",
  NodeFillColor: "#FFF",
  NodeActiveFillColor: "#000",
  padding: [20, 20],
  minGap: 100,
};

interface IvisualizerStyles extends IGraphNodeStyles {
  backgrounColor: string;
  width: number;
  height: number;
  nodeRadius: number;
  NodeFillColor: string;
  NodeActiveFillColor: string;
  padding: [number, number];
  minGap: number;
}

export interface Iposition {
  x: number;
  y: number;
}

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
      el.style.backgroundColor = this.styles.backgrounColor;
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
    this.phenotype.neurons.forEach((n, neuronIndex) => {
      const pos = this._grid[neuronIndex];
      const graphNode = new GraphNode(n, this.canvasContext, {
        nodeRadius: this.styles.nodeRadius,
      });
      graphNode.setPosition(pos);
      this.graphNodes.push(graphNode);
    });
  };

  public addGraphLinks() {
    this.phenotype.axons.forEach((axon, axonIndex) => {
      const graphLink = new GraphLink(axon, this.canvasContext);
      // retreive graphnodes
      const { x: x1, y: y1 } = this.graphNodes.find(
        (gn) => gn.neuron.id === axon.input.id
      );
      const { x: x2, y: y2 } = this.graphNodes.find(
        (gn) => gn.neuron.id === axon.output.id
      );
      graphLink.setStartPoint({ x: x1, y: y1 });
      graphLink.setEndPoint({ x: x2, y: y2 });
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
}

export default Visualizer;
