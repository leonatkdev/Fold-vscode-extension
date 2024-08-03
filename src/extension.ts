import * as vscode from 'vscode';
import * as path from 'path';

class CommandTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly commandId: string,
    public readonly iconPath?: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly isKeybindingItem: boolean = false
  ) {
    super(label, collapsibleState);
    this.command = commandId ? { command: 'autofold.handleCommand', title: label, arguments: [commandId, isKeybindingItem] } : undefined;
    this.description = description;
    this.iconPath = iconPath;
  }
}

class CommandTreeDataProvider implements vscode.TreeDataProvider<CommandTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<CommandTreeItem | undefined | void> = new vscode.EventEmitter<CommandTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<CommandTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CommandTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CommandTreeItem): CommandTreeItem[] | Thenable<CommandTreeItem[]> {
    if (!element) {
      return this.getRootItems();
    } else if (element.label === 'Keybindings') {
      return this.getKeybindingItems();
    } else if (element.label === 'Bonus') {
      return this.getKeybindingItemsBonus();
    }
    return [];
  }

  private getRootItems(): CommandTreeItem[] {
    return [
      new CommandTreeItem('Commands and Descriptions', '', '', undefined, vscode.TreeItemCollapsibleState.None),
      ...this.getCommandDescriptionItems(),
      new CommandTreeItem('Keybindings', '', '', undefined, vscode.TreeItemCollapsibleState.Expanded),
      new CommandTreeItem('Bonus', '', '', undefined, vscode.TreeItemCollapsibleState.Expanded)
    ];
  }

  private getCommandDescriptionItems(): CommandTreeItem[] {
    return [
      new CommandTreeItem('---------------------------', '', '', undefined),

      // Basic Fold and Unfold Commands
      this.createCommandItem('Fold Functions', 'Fold all functions in the current file.', 'autofold.foldFunctions', 'functions.svg'),
      this.createCommandItem('Fold File', 'Fold all sections in the current file.', 'autofold.foldFile', 'file.svg'),
      this.createCommandItem('Fold File and Folders', 'Fold all foldable regions and folders.', 'autofold.foldAll', 'folder.svg'),
      this.createCommandItem('Unfold File', 'Unfold all regions in the current file. .', 'autofold.unfoldFile', 'unfold.svg'),

      new CommandTreeItem('---------------------------', '', '', undefined),

      // Selective Fold/Unfold Commands
      this.createCommandItem('Fold All Except Selected', 'Fold all sections except the selected one.', 'autofold.foldAllExceptSelected', 'selected.svg'),
      this.createCommandItem('Unfold All Except Selected', 'Unfold all sections except the selected one.', 'autofold.unfoldAllExceptSelected', 'selected.svg'),

      new CommandTreeItem('---------------------------', '', '', undefined),

      // Specific Level Folding Commands
      this.createCommandItem('Fold Level 1', 'Fold to level 1, typically collapsing the most outer structures like classes or namespaces.', 'autofold.foldLevel1', 'numberOne.svg'),
      this.createCommandItem('Fold Level 2', 'Fold to level 2, usually collapsing function definitions or inner classes.', 'autofold.foldLevel2', 'numberTwo.svg'),
      this.createCommandItem('Fold Level 3', 'Fold to level 3, collapsing detailed blocks like loops or conditionals.', 'autofold.foldLevel3', 'numberThree.svg'),
      this.createCommandItem('Fold Level 4', 'Fold to level 4, collapsing finer structures like nested blocks within functions.', 'autofold.foldLevel4', 'numberFour.svg'),
      this.createCommandItem('Fold Level 5', 'Fold to level 5, collapsing the smallest detail levels, such as inline comments or small code blocks.', 'autofold.foldLevel5', 'numberFive.svg'),
      new CommandTreeItem('---------------------------', '', '', undefined),
    ];
  }

  private getKeybindingItemsBonus(): CommandTreeItem[] {
    return [
      this.createCommandItem('Single Quote', 'Format to Single Quote', 'autofold.singleQoute',  "noDouble.svg"),
      this.createCommandItem('Double Quote', 'Format to Double Quote', 'autofold.DoubleQoute',  "doubleQoute.svg"),
    ];
  }

  private createCommandItem(label: string, description: string, commandId: string, iconName: string): CommandTreeItem {
    const iconPath = vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', iconName));
    return new CommandTreeItem(label, description, commandId, iconPath);
  }

  private getKeybindingItems(): CommandTreeItem[] {
    return [
      this.createKeybindingItem('autofold.foldFile', 'Fold File', 'Default Shortcut: Ctrl+Alt+F', ""),
      this.createKeybindingItem('autofold.foldAll', 'Fold Everything', 'Default Shortcut: Ctrl+Alt+A', ""),
      this.createKeybindingItem('autofold.unfoldFile', 'Unfold Everything', 'Default Shortcut: Ctrl+Alt+U', "")
    ];
  }


  private createKeybindingItem(commandId: string, label: string, defaultShortcut: string, iconName: string): CommandTreeItem {
    const keybinding = this.getKeybindingForCommand(commandId) || defaultShortcut;
    const iconPath = vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', iconName));

    return new CommandTreeItem(label, `${keybinding}`, commandId, iconPath, vscode.TreeItemCollapsibleState.None, true);
  }

  private getKeybindingForCommand(commandId: string): string | undefined {
    const keybindings = vscode.workspace.getConfiguration('keybindings');
    const keybinding = keybindings.inspect(`[${commandId}]`);
    return keybinding?.globalValue?.toString();
  }
}

