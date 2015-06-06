var AtomLithium, CompositeDisposable;

var LithiumLayout = require('./layout');

CompositeDisposable = require('atom').CompositeDisposable;
CodeAnalysis = require('./code-analysis');
MyoModule = require('./myo-module');

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
      },
      'atom-lithium:cancel': function() {
        return _this.cancel();
      },
      'atom-lithium:select': function() {
        return _this.select();
      },
      'atom-lithium:myo': function() {
        return _this.myo();
      }
    }));
  },
  deactivate: function() {
    return this.subscriptions.dispose();
  },
  serialize: function() {
    return { };
  },
  cancel: function() {
    LithiumLayout.activateController(null);
  },
  select: function() {
    LithiumLayout.select();
  },
  showReferrences: function() {
    LithiumLayout.activateController('showRefs');
  },
  browseReferrences: function() {
    LithiumLayout.activateController('browseRefs');
  },
  parse: function() {
    CodeAnalysis.test();
  },
  myo: function() {
    MyoModule.test();
  }
};
