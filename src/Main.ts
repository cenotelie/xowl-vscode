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
import { Readable } from 'stream';
import * as Net from "net";
import { LanguageClient, LanguageClientOptions, StreamInfo } from "vscode-languageclient";

export function activate(context: VSCode.ExtensionContext): void {
    createLanguageClient(context);
}

/**
 * Creates a new language client for this extension
 * @param context  The extension's content
 * @return The language client
 */
function createLanguageClient(context: VSCode.ExtensionContext): LanguageClient {
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
                VSCode.workspace.createFileSystemWatcher("**/*.sparql"),
                VSCode.workspace.createFileSystemWatcher("**/*.denotation")
            ]
        }, outputChannelName: "vscode-xowl-languages"
    };
    function createServer(): Promise<StreamInfo> {
        return doCreateServer(context, client);
    }
    let client = new LanguageClient('vscode-xowl-languages', 'xOWL Language Server', createServer, clientOptions);
    let disposable = client.start();
    context.subscriptions.push(disposable);
    return client;
}

/**
 * Do creates the language server
 * @param context The current context
 * @param client  The language client
 * @return The promise for a StreamInfo
 */
function doCreateServer(context: VSCode.ExtensionContext, client: LanguageClient): Promise<StreamInfo> {
    return new Promise((resolve, reject) => {
        let java = resolveJava();
        if (java == null) {
            reject("[ERROR] Failed to find Java executable");
            return;
        }
        resolveJavaGetVersion(java).then(version => {
            client.outputChannel.appendLine("[INFO] Will use Java: " + java + " (version " + version + ")");
            serverLaunchProcess(context, java, client.outputChannel).then(stream => {
                resolve(stream);
            }, message => {
                reject(message);
            }).catch(error => {
                reject("[ERROR] " + error);
            });
        }, message => {
            reject(message);
        }).catch(error => {
            reject("[ERROR] " + error);
        });
    });
}

/**
 * Creates a new LSP server
 * @param context The current context
 * @param java    The java executable use use
 * @param channel The channel to use for output
 * @return The stream to communicate with the server
 */
function serverLaunchProcess(context: VSCode.ExtensionContext, java: string, channel: VSCode.OutputChannel): Promise<StreamInfo> {
    return new Promise((resolve, reject) => {
        let jarPath = Path.resolve(context.extensionPath, "target", "server.jar");
        let options = { cwd: VSCode.workspace.rootPath };
        channel.appendLine("[INFO] Launching server as " + java + " -jar " + jarPath);
        let process = ChildProcess.spawn(java, ["-jar", jarPath], options);
        if (process == null) {
            reject("[ERROR] Failed to launch the server");
            return;
        }
        channel.appendLine("[INFO] Launched server as process " + process.pid);
        serverAttachStream(process.stdout, channel);
        serverAttachStream(process.stderr, channel);
        try {
            let socket = Net.connect(8000, "localhost", () => {
                resolve({
                    writer: socket,
                    reader: socket
                });
            });
        } catch (exception) {
            reject("[ERROR] " + exception);
        }
    });
}

/**
 * Attach a process stream to a channel
 * @param readable      The process stream
 * @param outputChannel The channel
 */
function serverAttachStream(readable: Readable, channel: VSCode.OutputChannel): void {
    readable.on('data', chunk => {
        const chunkAsString = typeof chunk === 'string' ? chunk : chunk.toString();
        channel.append(chunkAsString);
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
                reject("[ERROR] Failed to determine version of " + execName);
                return;
            }
            let matches = lines[0].match("version \"([^\"]+)\"");
            if (matches == null) {
                reject("[ERROR] Failed to determine version of " + execName);
                return;
            }
            if (matches.length < 2) {
                reject("[ERROR] Failed to determine version of " + execName);
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