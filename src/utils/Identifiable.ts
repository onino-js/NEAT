import { createId } from "./create-id";
class Identifiable {
  public readonly id: string;
  constructor() {
    this.id = createId();
  }
}
export { Identifiable };
