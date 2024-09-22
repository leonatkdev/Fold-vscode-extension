import * as vscode from "vscode";
import * as path from "path";

const createCommandTreeItem = (
  label: string,
  description: string,
  commandId: string,
  iconName: string | undefined,
  collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
): vscode.TreeItem => {
  const item = new vscode.TreeItem(label, collapsibleState);
  item.description = description;
  
  // Only set the iconPath if an icon is provided
  if (iconName) {
    const iconPath = vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', iconName));
    item.iconPath = iconPath;
  }

  // Set the command if provided
  if (commandId) {
    item.command = {
      command: "FoldVSC.handleCommand",
      title: label,
      arguments: [commandId]
    };
  }
  
  return item;
};
// Data Provider
const createTreeDataProvider = () => {
  const onDidChangeTreeData = new vscode.EventEmitter<void>();

  const refresh = () => onDidChangeTreeData.fire();

  const getTreeItem = (element: vscode.TreeItem) => element;

  const getChildren = (element?: vscode.TreeItem) => {
    if (!element) {
      return getRootItems();
    } 
    else if (element.label === "Fold Functionality") {
      return getCommandDescriptionItems();
    }
    return [];
  };

  return {
    onDidChangeTreeData: onDidChangeTreeData.event,
    refresh,
    getTreeItem,
    getChildren,
  };
};

// Root items for the tree
const getRootItems = () => [
  createCommandTreeItem(
    "Fold Functionality",
    "",
    "",
    undefined,
    vscode.TreeItemCollapsibleState.Expanded
  ),
];

// Command items
const getCommandDescriptionItems = () => [

  createCommandTreeItem(
    "Fold File",
    "Fold all sections in the current file ( CTRL+K + J )",
    "FoldVSC.foldFile",
    "file.svg"
  ),
  createCommandTreeItem(
    "Fold Folders",
    "Fold folders ( CTRL+K + C )",
    "FoldVSC.foldFolder",
    "folder.svg"
  ),
  createCommandTreeItem(
    "Unfold File",
    "Unfold all regions in the current file ( CTRL+K + U )",
    "FoldVSC.unfoldFile",
    "unfold.svg"
  ),
  createCommandTreeItem("---------------------------", "", "", ""),

  createCommandTreeItem(
    "Fold Functions",
    "Fold all functions in the current file ( CTRL+K + B )",
    "FoldVSC.foldFunctions",
    "functions.svg"
  ),

  // Selective Fold/Unfold Commands
  createCommandTreeItem(
    "Fold All Except Selected",
    "Fold all sections except the selected one ( CTRL+K + CTRL+F )",
    "FoldVSC.foldAllExceptSelectedFunc",
    "selected.svg"
  ),
  createCommandTreeItem(
    "Unfold All Except Selected",
    "Unfold all sections except the selected one ( CTRL+K + CTRL+U )",
    "FoldVSC.unfoldAllExceptSelectedFunc",
    "selected.svg"
  ),

  createCommandTreeItem("---------------------------", "", "", ""),

  // Specific Level Folding Commands
  createCommandTreeItem(
    "Fold Level 1",
    "Fold to level 1 ( CTRL+K + 1 )",
    "FoldVSC.foldLevel1",
    "numberOne.svg"
  ),
  createCommandTreeItem(
    "Fold Level 2",
    "Fold to level 2 ( CTRL+K + 2 )",
    "FoldVSC.foldLevel2",
    "numberTwo.svg"
  ),
  createCommandTreeItem(
    "Fold Level 3",
    "Fold to level 3 ( CTRL+K + 3 )",
    "FoldVSC.foldLevel3",
    "numberThree.svg"
  ),
  createCommandTreeItem(
    "Fold Level 4",
    "Fold to level 4 ( CTRL+K + 4 )",
    "FoldVSC.foldLevel4",
    "numberFour.svg"
  ),
  createCommandTreeItem(
    "Fold Level 5",
    "Fold to level 5 ( CTRL+K + 5 )",
    "FoldVSC.foldLevel5",
    "numberFive.svg"
  ),
  createCommandTreeItem("---------------------------", "", "", ""),
  
  createCommandTreeItem(
    "All Commands",
    "CTRL+K + H",
    "FoldVSC.showCommands",
    "help.svg"
  ),
];  

