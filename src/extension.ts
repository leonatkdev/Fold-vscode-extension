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
      new CommandTreeItem(
        '---------------------------',
        '',
        '',
        undefined
      ),
      this.createCommandItem('Collapse Functions', 'Collapse functions in the current file.', 'extension.collapseFile', 'numberOne.png'),
      this.createCommandItem('Collapse File', 'Collapse all sections in the current file.', 'extension.collapseFile', 'numberOne.png'),
      this.createCommandItem('Collapse Everything', 'Collapse all foldable regions and folders.', 'extension.collapseAll', 'numberOne.png'),
      this.createCommandItem('Uncollapse Everything', 'Uncollapse all regions and folders.', 'extension.uncollapseAll', 'numberOne.png'),
      this.createCommandItem('Fold 1', 'Fold One', 'extension.foldLevel1', 'numberOne.png'),
      this.createCommandItem('Fold 2', 'Fold Two', 'extension.foldLevel2', 'numberOne.png'),
      this.createCommandItem('Fold 3', 'Fold Three', 'extension.foldLevel3', 'numberOne.png'),
      this.createCommandItem('Fold 4', 'Fold Four', 'extension.foldLevel4', 'numberOne.png'),
      this.createCommandItem('Fold 5', 'Fold Five', 'extension.foldLevel5', 'numberOne.png'),
    ];
  }

  private createCommandItem(label: string, description: string, commandId: string, iconName: string): CommandTreeItem {
    console.log('iconName', iconName)
    const iconPath = vscode.Uri.file(path.join(__dirname, 'resources', iconName));
    console.log('iconPath', iconPath)
    return new CommandTreeItem(label, description, commandId, iconPath);
  }

  private getKeybindingItems(): CommandTreeItem[] {
    return [
      this.createKeybindingItem('extension.collapseFile', 'Collapse File', 'Ctrl+Alt+F'),
      this.createKeybindingItem('extension.collapseAll', 'Collapse Everything', 'Ctrl+Alt+A'),
      this.createKeybindingItem('extension.uncollapseAll', 'Uncollapse Everything', 'Ctrl+Alt+U')
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
  vscode.window.registerTreeDataProvider('exampleView', treeDataProvider);

  const foldLevelCommands = [
    { command: 'extension.foldLevel1', foldCommand: 'editor.foldLevel1', title: 'Fold Level 1' },
    { command: 'extension.foldLevel2', foldCommand: 'editor.foldLevel2', title: 'Fold Level 2' },
    { command: 'extension.foldLevel3', foldCommand: 'editor.foldLevel3', title: 'Fold Level 3' },
    { command: 'extension.foldLevel4', foldCommand: 'editor.foldLevel4', title: 'Fold Level 4' },
    { command: 'extension.foldLevel5', foldCommand: 'editor.foldLevel5', title: 'Fold Level 5' },
  ];

  foldLevelCommands.forEach(({ command, foldCommand }) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, () => {
        vscode.commands.executeCommand(foldCommand);
      })
    );
  });

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
    vscode.commands.registerCommand('extension.refreshKeybindings', () => {
      treeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.collapseAllFunctions', () => {
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

  // Register your command implementations here...
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.collapseFile', () => {
      vscode.window.showInformationMessage('Collapse File command executed.');
      vscode.commands.executeCommand('editor.foldAll');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.collapseAll', () => {
      vscode.window.showInformationMessage('Collapse Everything command executed.');
      vscode.commands.executeCommand('editor.foldAll');
      vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.uncollapseAll', () => {
      vscode.window.showInformationMessage('Uncollapse Everything command executed.');
      vscode.commands.executeCommand('editor.unfoldAll');
      vscode.commands.executeCommand('workbench.files.action.expandExplorerFolders');
    })
  );
}

export function deactivate() {}
