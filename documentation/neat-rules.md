# NEAT rules

### Encoding the genome

> NEAT’s genetic encoding scheme is designed to allow corresponding genes to be easily
> lined up when two genomes cross over during mating. Genomes are linear represen-
> tations of network connectivity (Figure 2). Each genome includes a list of connection
> genes, each of which refers to two node genes being connected. Node genes provide a
> list of inputs, hidden nodes, and outputs that can be connected. Each connection gene
> specifies the in-node, the out-node, the weight of the connection, whether or not the
> connection gene is expressed (an enable bit), and an innovation number, which allows
> finding corresponding genes (as will be explained below).

![Encoding the genome in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/genotype-encoding.png?raw=true, "Encoding the genome in neat algorithm")

_Figure 2: A genotype to phenotype mapping example. A genotype is depicted that
produces the shown phenotype. There are 3 input nodes, one hidden, and one output
node, and seven connection definitions, one of which is recurrent. The second gene is
disabled, so the connection that it specifies (between nodes 2 and 4) is not expressed in
the phenotype._

# NEAT rules

### Trackling topological changes

### Speciation

> The idea is to divide the population into species such
> The number of excess and disjoint genes between a pair of genomes is a natural
> measure of their compatibility distance. The more disjoint two genomes are, the less
> evolutionary history they share, and thus the less compatible they are. Therefore, we
> can measure the compatibility distance δ of different structures in NEAT as a simple lin-
> ear combination of the number of excess E and disjoint D genes, as well as the average
> weight differences of matching genes W , including disabled genes:

![Distance in neat algorithm](https://github.com/onino-js/NEAT/blob/main/documentation/images/distance-equation.png?raw=true, "Distance in neat algorithm")

> The coefficients c 1 , c 2 , and c 3 allow us to adjust the importance of the three factors, and
> the factor N , the number of genes in the larger genome, normalizes for genome size (N
> can be set to 1 if both genomes are small, i.e., consist of fewer than 20 genes).
> The distance measure δ allows us to speciate using a compatibility threshold δ t .

> An ordered list of species is maintained. In each generation, genomes are sequentially
> placed into species. Each existing species is represented by a random genome inside
> the species from the previous generation. A given genome g in the current generation is
> placed in the first species in which g is compatible with the representative genome of
> that species. This way, species do not overlap. 1 If g is not compatible with any existing
> species, a new species is created with g as its representative.

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

src: [Evolving Neural Networks through Augmenting Topologies](https://www.cs.utexas.edu/users/ai-lab/pubs/stanley.gecco02_1.pdf)