function replaceQuotes(document: vscode.TextDocument, editor: vscode.TextEditor, targetQuote: '"' | "'"): Thenable<boolean> {
  const singleQuoteRegex = /'/g;
  const doubleQuoteRegex = /"/g;

  const edit = new vscode.WorkspaceEdit();
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const newText = targetQuote === '"' ? line.text.replace(singleQuoteRegex, '"') : line.text.replace(doubleQuoteRegex, "'");
    edit.replace(document.uri, line.range, newText);
  }
  return vscode.workspace.applyEdit(edit);
}

export function activate(context: vscode.ExtensionContext) {

  const treeDataProvider = new CommandTreeDataProvider();
  vscode.window.registerTreeDataProvider('foldView', treeDataProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.handleCommand', (commandId: string, isKeybindingItem: boolean) => {
      if (isKeybindingItem) {
        vscode.window.showInformationMessage(`To change the keybinding for "${commandId}", please search for it in the Keybindings settings.`);
        vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
      } else {
        vscode.commands.executeCommand(commandId);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.foldFunctions', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { document } = editor;
        const functionRegex = /function\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*\(.*?\)\s*{/g;
        let match;
        while ((match = functionRegex.exec(document.getText())) !== null) {
          const start = document.positionAt(match.index);
          const end = new vscode.Position(start.line, start.character);
          editor.selection = new vscode.Selection(start, end);
          vscode.commands.executeCommand('editor.fold');
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.foldFile', () => {
      vscode.window.showInformationMessage('Folding all sections in the file.');
      vscode.commands.executeCommand('editor.foldAll');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.foldAll', () => {
      vscode.window.showInformationMessage('Folding all foldable regions and folders.');
      vscode.commands.executeCommand('editor.foldAll');
      vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.unfoldFile', () => {
      vscode.window.showInformationMessage('Unfolding all regions and folders.');
      vscode.commands.executeCommand('editor.unfoldFile');
      vscode.commands.executeCommand('workbench.files.action.expandExplorerFolders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.foldAllExceptSelected', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedRange = editor.selection;

        // Fold all regions first
        await vscode.commands.executeCommand('editor.foldAll');

        // Now unfold the regions within the selected range
        const startLine = selectedRange.start.line;
        const endLine = selectedRange.end.line;

        // Unfold from the start line to the end line
        for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
          await vscode.commands.executeCommand('editor.unfold', { selectionLines: [lineNumber] });
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.unfoldAllExceptSelected', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedRange = editor.selection;

        // Unfold all regions first
        await vscode.commands.executeCommand('editor.unfoldFile');

        // Now fold all regions except the ones within the selected range
        const startLine = selectedRange.start.line;
        const endLine = selectedRange.end.line;
        const totalLines = editor.document.lineCount;

        // Fold lines before the selected range
        if (startLine > 0) {
          for (let lineNumber = 0; lineNumber < startLine; lineNumber++) {
            await vscode.commands.executeCommand('editor.fold', { selectionLines: [lineNumber] });
          }
        }

        // Fold lines after the selected range
        if (endLine < totalLines - 1) {
          for (let lineNumber = endLine + 1; lineNumber < totalLines; lineNumber++) {
            await vscode.commands.executeCommand('editor.fold', { selectionLines: [lineNumber] });
          }
        }
      }
    })
  );

  const foldLevels = [1, 2, 3, 4, 5];
  foldLevels.forEach(level => {
    context.subscriptions.push(
      vscode.commands.registerCommand(`autofold.foldLevel${level}`, () => {
        vscode.window.showInformationMessage(`Folding to level ${level}.`);
        vscode.commands.executeCommand(`editor.foldLevel${level}`);
      })
    );
  });

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.singleQoute', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        replaceQuotes(editor.document, editor, "'").then(() => {
          vscode.window.showInformationMessage('Formatted to single quotes.');
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.DoubleQoute', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        replaceQuotes(editor.document, editor, '"').then(() => {
          vscode.window.showInformationMessage('Formatted to double quotes.');
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('autofold.foldSelection', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { selection } = editor;
        if (!selection.isEmpty) {
          vscode.commands.executeCommand('editor.fold', { selectionLines: [selection.start.line, selection.end.line] });
        } else {
          vscode.window.showInformationMessage('No selection found to fold.');
        }
      }
    })
  );

  // Listen for configuration changes
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('keybindings')) {
      // Handle keybinding changes
      treeDataProvider.refresh();
    }
  });
}

export function deactivate() {}
