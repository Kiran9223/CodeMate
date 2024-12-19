const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch'); // Use require for node-fetch v2

function activate(context) {
    console.log("Code-Mate extension activated!");

    // Register the command to open the chat webview
    let disposable = vscode.commands.registerCommand('codeMate.openChat', function () {
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel(
            'codeMate', // Internal identifier of the webview
            'Open Code-Mate Chat', // Title displayed in the tab
            vscode.ViewColumn.One, // Show the webview in the current editor column
            {
                enableScripts: true // Enable JavaScript in the webview
            }
        );

        // Load the HTML content for the webview
        const htmlPath = path.join(context.extensionPath, 'webview.html');
        panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

        // Handle messages received from the webview
        panel.webview.onDidReceiveMessage(async (message) => {
            const { context, prompt } = message;

            try {
                // Make a POST request to the Flask backend
                const response = await fetch('http://127.0.0.1:5000/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context, prompt })
                });

                // Check if the response is OK
                if (!response.ok) {
                    throw new Error(`Backend returned an error: ${response.statusText}`);
                }

                // Parse the JSON response from the backend
                const data = await response.json();

                // Send the suggestion back to the webview
                if (panel && panel.webview) {
                    panel.webview.postMessage({ suggestion: data.suggestion || "No output generated." });
                }
            } catch (error) {
                // Handle any errors and send them to the webview
                console.error("Error fetching data from backend:", error.message);
                if (panel && panel.webview) {
                    panel.webview.postMessage({ suggestion: `Error: ${error.message}` });
                }
            }
        });

        // Log when the webview is disposed
        panel.onDidDispose(() => {
            console.log("Code-Mate webview closed.");
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
    console.log("Code-Mate extension deactivated!");
}

module.exports = {
    activate,
    deactivate
};
