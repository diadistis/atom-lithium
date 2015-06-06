var esrefactor = require('esrefactor');
var esprima = require('esprima');
var esquery = require('esquery');
var escope = require('escope');
var CodeAnalysis, Directory;

Directory = require('atom').Directory;

module.exports = CodeAnalysis = {
  _parserOptions: {
    loc: true,
    range: true,
    raw: true
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
  test: function() {
    console.log('CodeAnalysis.test');
    var _this = this;
    var sourceFiles = this.getSourceFiles();
    for ( var x = 0; x < sourceFiles.length; x++ ) {
      var sourceFile = sourceFiles[x];
      if ( sourceFile.path.indexOf("code-analysis.js") === -1 ) {
        continue;
      }
      try {
        sourceFile.read().then(function(code) {
          var ast = esprima.parse(code, _this._parserOptions);
          var ctx = new esrefactor.Context(code);
          var selectorAst = esquery.parse("[name='getSourceFiles'][type='Identifier']");
          var matches = esquery.match(ast, selectorAst);
          var id = ctx.identify(4);
          console.log(ast);
          console.log(ctx);
          console.log(selectorAst);
          console.log(matches);
          console.log(id);
        });
      }
      catch(err) {
        console.log('error');
        console.log(sourceFile);
        console.log(err);
      }
    }
  },
  query: function() {
    var sourceFiles = this.getSourceFiles();
    for ( var x = 0; x < sourceFiles.length; x++ ) {
      var sourceFile = sourceFiles[x];
      if ( sourceFile.path.indexOf("code-analysis.js") === -1 ) {
        continue;
      }
      try {
        sourceFile.read().then(function(code) {
          var ast = esprima.parse(code);
          var selectorAst = esquery.parse("[name='getSourceFiles'][type='Identifier']");
          var matches = esquery.match(ast, selectorAst);
          console.log(ast);
          console.log(selectorAst);
          console.log(matches);
        });
      }
      catch(err) {
        console.log('error');
        console.log(sourceFile);
        console.log(err);
      }
    }
  }
};
