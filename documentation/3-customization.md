# Customization

```js
export class MyNeat extends Neat {
  public run() {
    NeatUtils.initializePopulation(this);
    while (!this.finished) {
      NeatUtils.computeFitness(this);
      NeatUtils.speciatePopulation(this);
      NeatUtils.selectPopulation(this);
      NeatUtils.mutatePopulation(this);
      NeatUtils.crossoverPopulation(this);
      NeatUtils.evaluateCriteria(this);
      this.epoch++;
    }
  }
}
```
