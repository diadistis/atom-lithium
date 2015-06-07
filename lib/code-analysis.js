var esrefactor = require('esrefactor');
var estraverse = require('estraverse');
var esprima = require('esprima');
var esquery = require('esquery');
var escope = require('escope');
var Promise = require('bluebird');
var CodeAnalysis, Directory;

Directory = require('atom').Directory;

module.exports = CodeAnalysis = {
  _parserOptions: {
    loc: true,
    range: true
  },
  test: function(){
    this.getReferences(true).then(function(matches){
      console.log(matches);
    });
  },
  getReferences: function(openEditors){
    var identifier = this.getIdentifierAtCursor();
    var editors = atom.workspace.getTextEditors();
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (identifier) {
      return this.findReferences(identifier).then(function(matches){
        return Promise.map(matches, function(match) {
          for (var x = 0; x < editors.length; x++) {
            var editor = editors[x];
            if (editor.buffer.file.path === match.file.path) {
              return new Promise(function(resolve, reject){
                match.editor = editor;
                resolve(editor);
              });
            }
          }
          return atom.workspace.open(match.file.path).then(function(textEditor) {
            match.editor = textEditor;
          });
        }).then(function(){
          return atom.workspace.open(activeTextEditor.buffer.file.path).then(function(){
            return matches;
          });
        });
      });
    } else {
      return Promise.resolve();
    }
  },
  getIdentifierAtCursor: function(){
    var editor = atom.workspace.getActiveTextEditor();
    var cursorPosition = editor.getCursorBufferPosition();
    var cursorCharacterIndex = editor.buffer.characterIndexForPosition(cursorPosition);
    var syntax = esprima.parse(editor.buffer.getText(), this._parserOptions);
    var scopeManager = escope.analyze(syntax);
    var selectorAst = esquery.parse("[type='Identifier']");
    var matches = esquery.match(syntax, selectorAst);

    for (var x = 0; x < matches.length; x++) {
      var match = matches[x];
      if (match.range[0] < cursorCharacterIndex && match.range[1] > cursorCharacterIndex) {
        return match.name;
      }
    }
  },
  findReferences: function(identifier) {
    var sourceFiles = this.getSourceFiles();
    var references = [];
    var _this = this;

    return new Promise(function(resolve, reject) {
      Promise.map(sourceFiles, function(sourceFile){
        if ( sourceFile.path.indexOf("node_modules") >= 0 ) {
           return;
        }

        return sourceFile.read().then(function(code) {
          var ast = esprima.parse(code, _this._parserOptions);
          var selectorAst = esquery.parse("[name='" + identifier + "'][type='Identifier']");
          var matches = esquery.match(ast, selectorAst);
          if (matches.length > 0) {
            references.push({file: sourceFile, nodes: matches});
          }
        });

      }).then(function(){
        resolve(references);
      });
    });
  },
  monitor: function(){
    var directories = atom.project.getDirectories();

    for(var x = 0; x < directories.length; x++) {
      var directory = directories[x];
      directory.onDidChange(function() {
        //console.log("[directory changed]", directory);
      });
    }

    atom.workspace.observeTextEditors(function(editor){
      // editor created
      editor.onDidChange(function(){
        // editor code changed
      });
      editor.onDidDestroy(function(){
        // editor closed
      });
    });
  },
  getSourceFiles: function(directory) {
    if (!directory)
      return this.getSourceFiles(atom.project.getDirectories()[0]);

    var entries = directory.getEntriesSync();
    var codeFiles = [];
    for (var x = 0; x < entries.length; x++) {
      var entry = entries[x];
      if (entry.isDirectory()) {
        codeFiles = codeFiles.concat(this.getSourceFiles(entry));
      } else {
        if (entry.path.indexOf(".js") === (entry.path.length - 3)) {
          codeFiles.push(entry);
        }
      }
    }
    return codeFiles;
  },
  getActiveScopes: function() {
    var editor = atom.workspace.getActiveTextEditor();
    var cursorPosition = editor.getCursorBufferPosition();
    var cursorCharacterIndex = editor.buffer.characterIndexForPosition(cursorPosition);
    var syntax = esprima.parse(editor.buffer.getText(), this._parserOptions);
    var scopeManager = escope.analyze(syntax);
    var activeScopes = [];
    for(var x = 0; x < scopeManager.scopes.length; x++) {
      var scope = scopeManager.scopes[x];
      if (scope.block.range[0] < cursorCharacterIndex && scope.block.range[1] > cursorCharacterIndex) {
        activeScopes.push(scope);
      }
    }

    return activeScopes;
  }
};