// Activate function for extension
export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = createTreeDataProvider();
  vscode.window.registerTreeDataProvider("foldView", treeDataProvider);

  const commands = [
    {
      id: "FoldVSC.foldFile",
      handler: () => vscode.commands.executeCommand("editor.foldAll"),
    },
    {
      id: "FoldVSC.foldFolder",
      handler: () =>
        vscode.commands.executeCommand(
          "workbench.files.action.collapseExplorerFolders"
        ),
    },
    {
      id: "FoldVSC.unfoldFile",
      handler: () => vscode.commands.executeCommand("editor.unfoldAll"),
    },
    {
      id: "FoldVSC.foldAllExceptSelectedFunc",
      handler: () => vscode.commands.executeCommand("editor.foldAllExcept"),
    },
    {
      id: "FoldVSC.unfoldAllExceptSelectedFunc",
      handler: () => vscode.commands.executeCommand("editor.unfoldAllExcept"),
    },
    {
      id: "FoldVSC.foldLevel1",
      handler: () => vscode.commands.executeCommand("editor.foldLevel1"),
    },
    {
      id: "FoldVSC.foldLevel2",
      handler: () => vscode.commands.executeCommand("editor.foldLevel2"),
    },
    {
      id: "FoldVSC.foldLevel3",
      handler: () => vscode.commands.executeCommand("editor.foldLevel3"),
    },
    {
      id: "FoldVSC.foldLevel4",
      handler: () => vscode.commands.executeCommand("editor.foldLevel4"),
    },
    {
      id: "FoldVSC.foldLevel5",
      handler: () => vscode.commands.executeCommand("editor.foldLevel5"),
    },  
  ];

  commands.forEach(({ id, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  });



  context.subscriptions.push(
    vscode.commands.registerCommand("FoldVSC.foldFunctions", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { document } = editor;
        const functionRegex =
          /function\s+[a-zA-Z_$][0-9a-zA-Z_$]*\s*\(.*?\)\s*{/g;
        let match;
        while ((match = functionRegex.exec(document.getText())) !== null) {
          const start = document.positionAt(match.index);
          const end = new vscode.Position(start.line, start.character);
          editor.selection = new vscode.Selection(start, end);
          vscode.commands.executeCommand("editor.fold");
        }
      }
    })
  );


  context.subscriptions.push(
    vscode.commands.registerCommand("FoldVSC.showCommands", async () => {
      // Define the custom interface
      interface CommandQuickPickItem extends vscode.QuickPickItem {
        command: string;
      }
  
      // Update your options array
      const options: CommandQuickPickItem[] = [
        {
          label: "Fold File",
          description: "Fold all sections in the current file.",
          command: "FoldVSC.foldFile"
        },
        {
          label: "Fold Folders",
          description: "Fold all foldable regions and folders.",
          command: "FoldVSC.foldFolder"
        },
        {
          label: "Unfold File",
          description: "Unfold all regions in the current file.",
          command: "FoldVSC.unfoldFile"
        },
        {
          label: "Fold Functions",
          description: "Fold all functions in the current file.",
          command: "FoldVSC.foldFunctions"
        },
        {
          label: "Fold All Except Selected",
          description: "Fold all sections except the selected one.",
          command: "FoldVSC.foldAllExceptSelectedFunc"
        },
        {
          label: "Unfold All Except Selected",
          description: "Unfold all sections except the selected one.",
          command: "FoldVSC.unfoldAllExceptSelectedFunc"
        },
        {
          label: "Fold Level 1",
          description: "Fold to level 1.",
          command: "FoldVSC.foldLevel1"
        },
        {
          label: "Fold Level 2",
          description: "Fold to level 2.",
          command: "FoldVSC.foldLevel2"
        },
        {
          label: "Fold Level 3",
          description: "Fold to level 3.",
          command: "FoldVSC.foldLevel3"
        },
        {
          label: "Fold Level 4",
          description: "Fold to level 4.",
          command: "FoldVSC.foldLevel4"
        },
        {
          label: "Fold Level 5",
          description: "Fold to level 5.",
          command: "FoldVSC.foldLevel5"
        },
      ];
  
      // Show the Quick Pick menu
      const selection = await vscode.window.showQuickPick(options, {
        placeHolder: "Select a folding command"
      });
  
      // Execute the selected command
      if (selection) {
        vscode.commands.executeCommand(selection.command);
      }
    })
  );



  context.subscriptions.push(
    vscode.commands.registerCommand(
      "FoldVSC.handleCommand",
      (commandId: string) => {
        vscode.commands.executeCommand(commandId);
      }
    )
  );
}

export function deactivate() {}
