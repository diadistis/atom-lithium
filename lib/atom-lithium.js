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
    LithiumLayout.setModeBackground();

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
  showReferrences: function() {

  },
  browseReferrences: function() {

  },
  toggle: function() {
    console.log('AtomLithium was toggled!');
    LithiumLayout.cycleModes();
  },
  parse: function() {
    CodeAnalysis.test();
  }
};
