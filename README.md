# NEAT.js

NeuroEvolution of Augmenting Topologies (NEAT) is a genetic algorithm (GA) for the generation of evolving artificial neural networks.
This library implements an implementation of the neat algorithm writted in Typescript and provided with a vislualiser to see the network evolving.

More informations about NEAT are available in ![the original paper](https://www.cs.utexas.edu/users/ai-lab/pubs/stanley.gecco02_1.pdf).

![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)

### Contents

- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

### Getting Started

#### Option 1 (Using a bundler)

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

#### Option 2 (Browser)

Download the library :

NPM will download the library and build the JavaScript files automatically inside the `./build` folder.

You can then include the `NEATbundle_es.js` file in your HTML file as such:

```html
<script src="./build/NEATbundle_es.js"></script>
```

### Run exemples

You can run examples in the browser directly using the command line interface.

```
npm run start:visualizer
```

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

[MIT](https://choosealicense.com/licenses/mit/)
