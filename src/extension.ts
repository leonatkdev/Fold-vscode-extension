import * as vscode from "vscode";
import * as path from "path";

const createCommandTreeItem = (
  label: string,
  description: string,
  commandId: string,
  iconName: string,
  collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
  isKeybindingItem: boolean = false
): vscode.TreeItem => {
  const iconPath = vscode.Uri.file(
    path.join(__filename, "..", "..", "resources", "light", iconName)
  );
  const item = new vscode.TreeItem(label, collapsibleState);
  item.description = description;
  item.iconPath = iconPath;
  if (commandId) {
    item.command = {
      command: commandId, // Make sure this matches the command registered in `activate`
      title: label,
      arguments: [commandId, isKeybindingItem], // Passing arguments if needed
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
    } else if (element.label === "Lorem Ipsum Generator Paragraf") {
      return getKeybindingItemsLoremIpsumParagraf();
    } else if (element.label === "Lorem Ipsum Generator Word") {
      return getKeybindingItemsLoremIpsumWord();
    } else if (element.label === "Bonus") {
      return getKeybindingItemsBonus();
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
  // ...getCommandDescriptionItems(),
  createCommandTreeItem(
    "Fold Functionality",
    "",
    "",
    "",
    vscode.TreeItemCollapsibleState.Expanded
  ),
  createCommandTreeItem(
    "Lorem Ipsum Generator Paragraf",
    "",
    "",
    "",
    vscode.TreeItemCollapsibleState.Expanded
  ),
  createCommandTreeItem(
    "Lorem Ipsum Generator Word",
    "",
    "",
    "",
    vscode.TreeItemCollapsibleState.Expanded
  ),
  createCommandTreeItem(
    "Bonus",
    "",
    "",
    "",
    vscode.TreeItemCollapsibleState.Expanded
  ),
];

// Command items
const getCommandDescriptionItems = () => [
  createCommandTreeItem(
    "Fold Functions",
    "Fold all functions in the current file.",
    "autofold.foldFunctions",
    "functions.svg"
  ),
  createCommandTreeItem(
    "Fold File",
    "Fold all sections in the current file.",
    "autofold.foldFile",
    "file.svg"
  ),
  createCommandTreeItem(
    "Fold Folders",
    "Fold all foldable regions and folders.",
    "autofold.foldFolder",
    "folder.svg"
  ),
  createCommandTreeItem(
    "Unfold File",
    "Unfold all regions in the current file.",
    "autofold.unfoldFile",
    "unfold.svg"
  ),
  createCommandTreeItem("---------------------------", "", "", ""),

  // Selective Fold/Unfold Commands
  createCommandTreeItem(
    "Fold All Except Selected",
    "Fold all sections except the selected one.",
    "autofold.foldAllExceptSelectedFunc",
    "selected.svg"
  ),
  createCommandTreeItem(
    "Unfold All Except Selected",
    "Unfold all sections except the selected one.",
    "autofold.unfoldAllExceptSelectedFunc",
    "selected.svg"
  ),

  createCommandTreeItem("---------------------------", "", "", ""),

  // Specific Level Folding Commands
  createCommandTreeItem(
    "Fold Level 1",
    "Fold to level 1, typically collapsing the most outer structures like classes or namespaces.",
    "autofold.foldLevel1",
    "numberOne.svg"
  ),
  createCommandTreeItem(
    "Fold Level 2",
    "Fold to level 2, usually collapsing function definitions or inner classes.",
    "autofold.foldLevel2",
    "numberTwo.svg"
  ),
  createCommandTreeItem(
    "Fold Level 3",
    "Fold to level 3, collapsing detailed blocks like loops or conditionals.",
    "autofold.foldLevel3",
    "numberThree.svg"
  ),
  createCommandTreeItem(
    "Fold Level 4",
    "Fold to level 4, collapsing finer structures like nested blocks within functions.",
    "autofold.foldLevel4",
    "numberFour.svg"
  ),
  createCommandTreeItem(
    "Fold Level 5",
    "Fold to level 5, collapsing the smallest detail levels, such as inline comments or small code blocks.",
    "autofold.foldLevel5",
    "numberFive.svg"
  ),
  createCommandTreeItem("---------------------------", "", "", ""),
];

// Lorem Ipsum paragraph items
const getKeybindingItemsLoremIpsumParagraf = () => [
  createCommandTreeItem(
    "Lorem-p-1",
    "Generate 1 Paragraph of Lorem Ipsum",
    "autofold.loremIpsumParagraph1",
    "paragraf.svg"
  ),
  createCommandTreeItem(
    "Lorem-p-2",
    "Generate 2 Paragraphs of Lorem Ipsum",
    "autofold.loremIpsumParagraph2",
    "paragraf.svg"
  ),
  createCommandTreeItem(
    "Lorem-p-3",
    "Generate 3 Paragraphs of Lorem Ipsum",
    "autofold.loremIpsumParagraph3",
    "paragraf.svg"
  ),
];

// Lorem Ipsum word items for the sidebar
const getKeybindingItemsLoremIpsumWord = () => [
  createCommandTreeItem(
    "Lorem-w-1",
    "Generate 10 Words of Lorem Ipsum",
    "autofold.loremIpsumWord10", // Directly call the command that inserts 10 words
    "word.svg"
  ),
  createCommandTreeItem(
    "Lorem-w-2",
    "Generate 20 Words of Lorem Ipsum",
    "autofold.loremIpsumWord20", // Directly call the command that inserts 20 words
    "word.svg"
  ),
  createCommandTreeItem(
    "Lorem-w-3",
    "Generate 30 Words of Lorem Ipsum",
    "autofold.loremIpsumWord30", // Directly call the command that inserts 30 words
    "word.svg"
  ),
];


// Bonus command items
const getKeybindingItemsBonus = () => [
  createCommandTreeItem(
    "Single Quote",
    "Format to Single Quote",
    "autofold.singleQuote",
    "noDouble.svg"
  ),
  createCommandTreeItem(
    "Double Quote",
    "Format to Double Quote",
    "autofold.doubleQuote",
    "doubleQoute.svg"
  ),
];

const replaceQuotes = (
  document: vscode.TextDocument,
  editor: vscode.TextEditor,
  targetQuote: '"' | "'"
) => {
  const singleQuoteRegex = /'/g;
  const doubleQuoteRegex = /"/g;

  const edit = new vscode.WorkspaceEdit();

  try {
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const newText =
        targetQuote === '"'
          ? line.text.replace(singleQuoteRegex, '"')
          : line.text.replace(doubleQuoteRegex, "'");

      // Test if the new text would throw an error (optional)
      // Here you can implement a validation step if needed

      edit.replace(document.uri, line.range, newText);
    }

    // Apply the changes
    return vscode.workspace.applyEdit(edit);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error replacing quotes: ${error.message}`);
    // Return a rejection or false indicating the edit failed
    return Promise.resolve(false);
  }
};

// Activate function for extension
export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = createTreeDataProvider();
  vscode.window.registerTreeDataProvider("foldView", treeDataProvider);

  const commands = [
    {
      id: "autofold.foldFile",
      handler: () => vscode.commands.executeCommand("editor.foldAll"),
    },
    {
      id: "autofold.foldFolder",
      handler: () =>
        vscode.commands.executeCommand(
          "workbench.files.action.collapseExplorerFolders"
        ),
    },
    {
      id: "autofold.unfoldFile",
      handler: () => vscode.commands.executeCommand("editor.unfoldAll"),
    },
    {
      id: "autofold.foldAllExceptSelectedFunc",
      handler: () => vscode.commands.executeCommand("editor.foldAllExcept"),
    },
    {
      id: "autofold.unfoldAllExceptSelectedFunc",
      handler: () => vscode.commands.executeCommand("editor.unfoldAllExcept"),
    },
    {
      id: "autofold.foldLevel1",
      handler: () => vscode.commands.executeCommand("editor.foldLevel1"),
    },
    {
      id: "autofold.foldLevel2",
      handler: () => vscode.commands.executeCommand("editor.foldLevel2"),
    },
    {
      id: "autofold.foldLevel3",
      handler: () => vscode.commands.executeCommand("editor.foldLevel3"),
    },
    {
      id: "autofold.foldLevel4",
      handler: () => vscode.commands.executeCommand("editor.foldLevel4"),
    },
    {
      id: "autofold.foldLevel5",
      handler: () => vscode.commands.executeCommand("editor.foldLevel5"),
    },
    {
      id: "autofold.singleQuote",
      handler: () =>
        replaceQuotes(
          vscode.window.activeTextEditor?.document!,
          vscode.window.activeTextEditor!,
          "'"
        ),
    },
    {
      id: "autofold.doubleQuote",
      handler: () =>
        replaceQuotes(
          vscode.window.activeTextEditor?.document!,
          vscode.window.activeTextEditor!,
          '"'
        ),
    },
  ];

  commands.forEach(({ id, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("autofold.foldFunctions", () => {
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


  const sentences = [
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
    "Vestibulum id ligula porta felis euismod semper.",
    "Curabitur blandit tempus porttitor.",
    "Cras mattis consectetur purus sit amet fermentum.",
    "Aenean lacinia bibendum nulla sed consectetur.",
    "Nulla vitae elit libero, a pharetra augue.",
    "Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
    "Donec ullamcorper nulla non metus auctor fringilla.",
    "Morbi leo risus, porta ac consectetur ac, vestibulum at eros.",
    "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
    "Sed posuere consectetur est at lobortis.",
    "Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
    "Maecenas faucibus mollis interdum.",
    "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
    "Etiam porta sem malesuada magna mollis euismod.",
    "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
    "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
    "Et harum quidem rerum facilis est et expedita distinctio.",
    "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
    "Omnis voluptas assumenda est, omnis dolor repellendus.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
    "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  ];

  function getRandomSentence() {
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  function generateParagraphs(amount: number): string {
    let paragraphs = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ];
    for (let i = 1; i < amount; i++) {
      let paragraph = [];
      for (let j = 0; j < 5; j++) {
        // Adjust number of sentences per paragraph
        paragraph.push(getRandomSentence());
      }
      paragraphs.push(paragraph.join(" "));
    }
    return paragraphs.join(" "); // Join paragraphs with a space
  }

  function generateWords(amount: number) {
    let words =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(
        " "
      );
    while (words.length < amount) {
      words = words.concat(getRandomSentence().split(" "));
    }
    return words.slice(0, amount).join(" ");
  }
  function generateLoremIpsum(type: String, amount: number) {
    switch (type) {
      case "paragraphs":
        return generateParagraphs(amount);
      case "words":
        return generateWords(amount);
      default:
        return "";
    }
  }

  vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: '*' }, // Applies to all file types
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const completionItems: vscode.CompletionItem[] = [];
  
        // Suggest lorem-p-<number> for paragraphs
        for (let i = 1; i <= 5; i++) {
          const item = new vscode.CompletionItem(`lorem-p-${i}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Generate ${i} paragraph(s) of Lorem Ipsum`;
  
          // Set the command to insert the generated text when the suggestion is selected
          item.command = { command: `autofold.loremIpsumParagraph${i}`, title: `Insert ${i} Paragraphs` };
  
          completionItems.push(item);
        }
  
        // Suggest lorem-w-<number> for words
        const wordCounts = [10, 20, 30, 40, 50];
        wordCounts.forEach((count, index) => {
          const item = new vscode.CompletionItem(`lorem-w-${index + 1}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Generate ${count} words of Lorem Ipsum`;
  
          // Set the command to insert the generated text when the suggestion is selected
          item.command = { command: `autofold.loremIpsumWord${count}`, title: `Insert ${count} Words` };
  
          completionItems.push(item);
        });
  
        return completionItems;
      },
    },
    '-', 'p', 'w' // Trigger the completion when "lorem-p-" or "lorem-w-" is typed
  );
  
  function insertLoremIpsum(type: 'paragraphs' | 'words', amount: number) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      const line = editor.document.lineAt(position.line);
      const fullLineText = line.text;
      
      // Check if there's a "lorem-p-<number>" or "lorem-w-<number>" text
      const match = fullLineText.match(/lorem-[pw]-\d+/);
  
      const loremIpsum = generateLoremIpsum(type, amount); // Generate the Lorem Ipsum text
  
      editor.edit(editBuilder => {
        if (match) {
          const commandStartIndex = match.index || 0; // Start index of the matched command
          const commandEndIndex = commandStartIndex + match[0].length; // End index of the matched command
          const range = new vscode.Range(
            new vscode.Position(position.line, commandStartIndex),
            new vscode.Position(position.line, commandEndIndex)
          );
  
          // Replace the command text with the generated Lorem Ipsum
          editBuilder.replace(range, loremIpsum);
        } else {
          // If there's no matching command text, just insert the generated text at the cursor position
          editBuilder.insert(position, loremIpsum);
        }
      });
    }
  }


  vscode.commands.registerCommand("autofold.loremIpsumParagraph1", () => {
    insertLoremIpsum("paragraphs", 1);
  });
  vscode.commands.registerCommand("autofold.loremIpsumParagraph2", () => {
    insertLoremIpsum("paragraphs", 2);
  });
  vscode.commands.registerCommand("autofold.loremIpsumParagraph3", () => {
    insertLoremIpsum("paragraphs", 3);
  });
  vscode.commands.registerCommand("autofold.loremIpsumParagraph4", () => {
    insertLoremIpsum("paragraphs", 4);
  });
  vscode.commands.registerCommand("autofold.loremIpsumParagraph5", () => {
    insertLoremIpsum("paragraphs", 5);
  });

  vscode.commands.registerCommand("autofold.loremIpsumWord10", () => {
    insertLoremIpsum("words", 10);
  });
  vscode.commands.registerCommand("autofold.loremIpsumWord20", () => {
    insertLoremIpsum("words", 20);
  });
  vscode.commands.registerCommand("autofold.loremIpsumWord30", () => {
    insertLoremIpsum("words", 30);
  });
  vscode.commands.registerCommand("autofold.loremIpsumWord40", () => {
    insertLoremIpsum("words", 40);
  });
  vscode.commands.registerCommand("autofold.loremIpsumWord50", () => {
    insertLoremIpsum("words", 50);
  });

  vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: '*' }, // Applies to all file types
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const completionItems: vscode.CompletionItem[] = [];
  
        // Suggest lorem-p-<number> for paragraphs
        for (let i = 1; i <= 5; i++) {
          const item = new vscode.CompletionItem(`lorem-p-${i}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Generate ${i} paragraph(s) of Lorem Ipsum`;
  
          // Set the command to insert the generated text when the suggestion is selected
          item.command = { command: `autofold.loremIpsumParagraph${i}`, title: `Insert ${i} Paragraphs` };
  
          completionItems.push(item);
        }
  
        // Suggest lorem-w-<number> for words
        const wordCounts = [10, 20, 30, 40, 50];
        wordCounts.forEach((count, index) => {
          const item = new vscode.CompletionItem(`lorem-w-${index + 1}`, vscode.CompletionItemKind.Snippet);
          item.detail = `Generate ${count} words of Lorem Ipsum`;
  
          // Set the command to insert the generated text when the suggestion is selected
          item.command = { command: `autofold.loremIpsumWord${count}`, title: `Insert ${count} Words` };
  
          completionItems.push(item);
        });
  
        return completionItems;
      },
    },
    '-', 'p', 'w' // Trigger the completion when "lorem-p-" or "lorem-w-" is typed
  );


  context.subscriptions.push(
    vscode.commands.registerCommand(
      "autofold.handleCommand",
      (commandId: string) => {
        vscode.commands.executeCommand(commandId);
      }
    )
  );
}

export function deactivate() {}
