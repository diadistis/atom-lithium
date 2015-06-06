var AtomLithium, CompositeDisposable;

var LithiumLayout = require('./layout');

CompositeDisposable = require('atom').CompositeDisposable;
CodeAnalysis = require('./code-analysis');

module.exports = AtomLithium = {
  subscriptions: null,
  activate: function(state) {
    var _this = this;
    this.subscriptions = new CompositeDisposable;

    LithiumLayout.setup();

    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-lithium:parse': function() {
        return _this.parse();
      },
      'atom-lithium:showReferrences': function() {
        return _this.showReferrences();
      },
      'atom-lithium:browseReferrences': function() {
        return _this.browseReferrences();
      }
    }));
  },
  deactivate: function() {
    return this.subscriptions.dispose();
  },
  serialize: function() {
    return { };
  },
  showReferrences: function() {
    LithiumLayout.activateController('showRefs');
  },
  browseReferrences: function() {
    LithiumLayout.activateController('browseRefs');
  },
  parse: function() {
    CodeAnalysis.test();
  }
};
