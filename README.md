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
* The `xowl.java` configuration of VSCode.
* The `JAVA_HOME` environment variable.
* The `PATH` environment variable.

## Features

* Syntactic coloring for the supported syntaxes.
* Detection of semantic resources across files and syntaxes.
* Syntactic verification and other diagnostics for common issues.

## Settings

`xowl.java { string }`
* The path to a location installation of Java.
* If set, this specification of Java will be used before others.

`xowl.lsp.server { integrated | remote }`
* Defaults to `integrated`.
* This setting specifies which language server to use:
    * `integrated`: use of the language server embedded within this extension.
    * `remote`: connect to a remote language server (on `localhost`). The port can be configured with `xowl.lsp.server.port`.

`xowl.lsp.server.port { integer }`
* Specifies the port to be used to connect to a remote language server.
* This setting is only used when `xowl.lsp.server` is set to `remote`.

## License

The source code to this extension is the property of the [Association Cénotélie](https://cenotelie.fr). It is available in [xowl-vscode](https://bitbucket.org/cenotelie/xowl-vscode) and licensed under the GNU Lesser General Public License Version 3.

This extension embeds a compiled version of the language server. The source code to the language server is available on [xowl-infra](https://bitbucket.org/cenotelie/xowl-infra) and licensed under the GNU Lesser General Public License Version 3 by the [Association Cénotélie](https://cenotelie.fr).