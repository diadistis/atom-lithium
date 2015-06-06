var esrefactor = require('esrefactor');
var estraverse = require('estraverse');
var esprima = require('esprima');
var esquery = require('esquery');
var escope = require('escope');
var CodeAnalysis, Directory;

Directory = require('atom').Directory;

module.exports = CodeAnalysis = {
  _parserOptions: {
    loc: true,
    range: true
  },
  test: function(){
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
