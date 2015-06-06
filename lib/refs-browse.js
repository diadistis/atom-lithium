
var Controller = function(Layout) {
  var self = this;

  this.state = null;

  this.activate = function() {
    if(!self.state)
      self._initializeState();
    else
      self._advanceState();
  };

  this.deactivate = function() {
    self.state = null;
  };

  this._initializeState = function() {
    self.state = {
      editors: [],
      current: 0
    };

    atom.workspace.getTextEditors().forEach(function(editor) {
      var id = Layout.getRenderer().addEditor(atom.views.getView(editor));
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();
      self.state.editors.push(transform);
    });

    Layout.getRenderer().enable();
  };

  this._advanceState = function() {
    var previousTransform = self.state.editors[self.state.editors.length-1];
    for(var i = 0; i < self.state.editors.length; ++i) {
      var tmp = self.state.editors[i];
      self.state.editors[i] = previousTransform;
      previousTransform = tmp;
    }
    Layout.getRenderer().refresh();
  };
};

module.exports.Controller = Controller;
