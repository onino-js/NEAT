import Visualizer from "./Visualizer";

/************************************************************/
/************************class GraphControls**********************/
/************************************************************/

const INITIAL_GRAPHNODE_STYLES: IGraphControlsStyles = {};

interface IGraphControlsStyles {}

/** Class representing a link between two nodes in the canvas */
class GraphControls {
  public readonly visualizer: Visualizer;
  styles: IGraphControlsStyles = INITIAL_GRAPHNODE_STYLES;
  private _container: HTMLElement;
  private _paddingHButton: HTMLInputElement;
  private _paddingVButton: HTMLInputElement;
  private _minGapButton: HTMLInputElement;

  /**
   * Create a graphLink.
   * @param {Axon} _axon - The axon corresponding to the node to be drawn.
   * @param {CanvasRenderingContext2D} _canvas - The cannvas context
   * @param {Partial<GraphControls>} opt - Override parameters
   */
  constructor(
    id: string,
    _visualizer: Visualizer,
    styles?: Partial<IGraphControlsStyles>
  ) {
    styles && Object.assign(this.styles, styles);
    this.visualizer = _visualizer;
    this.setStyles();
    this.init(id);
  }

  private init = (id: string) => {
    this._container = document.getElementById(id);
    if (!this._container) {
      throw "Controls can't initialize. Provided id doesn't match any element in the dom";
    } else {
      this.addHtml();
      this.setDefaultValue();
      this.attachListeners();
    }
  };

  private addHtml() {
    const paddingHButton = document.createElement("input") as HTMLInputElement;
    paddingHButton.type = "range";
    paddingHButton.min = "0";
    paddingHButton.max = "100";
    this._container.appendChild(paddingHButton);
    this._paddingHButton = paddingHButton;
    const paddingVButton = document.createElement("input") as HTMLInputElement;
    paddingVButton.type = "range";
    paddingVButton.min = "0";
    paddingVButton.max = "100";
    this._container.appendChild(paddingVButton);
    this._paddingVButton = paddingVButton;
    const minGapButton = document.createElement("input") as HTMLInputElement;
    minGapButton.type = "range";
    minGapButton.min = "0";
    minGapButton.max = "100";
    this._container.appendChild(minGapButton);
    this._minGapButton = minGapButton;
  }

  private setDefaultValue() {
    this._paddingVButton.value = this.visualizer.styles.padding[0].toString();
    this._paddingHButton.value = this.visualizer.styles.padding[0].toString();
    this._minGapButton.value = this.visualizer.styles.minGap.toString();
  }

  private attachListeners() {
    this._paddingVButton.addEventListener("input", (e) => {
      const padding = this.visualizer.styles.padding;
      this.visualizer.setStyles({
        padding: [padding[0], Number(this._paddingVButton.value)],
      });
    });
    this._paddingHButton.addEventListener("input", (e) => {
      const padding = this.visualizer.styles.padding;
      padding[0] = Number(this._paddingHButton.value);
      this.visualizer.setStyles({ padding });
    });
    this._minGapButton.addEventListener("input", (e) => {
      this.visualizer.setStyles({ minGap: Number(this._minGapButton.value) });
    });
  }

  get paddingHButtonElement() {
    return this._paddingHButton;
  }

  get paddingVButtonElement() {
    return this._paddingVButton;
  }

  get minGapButtonElement() {
    return this._minGapButton;
  }

  private setStyles() {}
}

export { GraphControls, IGraphControlsStyles };
