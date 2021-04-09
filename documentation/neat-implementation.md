# NEAT implementation

The aim of this document is to synthetize the rules for designing a NEAT and to describe them with an algorithmic point of view (ie. as a succetion of high level computing steps). The description is language agnostic so that a developper would easily reproduce a NEAT in any programming language. All quotes in this document comes from [Evolving Neural Networks through Augmenting Topologies](https://www.cs.utexas.edu/users/ai-lab/pubs/stanley.gecco02_1.pdf).

### Introduction

For a detailed explanation of NEAT terms, please read the [NEAT glossary](https://github.com/onino-js/NEAT/blob/main/documentation/net-glossary.md).

A NEAT algorithm is a variation of more common Genetic algorithm which optimize neural networks. To understand the NEAT implementation one should make shure of understanding [the basic implementation of a genetic algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/genetic-algorithm.md) first.

Moreover, to understand the motivations behind the NEAT algorithm and the choices made for its implementation, I suggest you to read the [NEAT presentation](https://github.com/onino-js/NEAT/blob/main/documentation/genetic-algorithm.md) before going forward.

The algorithm will be composed of objects and arrays of objects, and functions that manipulate those objects. The aim is to define all the type of objects,

In the rest of the document, we will use the following terms to designate the type of objects:

- Neat : the object that run the simulation
- Genome: the object that represent the genome
- Phenotype: a network object (produce outputs with given inputs)
- Connexion: an object representing a connexion within a phenotype
- ConnexionGene: an object representing the gene of a Connexion
- Node: an object representing a node within a Phenotype
- NodeGene: an object representing a Node gene
- Gene : a NodeGene or a ConnexionGene
- Configuration: An object representing the data needed to run a simulation
- Function: An object representing all functions needed in the NEAT algorithm

It is important to make a distinction between Genome objects and Phenotype (or Individual, or Network). A NEAT algorithm manipulates Genomes and genes to produce new populations. The correspondings phenotypes are tested during the process to evalate their capabilities to solve the given problem. That disctinction being made:

- A Genome can be mutated or crossed with other genomes but not a phenotype
- A phenotype can produce results with given inputs but not a genome

Thus, even if they are closely related and often merged into a single entity, one should use different objects to describe a Genome (or Genotype) and a Phenotype (or Network).
The same goes for a Node (or Neuron) and its corresponding Node gene (or neuron gene) and a Connexion (or Axon) and its corresponding Connexion gene (or Axon gene).

The exact architecture of the programm is not discussed here. In the source code proposed in this repo, I choosed to move most of the methods into a static class called NeatUtils. This class contains all functions to perform manipulations over genes and phonotypes. The remainings classes only keep the minimum amount of informations. The aim is to provide users the flexibility to replace any component and easily build variations of the algorithm.

Also notice that I choosed the following names in the source code that differs from this documentation:

- Neuron instead of Node
- Axon instead of Connexion
- Genotype instead of Genome

### Encoding the genome

The Encoding has been choosen to solve the problems described in the [NEAT presentation](https://github.com/onino-js/NEAT/blob/main/documentation/net-presentation.md). Here are the authors prescriptions:

> Genomes are linear representations of network connectivity (Figure 2). Each genome includes a list of connection
> genes, each of which refers to two node genes being connected.

An object of type Genome has at least two properties:

- One array of type "node gene"
- One array of type "connexion gene"

Use of indexed array insure the linear representation.

> Node genes provide a list of inputs, hidden nodes, and outputs that can be connected. Each connection gene
> specifies the in-node, the out-node, the weight of the connection, whether or not the
> connection gene is expressed (an enable bit), and an innovation number, which allows
> finding corresponding genes.

An object of type ConnexionGene has at least four properties:

- One identificator of a node gene for its input (can be an id or the node gene object itself)
- One identificator of a node gene for its input (can be an id or the node gene object itself)
- A Number representing the weight of the connexion
- A boolean representing wether or not the connexion is activated
- A Number representing the innovation number which will be used to perform crossovers between individuals of the same species.

![Encoding the genome in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/genotype-encoding.png?raw=true, "Encoding the genome in neat algorithm")

_Figure 2: A genotype to phenotype mapping example. A genotype is depicted that
produces the shown phenotype. There are 3 input nodes, one hidden, and one output
node, and seven connection definitions, one of which is recurrent. The second gene is
disabled, so the connection that it specifies (between nodes 2 and 4) is not expressed in
the phenotype._

An object of type "node gene" ....

### Tracking topological changes

Tracking topological changes will provide us a simple way to perform speciations and thus:

- Make relevant crossovers with individuals of the same species.
- Protect structural innovations that perform worse than top one.

> Whenever a new gene appears (through structural mutation), a global innovation number is incremented
> and assigned to that gene. The innovation numbers thus represent a chronology of the
> appearance of every gene in the system.

The innovation appears in the Gene objects (ConnexionGene and NodeGene), it is a positive integer.

> A possible problem is that the same structural innovation will receive different in-
> novation numbers in the same generation if it occurs by chance more than once. How-
> ever, by keeping a list of the innovations that occurred in the current generation, it
> is possible to ensure that when the same structure arises more than once through in-
> dependent mutations in the same generation, each identical mutation is assigned the
> same innovation number. Thus, there is no resultant explosion of innovation numbers.

In the Neat process, those instructions take place during the creation of new population of Genomes. Eventually, some structural mutations will occur leading to new Genomes. The mutation process should be triggerd in the scope of a tracking process describe below:

```
Method: Track a structural mutation of a Genome

1. Get the max innovation number from all genes of all Genomes of the population.
2. Create new Gene from the mutation (described here XXX).
3. Check if the mutation has alread been created.
4. If mutation is new, increment the max innovation number.
5. Create the new Gene.
6. Assign this max innovation number to the new Gene innovation property.
7. Store the new Gene into an array to perform step 3 with next genes.
8. Reproduce process for each gene of the genome.
```

This innovation number is also a central piece to perform speciation over the population as will see in next section.

### Speciation

A species is a collection of Genomes that are compatible. Two Genomes can produce a child through crossover only if they are compatible.
Two Genomes compete over each other in the evolution process only if they are compatible.
In other terms, if they are of the same species.
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

Here the authors provide a functional definition of compatibility between two Genomes with an easy implementation.

> An ordered list of species is maintained. In each generation, genomes are sequentially
> placed into species. Each existing species is represented by a random genome inside
> the species from the previous generation. A given genome g in the current generation is
> placed in the first species in which g is compatible with the representative genome of
> that species. This way, species do not overlap. 1 If g is not compatible with any existing
> species, a new species is created with g as its representative.

As a specificity of the NEAT algorithm, we should perforom a speciation of the population before going through the steps of mutations and crossovers. Note that the Neat object should be initialized with one species containing all the population so that a first mutation step can be performed. For a given Genome to be speciated, the steps are:

```
Method: Speciate a new Genome within the population

1. For Each species of the population, pick a random representant and build a representant array

2. Compute the distance between the Genome and the first representant using equation 1

3. If the distance is below a threshold (defined in configuration), put the Genome into the same Species than the representant.

4. If not, repeat Step 2 with next representant of the representant array.

5. At the end, if no existing species has been assigned to the Genome, create a new Species for that Genome.
```

### Fitness evaluation

> As the reproduction mechanism for NEAT, we use explicit fitness sharing (Goldberg
> and Richardson, 1987), where organisms in the same species must share the fitness
> of their niche. Thus, a species cannot afford to become too big even if many of its
> organisms perform well. Therefore, any one species is unlikely to take over the entire
> population, which is crucial for speciated evolution to work. The adjusted fitness f i 0 for
> organism i is calculated according to its distance δ from every other organism j in the
> population:

![Distance in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/adjusted-fitness-equation.png?raw=true, "Distance in neat algorithm")

> The sharing function sh is set to 0 when distance δ(i,P n j) is above the threshold δt ;
> otherwise, sh(δ(i, j)) is set to 1 (Spears, 1995). Thus, j=1 sh(δ(i, j)) reduces to the
> number of organisms in the same species as organism i. This reduction is natural since
> species are already clustered by compatibility using the threshold δ t .

### Population selection

> Every species is
> assigned a potentially different number of offspring in proportion to the sum of ad-
> justed fitnesses fi 0 of its member organisms. Species then reproduce by first eliminating
> the lowest performing members from the population. The entire population is then
> replaced by the offspring of the remaining organisms in each species.

### Mutation

> Mutation in NEAT can change both connection weights and network structures.
> Connection weights mutate as in any NE system, with each connection either per-
> turbed or not at each generation. Structural mutations occur in two ways (Figure 3).
> Each mutation expands the size of the genome by adding gene(s). In the add connection
> mutation, a single new connection gene with a random weight is added connecting
> two previously unconnected nodes. In the add node mutation, an existing connection is
> split and the new node placed where the old connection used to be. The old connection
> is disabled and two new connections are added to the genome. The new connection
> leading into the new node receives a weight of 1, and the new connection leading out
> receives the same weight as the old connection.

#### Connexion mutation

> The top number in each genome is the innovation number of
> that gene. The innovation numbers are historical markers that identify the original his-
> torical ancestor of each gene. New genes are assigned new increasingly higher num-
> bers. In adding a connection, a single new connection gene is added to the end of the
> genome and given the next available innovation number.

![Connexion mutaion in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/structural-mutation-1.png?raw=true, "Connexion mutaion in neat algorithm")

#### Node mutation

> In adding a new node, the connection gene being split is disabled, and two new connection genes are added to the
> end the genome. The new node is between the two new connections. A new node gene
> (not depicted) representing this new node is added to the genome as well.

![Node mutaion in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/structural-mutation-2.png?raw=true, "Node mutaion in neat algorithm")

### Crossover

![Crossover in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/crossover.png?raw=true, "Crossover in neat algorithm")

_Figure 4: Matching up genomes for different network topologies using innovation
numbers. Although Parent 1 and Parent 2 look different, their innovation numbers
(shown at the top of each gene) tell us which genes match up with which. Even with-
out any topological analysis, a new structure that combines the overlapping parts of the
two parents as well as their different parts can be created. Matching genes are inherited
randomly, whereas disjoint genes (those that do not match in the middle) and excess
genes (those that do not match in the end) are inherited from the more fit parent. In
this case, equal fitnesses are assumed, so the disjoint and excess genes are also inherited
randomly. The disabled genes may become enabled again in future generations: there’s
a preset chance that an inherited gene is disabled if it is disabled in either parent._
