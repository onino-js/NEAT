import { createId } from "./create-id";
class Identifiable {
  public id: string;
  constructor() {
    this.id = createId();
  }
}
export { Identifiable };
