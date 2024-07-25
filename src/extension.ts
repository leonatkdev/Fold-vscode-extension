import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Command to collapse all functions in the current file
  let collapseFunctionsDisposable = vscode.commands.registerCommand('extension.collapseAllFunctions', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const { document } = editor;
      const functionRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
      let match;
      while ((match = functionRegex.exec(document.getText())) !== null) {
        const start = document.positionAt(match.index);
        const end = new vscode.Position(start.line, start.character);
        editor.selections = [new vscode.Selection(start, end)];
        vscode.commands.executeCommand('editor.fold');
      }
    }
  });

  // Command to collapse everything in the file
  let collapseFileDisposable = vscode.commands.registerCommand('extension.collapseFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      vscode.commands.executeCommand('editor.foldAll');
    }
  });

  // Command to collapse all foldable regions in the workspace and folders in the Explorer
  let collapseAllDisposable = vscode.commands.registerCommand('extension.collapseAll', () => {
    vscode.commands.executeCommand('editor.foldAll');
    vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
  });

  // Command to uncollapse all foldable regions in the workspace and expand all folders in the Explorer
  let uncollapseAllDisposable = vscode.commands.registerCommand('extension.uncollapseAll', () => {
    vscode.commands.executeCommand('editor.unfoldAll');
  });

  // Add disposables to the context
  context.subscriptions.push(collapseFunctionsDisposable);
  context.subscriptions.push(collapseFileDisposable);
  context.subscriptions.push(collapseAllDisposable);
  context.subscriptions.push(uncollapseAllDisposable);
}

export function deactivate() {}
