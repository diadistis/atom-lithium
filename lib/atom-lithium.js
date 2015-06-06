var AtomLithium, CompositeDisposable;

Renderer = require('./render');

CompositeDisposable = require('atom').CompositeDisposable;
CodeAnalysis = require('./code-analysis');

module.exports = AtomLithium = {
  subscriptions: null,
  activate: function(state) {
    var _this = this;
    this.subscriptions = new CompositeDisposable;

    Renderer.setup();

    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-lithium:parse': function() {
        return _this.parse();
      },
      'atom-lithium:toggle': function() {
        return _this.toggle();
      }
    }));
  },
  deactivate: function() {
    return this.subscriptions.dispose();
  },
  serialize: function() {
    return { };
  },
  toggle: function() {
    console.log('AtomLithium was toggled!');
    Renderer.toggle();
  },
  parse: function() {
    CodeAnalysis.test();
  }
};
