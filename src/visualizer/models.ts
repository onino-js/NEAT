import { Connexion } from "src/neat/Connexion";
import { Node } from "src/neat/Node";
import { GraphNode } from "./GraphNode";

export interface IvisualizerStyles {
  backgroundColor: string;
  width: number;
  height: number;
  padding: [number, number];
  minGap: number;
  nodeStyles: IGraphNodeStyles;
  linkStyles: IGraphLinkStyles;
}

export interface Iposition {
  x: number;
  y: number;
}

export interface IGraphNodeStyles {
  nodeRadius: number;
  inputFillColor: string;
  hiddenFillColor: string;
  outputFillColor: string;
  nodeFillColor: string;
  nodeActiveFillColor: string;
}

export interface IGraphNodeParams {
  node: Node;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  styles?: Partial<IGraphNodeStyles>;
  nodeIndex?: number;
}

export interface IGraphLinkStyles {
  strokeColor: string;
  strokeSize: number;
}

export interface IGraphLinkParams {
  connexion: Connexion;
  context: CanvasRenderingContext2D;
  input: GraphNode;
  output: GraphNode;
  styles?: IGraphLinkStyles;
  type?: "recurrent" | "link";
}
