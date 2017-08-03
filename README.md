# Semantic Web Languages Support

Adds language support for semantic web languages and other xOWL-related languages:

* [RDF](https://www.w3.org/RDF/) Resource Description Framework
    * Supported syntaxes: N-Triples, N-Quads, Turtle, TriG and RDF/XML
* [OWL](https://www.w3.org/OWL/) Web Ontology Language
    * Supported syntaxes: Functional, OWL/XML
* [SPARQL](https://www.w3.org/TR/sparql11-query/) SPARQL Protocol and RDF Query Language
* [xRDF](https://cenotelie.fr/xowl) Executable Resource Description Framework
* [xOWL](https://cenotelie.fr/xowl) Executable Web Ontology Language
* [Denotation](https://cenotelie.fr/xowl) Denotation capture language

## Install and Prerequisites

Open up VS Code and hit `F1` and type `ext` select Install Extension and type `xowl-languages` hit enter and reload window to enable. 

> **Note**: This extension requires a location installation of Java.
> Java can be installed from [Oracle](http://www.oracle.com/technetwork/java/javase/downloads/index.html),
> or from the [OpenJDK](http://openjdk.java.net/install/) project.

This extension looks for a local installation a Java using (in this order):
* The `java.home` configuration of VSCode.
* The `JAVA_HOME` environment variable.
* The `PATH` environment variable.

## Features

* Syntactic coloring for the supported syntaxes.
* Detection of semantic resources across files and syntaxes.
* Syntactic verification and other diagnostics for common issues.

## License

GNU LESSER GENERAL PUBLIC LICENSE Version 3