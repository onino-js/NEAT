import { Identifiable } from "./../utils/Identifiable";
import { Node } from "./Node";

/**
 * Class representing an axon (or connexion).
 * @extends Identifiable
 */
class Connexion extends Identifiable {
  public weight: number;
  public active: boolean = true;
  public input: Node;
  public output: Node;
  public innovation: number;

  /**
   * Create an Connexion instance from the provided axon gene.
   * @param {boolean} randomWeight - Apply random weight.
   * @param {Partial<Node>} opt - An optional parameter to set the properties.
   */
  constructor(opt?: Partial<Connexion>, randomWeight?: boolean) {
    super();
    Object.assign<Connexion, Partial<Connexion>>(this, opt);
    if (randomWeight) this.weight = Math.random();
  }

  /**
   * Update the output node value.
   */
  public feedForward() {
    if (this.active) {
      this.output.value += (this.input.value || 0) * this.weight;
    }
  }
  /**
   * Return a copy of the AxonGene
   */
  public clone() {
    return new Connexion({
      ...this,
      input: this.input.clone(),
      output: this.output.clone(),
    });
  }
}

export { Connexion };
