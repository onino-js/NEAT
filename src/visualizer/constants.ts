import {
  IGraphLinkStyles,
  IGraphNodeStyles,
  IvisualizerStyles,
} from "./models";

export const INITIAL_GRAPHNODE_STYLES: IGraphNodeStyles = {
  inputFillColor: "green",
  hiddenFillColor: "#FFFFFF",
  outputFillColor: "red",
  nodeFillColor: "#FFFFFF",
  nodeActiveFillColor: "#FFFFFF",
  nodeRadius: 20,
};

export const INITIAL_GRAPHLINK_STYLES: IGraphLinkStyles = {
  strokeColor: "#000000",
  strokeSize: 1,
};

export const INITIAL_VISUALIZER_STYLES: IvisualizerStyles = {
  backgroundColor: "#EEEEEE",
  width: 640,
  height: 480,
  padding: [60, 60],
  minGap: 100,
  nodeStyles: INITIAL_GRAPHNODE_STYLES,
  linkStyles: INITIAL_GRAPHLINK_STYLES,
};
