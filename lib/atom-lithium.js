var AtomLithium, CompositeDisposable;

Renderer = require('./render');

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = AtomLithium = {
  subscriptions: null,
  activate: function(state) {
    var _this = this;
    this.subscriptions = new CompositeDisposable;

    Renderer.setup();

    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-lithium:parse': function() {
        return _this.parse();
      }
    }));
  },
  deactivate: function() {
    return this.subscriptions.dispose();
  },
  serialize: function() {
    return {
      atomLithiumViewState: this.atomLithiumView.serialize()
    };
  },
  toggle: function() {
    console.log('AtomLithium was toggled!');
    Renderer.toggle();
    if (this.modalPanel.isVisible()) {
//      return this.modalPanel.hide();
    } else {
//      return this.modalPanel.show();
    }
  },
  parse: function() {
    console.log('parse: called');
  }
};
