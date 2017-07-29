'use strict';

/*******************************************************************************
* Copyright (c) 2017 Association Cénotélie (cenotelie.fr)
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as
* published by the Free Software Foundation, either version 3
* of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General
* Public License along with this program.
* If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/

import * as VSCode from "vscode";
import * as OS from "os";
import * as Path from "path";
import * as FS from "fs";
import * as ChildProcess from "child_process";
import * as Net from "net";
import { LanguageClient, LanguageClientOptions, StreamInfo } from "vscode-languageclient";

export function activate(context: VSCode.ExtensionContext): void {
    let java = resolveJava();
    if (java == null) {
        console.error("vscode-xowl-languages: Failed to find Java executable");
        return;
    }
    resolveJavaGetVersion(java).then(version => {
        onJavaAvailable(context, java, version);
    }, message => {
        console.error(message);
    }).catch(error => {
        console.error(error);
    });
}

/**
 * Continues the initialization for this extension when java is available
 * @param context The current context
 * @param java    The path to the Java executable
 * @param version The Java version
 */
function onJavaAvailable(context: VSCode.ExtensionContext, java: string, version: string): void {
    console.info("vscode-xowl-languages: Will use Java: " + java + " (version " + version + ")");
    let clientOptions: LanguageClientOptions = {
        documentSelector: ["rdf-nt", "rdf-nq", "rdf-ttl", "rdf-trig", "rdf-xml", "xrdf", "owl-fs", "owl-xml", "xowl", "sparql"],
        synchronize: {
            fileEvents: [
                VSCode.workspace.createFileSystemWatcher("**/*.nt"),
                VSCode.workspace.createFileSystemWatcher("**/*.nq"),
                VSCode.workspace.createFileSystemWatcher("**/*.ttl"),
                VSCode.workspace.createFileSystemWatcher("**/*.trig"),
                VSCode.workspace.createFileSystemWatcher("**/*.rdf"),
                VSCode.workspace.createFileSystemWatcher("**/*.xrdf"),
                VSCode.workspace.createFileSystemWatcher("**/*.ofn"),
                VSCode.workspace.createFileSystemWatcher("**/*.fs"),
                VSCode.workspace.createFileSystemWatcher("**/*.owl"),
                VSCode.workspace.createFileSystemWatcher("**/*.owx"),
                VSCode.workspace.createFileSystemWatcher("**/*.xowl"),
                VSCode.workspace.createFileSystemWatcher("**/*.sparql")
            ]
        }
    };
    function createServer(): Promise<StreamInfo> {
        return serverConnect(8000);
    }
    let client = new LanguageClient('vscode-xowl-languages', 'xOWL Language Server', createServer, clientOptions);
    let disposable = client.start();
    context.subscriptions.push(disposable);
}

/**
 * Creates a new LSP server
 * @param java The java executable use use
 * @return A promise for I/O streams
 */
function serverLaunchProcess(java: string): Promise<StreamInfo> {
    return null;
}

/**
 * Connects to a running server
 * @param port The port on the server
 * @return A promise for I/O streams
 */
function serverConnect(port: number): Promise<StreamInfo> {
    return new Promise((resolve, reject) => {
        let socket = Net.connect(port);
        resolve({
            writer: socket,
            reader: socket
        });
    });
}


export function deactivate(): void {
}

/**
 * Resolves the Java executable
 * @return The full path to the executable if it is found, null otherwise
 */
function resolveJava(): string {
    // the executable name
    let execName = (process.platform === "win32" ? "java.exe" : "java");

    // is the java.home setting defined?
    let settingJavaHome = VSCode.workspace.getConfiguration("java").get("home") as string;
    if (settingJavaHome != null) {
        let result = resolveJavaInDirectory(settingJavaHome, execName);
        if (result != null)
            return result;
    }

    // look in JAVA_HOME variable
    let envJavaHome = process.env["JAVA_HOME"];
    if (envJavaHome != null) {
        let result = resolveJavaInDirectory(envJavaHome, execName);
        if (result != null)
            return result;
    }

    // look in PATH variable
    let envPath = process.env["PATH"];
    if (envPath != null) {
        let directories = envPath.split(Path.delimiter);
        for (let i = 0; i != directories.length; i++) {
            let result = resolveJavaInDirectory(directories[i], execName);
            if (result != null)
                return result;
        }
    }
    return null;
}

/**
 * Gets the java version of the specified Java executable
 * @param execName The executable Java
 * @return A promise for the version
 */
function resolveJavaGetVersion(execName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let result = ChildProcess.execFile(execName, ["-version"], {}, (error, stdout, stderr) => {
            if (error != null)
                reject(error);
            let lines = stderr.split(OS.EOL);
            if (lines.length == 0) {
                reject("vscode-xowl-languages: Failed to determine version of " + execName);
                return;
            }
            let matches = lines[0].match("version \"([^\"]+)\"");
            if (matches == null) {
                reject("vscode-xowl-languages: Failed to determine version of " + execName);
                return;
            }
            if (matches.length < 2) {
                reject("vscode-xowl-languages: Failed to determine version of " + execName);
                return;
            }
            resolve(matches[1]);
        });
    });
}

/**
 * Tries to resolves the Java executable in the specified directory
 * @param directory The directory to investigate
 * @param execName  The executable name to look for
 * @return The full path to the executable if it is found, null otherwise
 */
function resolveJavaInDirectory(directory: string, execName: string): string {
    let fullPath = Path.join(directory, execName);
    if (FS.existsSync(fullPath))
        return fullPath;
    fullPath = Path.join(directory, "bin", execName);
    if (FS.existsSync(fullPath))
        return fullPath;
    return null;
}