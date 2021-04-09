# NEAT rules

### Encoding the genome

NEAT’s genetic encoding scheme is designed to allow corresponding genes to be easily
lined up when two genomes cross over during mating. Genomes are linear represen-
tations of network connectivity (Figure 2). Each genome includes a list of connection
genes, each of which refers to two node genes being connected. Node genes provide a
list of inputs, hidden nodes, and outputs that can be connected. Each connection gene
specifies the in-node, the out-node, the weight of the connection, whether or not the
connection gene is expressed (an enable bit), and an innovation number, which allows
finding corresponding genes (as will be explained below).

src: ![](https://github.com/onino-js/NEAT/tree/main/documentation/images/genotype-encoding.png)

src: [Evolving Neural Networks through Augmenting Topologies](https://www.cs.utexas.edu/users/ai-lab/pubs/stanley.gecco02_1.pdf)
