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
    this.command = commandId ? { command: 'extension.handleCommand', title: label, arguments: [commandId, isKeybindingItem] } : undefined;
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
    }
    return [];
  }

  private getRootItems(): CommandTreeItem[] {
    return [
      new CommandTreeItem('Commands and Descriptions', '', '', undefined, vscode.TreeItemCollapsibleState.None),
      ...this.getCommandDescriptionItems(),
      new CommandTreeItem('Keybindings', '', '', undefined, vscode.TreeItemCollapsibleState.Expanded)
    ];
  }

  private getCommandDescriptionItems(): CommandTreeItem[] {
    return [
      new CommandTreeItem('---------------------------', '', '', undefined),
  
      // Basic Fold and Unfold Commands
      this.createCommandItem('Fold Functions', 'Fold all functions in the current file.', 'extension.foldFunctions', 'numberOne.png'),
      this.createCommandItem('Fold File', 'Fold all sections in the current file.', 'extension.foldFile', 'numberOne.png'),
      this.createCommandItem('Fold Everything', 'Fold all foldable regions and folders.', 'extension.foldAll', 'numberOne.png'),
      this.createCommandItem('Unfold Everything', 'Unfold all regions and folders.', 'extension.unfoldAll', 'numberOne.png'),
  
      new CommandTreeItem('---------------------------', '', '', undefined),
  
      // Selective Fold/Unfold Commands
      this.createCommandItem('Fold All Except Selected', 'Fold all sections except the selected one.', 'extension.foldAllExceptSelected', 'numberOne.png'),
      this.createCommandItem('Unfold All Except Selected', 'Unfold all sections except the selected one.', 'extension.unfoldAllExceptSelected', 'numberOne.png'),
  
      new CommandTreeItem('---------------------------', '', '', undefined),
  
      // Specific Level Folding Commands
      this.createCommandItem('Fold Level 1', 'Fold to level 1, typically collapsing the most outer structures like classes or namespaces.', 'extension.foldLevel1', 'numberOne.png'),
      this.createCommandItem('Fold Level 2', 'Fold to level 2, usually collapsing function definitions or inner classes.', 'extension.foldLevel2', 'numberTwo.png'),
      this.createCommandItem('Fold Level 3', 'Fold to level 3, collapsing detailed blocks like loops or conditionals.', 'extension.foldLevel3', 'numberThree.png'),
      this.createCommandItem('Fold Level 4', 'Fold to level 4, collapsing finer structures like nested blocks within functions.', 'extension.foldLevel4', 'numberFour.png'),
      this.createCommandItem('Fold Level 5', 'Fold to level 5, collapsing the smallest detail levels, such as inline comments or small code blocks.', 'extension.foldLevel5', 'numberFive.png'),
      new CommandTreeItem('---------------------------', '', '', undefined),
    ];
  }

  private createCommandItem(label: string, description: string, commandId: string, iconName: string): CommandTreeItem {
    console.log('iconName', iconName);
    const iconPath = vscode.Uri.file(path.join(__dirname, 'resources', iconName));
    console.log('iconPath', iconPath);
    return new CommandTreeItem(label, description, commandId, iconPath);
  }

  private getKeybindingItems(): CommandTreeItem[] {
    return [
      this.createKeybindingItem('extension.foldFile', 'Fold File', 'Ctrl+Alt+F'),
      this.createKeybindingItem('extension.foldAll', 'Fold Everything', 'Ctrl+Alt+A'),
      this.createKeybindingItem('extension.unfoldAll', 'Unfold Everything', 'Ctrl+Alt+U')
    ];
  }

  private createKeybindingItem(commandId: string, label: string, defaultShortcut: string): CommandTreeItem {
    const keybinding = this.getKeybindingForCommand(commandId) || defaultShortcut;
    const iconPath = vscode.Uri.file(path.join(__dirname, 'resources', 'collapseFile.png'));
    return new CommandTreeItem(label, `Shortcut: ${keybinding}`, commandId, iconPath, vscode.TreeItemCollapsibleState.None, true);
  }

  private getKeybindingForCommand(commandId: string): string | undefined {
    const keybindings = vscode.workspace.getConfiguration('keybindings');
    const keybinding = keybindings.inspect(`[${commandId}]`);
    return keybinding?.globalValue?.toString();
  }
}

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new CommandTreeDataProvider();
  vscode.window.registerTreeDataProvider('foldView', treeDataProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.handleCommand', (commandId: string, isKeybindingItem: boolean) => {
      if (isKeybindingItem) {
        vscode.window.showInformationMessage(`To change the keybinding for "${commandId}", please search for it in the Keybindings settings.`);
        vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
      } else {
        vscode.commands.executeCommand(commandId);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.foldFunctions', () => {
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
    vscode.commands.registerCommand('extension.foldFile', () => {
      vscode.window.showInformationMessage('Folding all sections in the file.');
      vscode.commands.executeCommand('editor.foldAll');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.foldAll', () => {
      vscode.window.showInformationMessage('Folding all foldable regions and folders.');
      vscode.commands.executeCommand('editor.foldAll');
      vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.unfoldAll', () => {
      vscode.window.showInformationMessage('Unfolding all regions and folders.');
      vscode.commands.executeCommand('editor.unfoldAll');
      vscode.commands.executeCommand('workbench.files.action.expandExplorerFolders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.foldAllExceptSelected', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedRange = editor.selection;
        vscode.commands.executeCommand('editor.foldAll').then(() => {
          vscode.commands.executeCommand('editor.unfold', {
            selectionLines: [selectedRange.start.line, selectedRange.end.line]
          });
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.unfoldAllExceptSelected', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedRange = editor.selection;
        vscode.commands.executeCommand('editor.unfoldAll').then(() => {
          vscode.commands.executeCommand('editor.foldAll');
          for (let i = 0; i < selectedRange.start.line; i++) {
            vscode.commands.executeCommand('editor.fold', { lineNumber: i });
          }
          for (let i = selectedRange.end.line + 1; i < editor.document.lineCount; i++) {
            vscode.commands.executeCommand('editor.fold', { lineNumber: i });
          }
        });
      }
    })
  );

  const foldLevels = [1, 2, 3, 4, 5];
  foldLevels.forEach(level => {
    context.subscriptions.push(
      vscode.commands.registerCommand(`extension.foldLevel${level}`, () => {
        vscode.window.showInformationMessage(`Folding to level ${level}.`);
        vscode.commands.executeCommand(`editor.foldLevel${level}`);
      })
    );
  });

  // Listen for configuration changes (general settings)
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('keybindings')) {
      // This would react to any change in the keybindings configuration
      vscode.window.showInformationMessage('Keybindings have been updated. Please restart the extension for changes to take effect.');
      // Optionally, trigger a refresh or update the internal state of your extension
      treeDataProvider.refresh();
    }
  });
}

export function deactivate() {}
