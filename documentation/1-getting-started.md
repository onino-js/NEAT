## 1. Getting started

### 1.1 Using a bundler

Use the following command in order to download the library:

```
npm install @onino/neat
```

or

```
yarn add @onino/neat
```

NPM will download the library and build the JavaScript files automatically inside the `./build` folder without needing extra work.
To use the library inside a Node.js environment you need the following `require()` command.

```js
const NEAT = require("@onino/neat");
```

or ()

```js
import { NEAT } from "@onino/neat";
```

You can later use the constructor as such:

```js
const phenotype = Phenotype.create([1, 3, 3, 2]);
const visualizer = new Visualizer("canvas", { phenotype });
visualizer.draw();
```

### 1.2 In the browser

Download the library :

NPM will download the library and build the JavaScript files automatically inside the `./build` folder.

You can then include the `NEATbundle_es.js` file in your HTML file as such:

```html
<script src="./build/NEATbundle_es.js"></script>
```
