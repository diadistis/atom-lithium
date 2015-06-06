var CodeAnalysis, Directory;

Directory = require('atom').Directory;

module.exports = CodeAnalysis = {
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
    console.log(this.getSourceFiles());
  }
};
