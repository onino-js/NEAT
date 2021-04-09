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

_A genotype to phenotype mapping example. A genotype is depicted that
produces the shown phenotype. There are 3 input nodes, one hidden, and one output
node, and seven connection definitions, one of which is recurrent. The second gene is
disabled, so the connection that it specifies (between nodes 2 and 4) is not expressed in
the phenotype._

src: [Evolving Neural Networks through Augmenting Topologies](https://www.cs.utexas.edu/users/ai-lab/pubs/stanley.gecco02_1.pdf)
