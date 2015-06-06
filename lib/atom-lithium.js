var AtomLithium, AtomLithiumView, CompositeDisposable;

AtomLithiumView = require('./atom-lithium-view');

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = AtomLithium = {
  atomLithiumView: null,
  modalPanel: null,
  subscriptions: null,
  activate: function(state) {
    var _this = this;
    this.atomLithiumView = new AtomLithiumView(state.atomLithiumViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomLithiumView.getElement(),
      visible: false
    });
    this.subscriptions = new CompositeDisposable;
    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-lithium:toggle': function() {
        return _this.toggle();
      }
    }));
  },
  deactivate: function() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    return this.atomLithiumView.destroy();
  },
  serialize: function() {
    return {
      atomLithiumViewState: this.atomLithiumView.serialize()
    };
  },
  toggle: function() {
    console.log('AtomLithium was toggled!');
    if (this.modalPanel.isVisible()) {
      return this.modalPanel.hide();
    } else {
      return this.modalPanel.show();
    }
  }
};
