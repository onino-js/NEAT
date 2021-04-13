# NEAT implementation

This document synthetizes the rules for designing a NEAT and describes them as a succetion of high level computing steps. All quotes in this document come from [Evolving Neural Networks through Augmenting Topologies](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf). Any suggestion to improve the readability through standardized pseudocode is very welcome (see the [contributing section](https://github.com/onino-js/NEAT/blob/main/documentation/3-contributing.md) ).

## Introduction

A NEAT algorithm is a variation a Genetic algorithm which optimize neural networks. Before going further, you may want to know [the specific terms of Genetic aglgorithms and NEAT](https://github.com/onino-js/NEAT/blob/main/documentation/neat-glossary.md) and the [the basic implementation of a genetic algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/genetic-algorithm.md). Moreover, to understand the motivations behind the NEAT algorithm and the choices made for its implementation, you may want to read the [NEAT presentation](https://github.com/onino-js/NEAT/blob/main/documentation/genetic-algorithm.md).

The NEAT algorithm we describe here will be composed of objects, collections of objects, and functions tha manipulates those objects and collections.The aim of the exercise is to define the properties of each object and all the functions with an easy readable style. In the rest of the document, we will use the following terms to designate the objects of different types:

- Neat : an object that run the simulation.
- Genome: an object that represent a genome.
- Phenotype: a network object (produce outputs with given inputs).
- Connexion: an object representing a connexion within a Phenotype.
- Node: an object representing a node within a Phenotype.
- ConnexionGene: an object representing the gene of a Connexion.
- NodeGene: an object representing the encoded gene of a Node.
- Gene : a NodeGene or a ConnexionGene.
- Configuration: An object containing the data needed to run a simulation
- Functions: An object representing all functions needed in the NEAT algorithm

Here we make a distinction between Genome objects and Phenotype objects (or Individual, or Network). A Genome is the encoded representation of a Phenotype, this encoded version can be manipulated by a NEAT algorithm to produce new populations. A Phenotype is an indivial of the population. In the context of a NEAT, an individual is a neural network designed to solve a specific problem. A Genome can be mutated or crossed with other genomes but not a phenotype. A phenotype can produce results with given inputs but not a genome. Thus, even if they are closely related and often merged into a single entity, we prefer to use different objects to represent a Genome (or Genotype) and a Phenotype (or Network). The same goes for a Node (or Neuron) and its corresponding Node gene (or neuron gene) and a Connexion (or Axon) and its corresponding Connexion gene (or Axon gene).

The exact architecture of the programm is not discussed here. In the source code proposed in this repository, most of the functions to perform manipulations over genes and phonotypes are moved into a class called NeatUtils. The classes reprensenting objects only keep the minimum amount of informations. The aim is to provide users the flexibility to replace any component of the program and easily build variations of the algorithm. [More informations about customization here](https://github.com/onino-js/NEAT/blob/main/documentation/3-customization.md).

Let's start the journey. The first step to develop a genetic algorithm is to define the encoding method for the Genome, and thus the properties of the Genome object.

## Encoding the genome

The encoding has been choosen to solve the problems described in the [NEAT presentation](https://github.com/onino-js/NEAT/blob/main/documentation/net-presentation.md). It basically include a list of genes of two types: node genes and connexion genes. An example is given Figure 1. Here are the authors prescriptions:

> Genomes are linear representations of network connectivity (Figure 1). Each genome includes a list of connection
> genes, each of which refers to two node genes being connected.
> Node genes provide a list of inputs, hidden nodes, and outputs that can be connected. Each connection gene
> specifies the in-node, the out-node, the weight of the connection, whether or not the
> connection gene is expressed (an enable bit), and an innovation number, which allows
> finding corresponding genes.

![Encoding the genome in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/genotype-encoding.png?raw=true, "Encoding the genome in neat algorithm")

_Figure 1: A genotype to phenotype mapping example. A genotype is depicted that
produces the shown phenotype. There are 3 input nodes, one hidden, and one output
node, and seven connection definitions, one of which is recurrent. The second gene is
disabled, so the connection that it specifies (between nodes 2 and 4) is not expressed in
the phenotype._

This leads to the following definitions :

```
Object: Genome
properties:
    - One collection of NodeGenes.
    - One collection of ConnexionGenes.
    - The corresponding Phenoype

Object: ConnexionGene
properties:
    - An input NodeGene.
    - An output NodeGene.
    - A Number representing the weight of the connexion.
    - A boolean representing wether or not the connexion is activated.
    - A Number representing the innovation number.
    - The corresponding Connexion

Object: NodeGene
properties:
    - The type of node (input, output or hidden).
    - A Number representing the innovation number.
    - The corresponding Node
```

The correponding members (Phenotype, Node and Connexion) of those genetic objects can also be defined. Here make a circular one to one dependency with the pairs Genome/Phenotype, Node/NodeGene and Connexion/ConnexionGene.

```
Object: Phenotype
properties:
    - The corresponding Genome
    - The current fitness
    - An input object containing input values
    - An output object containing output values

Object: Node
properties:
    - The corresponding NodeGene
    - The current output value

Object: Connexion
properties:
    - The corresponding ConnexionGene
    - An input Node
    - An output Node
```

Also we need to define a function that tells us wether or not two Nodes can be connected:

```
Function: Can Nodes connect to each other ?
Parameters: Node 1, Node 2
returns: yes or not
```

The innovation number will be used to perform crossovers between individuals of the same species.

## Tracking topological changes

Tracking topological changes will provide us a simple way to perform speciations and thus:

- Make relevant crossovers with individuals of the same species.
- Protect structural innovations.

> Whenever a new gene appears (through structural mutation), a global innovation number is incremented
> and assigned to that gene. The innovation numbers thus represent a chronology of the
> appearance of every gene in the system.

The innovation is a positive integer and appears in the Gene objects (ConnexionGene and NodeGene). The implementation is straitforward but we should
check first if the innovation already exists before incrementing the global innovation number.

> A possible problem is that the same structural innovation will receive different in-
> novation numbers in the same generation if it occurs by chance more than once. How-
> ever, by keeping a list of the innovations that occurred in the current generation, it
> is possible to ensure that when the same structure arises more than once through in-
> dependent mutations in the same generation, each identical mutation is assigned the
> same innovation number. Thus, there is no resultant explosion of innovation numbers.

In the Neat process, those instructions take place during the creation of new population of Genomes through mutations. Eventually. The mutation process should by succeded by a the tracking process.

```
Function: Track a structural innovation after a mutation
Parameters: A list of new Genes created by a mutation and the collection of all existing Genes.
Returns: The list of Genes with an updtade innovation number property and optionaly the global innovation number.
Steps:

    (For all Genes given as first parameter)
    1. Get the max innovation number from all genes of all Genomes of the population.

    3. Check if the mutation has alread been created (ie. gene with same properties exists).

    4.
    IF mutation exists, assign the same innovation number to the new genes
    ELSE increment the max innovation number and assign it the the new genes

```

This innovation number is also a central piece to perform speciation over the population as will see in next section.

## Speciation

A species is a collection of Genomes that are compatible. Two Genomes can produce a child through crossover only if they are compatible.
Two Genomes compete over each other in the evolution process only if they are compatible. In other terms, if they are of the same species.
So what exactly being compatible means ?

> The idea is to divide the population into species such
> The number of excess and disjoint genes between a pair of genomes is a natural
> measure of their compatibility distance. The more disjoint two genomes are, the less
> evolutionary history they share, and thus the less compatible they are. Therefore, we
> can measure the compatibility distance δ of different structures in NEAT as a simple lin-
> ear combination of the number of excess E and disjoint D genes, as well as the average
> weight differences of matching genes W , including disabled genes:

![Distance in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/distance-equation.png?raw=true, "Distance in neat algorithm")

_Equation 1: The coefficients c 1 , c 2 , and c 3 allow us to adjust the importance of the three factors, and
the factor N , the number of genes in the larger genome, normalizes for genome size (N
can be set to 1 if both genomes are small, i.e., consist of fewer than 20 genes).
The distance measure δ allows us to speciate using a compatibility threshold δ t._

Here the authors provide a functional definition of compatibility between two Genomes with an easy implementation. The innovation number assigned to each Gene will allow us to get the number of excess and dijoint genes of Equation 1. Now we can difine the process of sorting individuals by species:

> An ordered list of species is maintained. In each generation, genomes are sequentially
> placed into species. Each existing species is represented by a random genome inside
> the species from the previous generation. A given genome g in the current generation is
> placed in the first species in which g is compatible with the representative genome of
> that species. This way, species do not overlap. 1 If g is not compatible with any existing
> species, a new species is created with g as its representative.

Now we have the tools to perform a speciation of the population before going through the steps of mutations and crossovers. Note that the Neat object should be initialized with one species containing all the population so that a first mutation step can be performed.

```
Function: Speciate a new Genome within the population
Parameters: A collection of Species and the Genome to speciate
Returns: The collection of Species with eventually a new member
Steps:

    1. For Each species of the population, pick a random representant and build a representant array

    2. Compute the distance between the Genome and the first representant using equation 1

    3. If the distance is below a threshold (defined in configuration), put the Genome into the same Species than the representant.

    4. If not, repeat Step 2 with next representant of the representant array.

    5. At the end, if no existing species has been assigned to the Genome, create a new Species for that Genome.
```

## Fitness evaluation

The fitness evaluation is closely related to the problem we try to solve using a neural network. This evaluation is performed during any GA process for each generation with a user provided function that takes a phenotype as parameter and returns a number. The higher the returned number is, the more the phenotype perform well in solving the problem. In the context of a NEAT, we have to calculate an adjusted fitness in order to protect species again each other.

> As the reproduction mechanism for NEAT, we use explicit fitness sharing (Goldberg
> and Richardson, 1987), where organisms in the same species must share the fitness
> of their niche. Thus, a species cannot afford to become too big even if many of its
> organisms perform well. Therefore, any one species is unlikely to take over the entire
> population, which is crucial for speciated evolution to work. The adjusted fitness f i 0 for
> organism i is calculated according to its distance δ from every other organism j in the
> population:

![Distance in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/adjusted-fitness-equation.png?raw=true, "Distance in neat algorithm")

_Equation 2: The sharing function sh is set to 0 when distance δ(i,P n j) is above the threshold δt ;
otherwise, sh(δ(i, j)) is set to 1 (Spears, 1995). Thus, j=1 sh(δ(i, j)) reduces to the
number of organisms in the same species as organism i. This reduction is natural since
species are already clustered by compatibility using the threshold δ t._

Notice here that the sh function has to be calculated for each Genome with other genomes of the entire population. In other words, the existing species are not explicitly taken into account during the fitness evaluation. This is because species have been built up using random representants. Also the adjusted fitness cannot be computed independently for each Genome. The whole population at a given iteration step is taken as parameter for the evaluation of Equation 2.

```
Function: Evaluating adjusted fitness of a Genome.
Parameters: A collection of Genomes and the Genome to evaluate.
Returns: The adjusted fitness
Steps: (Equation 2)
```

The adjusted fitnesses will be used to make a selection over the population. We also have introduced a new configuration parameter which is the distance threshold to calculate sh function in Equation 2:

```
Object: EvaConfiguration.
properties:

- The distance threshold used to evaluate the adjusted fitness
```

## Population selection

Selecting a population consist in removing the worse performers. The amount of individuals to be removed is defined in the Configuration as a total percentage of surviving individuals at each step.

> Every species is assigned a potentially different number of offspring in proportion to the sum of ad-
> justed fitnesses fi 0 of its member organisms. Species then reproduce by first eliminating
> the lowest performing members from the population. The entire population is then
> replaced by the offspring of the remaining organisms in each species.

```
Function: Make a selection in the population
Parameters: A collection of Phenotypes
Returns : A truncated collection of Phenotypes
Steps:

    1. Get the population as a collection of Species

    2. Compute the number of total survivors Nt

    (For each Species)
    3. compute the average adjusted fitness

    4. compute the number (N) of offsprings for the next generation

    5. Remove the excess of Phenotypes using the fitness as discriminant
```

At the end of the process, the initial population is reduced by X% (X being a userdefined constant) and each species in the population has an exact number of new individuals to be created during the crossover process.

```
Object: Configuration
Properties:

    - The percentage of individuals to die at each generation.

```

## Mutation

A spcificity of the Neat algorithm, is that structural mutations will make the genomes gradually
get larger. The process is however the same as in a traditional GA. We just have to take different kinds of mutations with different mutation rates.

> Mutation in NEAT can change both connection weights and network structures.
> Connection weights mutate as in any NE system, with each connection either per-
> turbed or not at each generation. Structural mutations occur in two ways (Figure 2).
> Each mutation expands the size of the genome by adding gene(s). In the add connection
> mutation, a single new connection gene with a random weight is added connecting
> two previously unconnected nodes. In the add node mutation, an existing connection is
> split and the new node placed where the old connection used to be. The old connection
> is disabled and two new connections are added to the genome. The new connection
> leading into the new node receives a weight of 1, and the new connection leading out
> receives the same weight as the old connection.

```
Object: Configuration
Properties:

    - Mutation rate for adding a NodeGene - Mutation rate for adding a ConnexionGene - Mutation rate for changing weigth
```

```
Function: Make mutations over a population
Parameters: A Collection of Species
Returns : The same Collection with eventually different configuration and new members
Steps :

    (For each Species in the population)
    (For each kind member in the Species)
    (For each kind of mutation)
    1. Eventually perform a mutation according to mutation rate
```

The different kind of mutation are describe in the following.

### Connexion mutation

> New genes are assigned new increasingly higher numbers. In adding a connection, a single new connection gene is added to the end of the
> genome and given the next available innovation number.

![Connexion mutaion in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/structural-mutation-1.png?raw=true, "Connexion mutaion in neat algorithm")

```
Function: Add ConnexionGene mutation
Parameters: A Genome
Returns : The same Genome with a new ConnexionGene
Steps :

    1. Get all NodeGenes of the Genome

    2. Build a new ConnexionGene Ncg with two randomly chosed NodeGene

    3. Check if the ConnexionGene is recurrent

    4. If not, add the new ConnexionGene to the Genome

    5. Perform histirical tracking.
```

### Node mutation

> In the add node mutation, an existing connection is split and the new node placed where the old connection used to be. The old connection
> is disabled and two new connections are added to the genome. The new connection
> leading into the new node receives a weight of 1, and the new connection leading out
> receives the same weight as the old connection. This method of adding nodes was chosen in order to minimize the initial effect of the mutation.

![Node mutaion in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/structural-mutation-2.png?raw=true, "Node mutaion in neat algorithm")

```

Function: Add NodeGene mutation
Parameters: A Genome
Returns : The same Genome with a new NodeGene and two new ConnexionGenes
Steps :

    1. Pick randomly one ConnexionGene CG of the Genome having a weight W.

    2. Get the input (I) and outout (O) corresponding NodeGenes.

    3. Create a new NodeGene Nn.

    4. Create a new ConnexionGene with wieght 1, input I and output Nn.

    4. Create a new ConnexionGene with wieght W, input Nn and output O.

    5. For each newlt create Gene, perform the historical tracking.

```

## Crossover

Crossover is the operation of creating a new child Genome from two parents Genomes. As part of Neat specification, crossovers are performed within each Species only. The number of children to be produced by crossovers for a Species will depends on the number of members in that Species for the actual generation (truncated atfer the selection process) and the number of members in the next generation (calculated during the selection process). An detailed example of crossover is given Figure 3.

![Crossover in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/crossover.png?raw=true, "Crossover in neat algorithm")

_Figure 3: Matching up genomes for different network topologies using innovation
numbers. Although Parent 1 and Parent 2 look different, their innovation numbers
(shown at the top of each gene) tell us which genes match up with which. Even with-
out any topological analysis, a new structure that combines the overlapping parts of the
two parents as well as their different parts can be created. Matching genes are inherited
randomly, whereas disjoint genes (those that do not match in the middle) and excess
genes (those that do not match in the end) are inherited from the more fit parent. In
this case, equal fitnesses are assumed, so the disjoint and excess genes are also inherited
randomly. The disabled genes may become enabled again in future generations: there’s
a preset chance that an inherited gene is disabled if it is disabled in either parent._

> If the maximum fitness of a species did not improve in 15
> generations, the networks in that species were not allowed
> to reproduce. Otherwise, the top 40% (i.e. the elite) of
> each species reproduced by random mate selection within
> the elite. In addition, the champion of each species with
> more than five networks was copied into the next generation unchanged and each elite individual had a 0.1% chance
> to mate with an elite individual from another species

```

Function: Crossovers within a Species
Parameters: A Species and the number of new members to add.
Returns : The same Species with additionnal members
Steps :

    (As long as the population of the Species didn't reach it's maximal value)

    1. Get the N% of best performing numbers.

    1. Pick randomly two different Genomes (Gp1 and Gp2) from the result.

    2. Create a new Genome (Gn) and put it in the Species.

```

```

Function: Crossover two Genes
Parameters: Two Genomes within the same Species
Returns : A new Genome
Steps : 1. Create a new Genome (Gn) with no Gene.

    (For each innovation number)
    2. If the corresponding Gene is present in both Gp1 and Gp2, then pick the Gene randomly from Gp1 and Gp2 and push in into Gn Genes.

    3. If not, pick the corresponding Gene from the best performing parent (or randomly) and add in into Gn.

    4. Add the new created Gene in the Species.

```

This brings two new configuration parameters:

```
Object: Configuration
Properties:

    - The percentage of best performing members allowed to reproduce with crossovers.

    - A fitness threshold to evaluate wether or not two Genomes equally perform or not.
```

## Putting all together

### The configuration object

Object: Configuration
Properties:

- The percentage of individuals to die at each generation.

- The percentage of best performing members allowed to reproduce with crossovers.

- A fitness threshold to evaluate wether or not two Genomes equally perform or not.

```

#### The Gene

### Testing the implementation

```

```

```
