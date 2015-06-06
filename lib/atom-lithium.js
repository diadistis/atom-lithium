var AtomLithium, CompositeDisposable;

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = AtomLithium = {
  subscriptions: null,
  activate: function(state) {
    var _this = this;
    this.subscriptions = new CompositeDisposable;
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
  parse: function() {
    console.log('parse: called');
  }
};
