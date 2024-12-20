const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch'); // Use require for node-fetch v2

function activate(context) {
    console.log("Code-Mate extension activated!");

    // // Register the command to open the chat webview
    // let disposable = vscode.commands.registerCommand('codeMate.openChat', function () {
    //     // Create and show a new webview
    //     const panel = vscode.window.createWebviewPanel(
    //         'codeMate', // Internal identifier of the webview
    //         'Open Code-Mate Chat', // Title displayed in the tab
    //         vscode.ViewColumn.One, // Show the webview in the current editor column
    //         {
    //             enableScripts: true // Enable JavaScript in the webview
    //         }
    //     );

    //     // Load the HTML content for the webview
    //     const htmlPath = path.join(context.extensionPath, 'webview.html');
    //     panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

    //     // Handle messages received from the webview
    //     panel.webview.onDidReceiveMessage(async (message) => {
    //         const { context, prompt } = message;

    //         try {
    //             // Make a POST request to the Flask backend
    //             const response = await fetch('http://127.0.0.1:5000/suggest', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ context, prompt })
    //             });

    //             // Check if the response is OK
    //             if (!response.ok) {
    //                 throw new Error(`Backend returned an error: ${response.statusText}`);
    //             }

    //             // Parse the JSON response from the backend
    //             const data = await response.json();

    //             // Send the suggestion back to the webview
    //             if (panel && panel.webview) {
    //                 panel.webview.postMessage({ suggestion: data.suggestion || "No output generated." });
    //             }
    //         } catch (error) {
    //             // Handle any errors and send them to the webview
    //             console.error("Error fetching data from backend:", error.message);
    //             if (panel && panel.webview) {
    //                 panel.webview.postMessage({ suggestion: `Error: ${error.message}` });
    //             }
    //         }
    //     });

    //     // Log when the webview is disposed
    //     panel.onDidDispose(() => {
    //         console.log("Code-Mate webview closed.");
    //     });
    // });

    // context.subscriptions.push(disposable);

    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: '*' }, // Apply to all file types
        {
            async provideCompletionItems(document, position, token, context) {
                // Get the text before the cursor
                const textBeforeCursor = document.getText(
                    new vscode.Range(new vscode.Position(0, 0), position)
                );

                // Call the backend API
                try {
                    const response = await fetch('http://127.0.0.1:5000/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ context: "", prompt: textBeforeCursor })
                    });

                    if (!response.ok) {
                        throw new Error(`Backend error: ${response.statusText}`);
                    }

                    const data = await response.json();

                    // Create a completion item from the response
                    const completion = new vscode.CompletionItem(
                        data.suggestion || "No suggestion available",
                        vscode.CompletionItemKind.Snippet
                    );

                    return [completion];
                } catch (error) {
                    console.error("Error fetching suggestion:", error.message);
                    return [];
                }
            }
        },
        '' // Trigger completions on every character
    );

    context.subscriptions.push(provider);

    console.log("CompletionItemProvider registered!");

    // Register a custom command for manual suggestions
    let disposable = vscode.commands.registerCommand('codeMate.triggerSuggestion', async () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const position = editor.selection.active;
            const textBeforeCursor = editor.document.getText(
                new vscode.Range(new vscode.Position(0, 0), position)
            );

            try {
                // Call the backend API for a suggestion
                const response = await fetch('http://127.0.0.1:5000/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context: "", prompt: textBeforeCursor })
                });

                if (!response.ok) {
                    throw new Error(`Backend error: ${response.statusText}`);
                }

                const data = await response.json();
                const suggestion = data.suggestion || "No suggestion generated.";

                // Insert the suggestion at the current cursor position
                editor.insertSnippet(new vscode.SnippetString(suggestion));
            } catch (error) {
                console.error("Error fetching suggestion:", error.message);
                vscode.window.showErrorMessage(`Code Mate Error: ${error.message}`);
            }
        } else {
            vscode.window.showErrorMessage("No active editor found.");
        }
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
