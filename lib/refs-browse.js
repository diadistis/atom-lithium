var Transform = require('./transform');

var Controller = function(Layout) {
  var self = this;

  this.state = null;

  this.activate = function() {
    console.log('Activating browser');
    if(!self.state)
      self._initializeState();
    else
      self._advanceState();
  };

  this.select = function() {
    console.log('Select() event @ browser');
    self.deactivate();
  };

  this.deactivate = function() {
    console.log('Deactivating browser');
    self.state = null;
    Layout.getRenderer().disable();
  };

  this._initializeState = function() {
    console.log('Initializing browser state');
    self.state = {
      editors: []
    };

    Layout.ensureEditorsAreBuilt();

    atom.workspace.getTextEditors().forEach(function(editor, index) {
      var id = Layout.getRenderer().addEditor(atom.views.getView(editor));
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();

      transform.rotate = [ -20, 60, 5 ];
      transform.translate = [ index * 100, index * -100, index * 250 ];
      transform.depth = 1500;
      transform.scale = .9;

      self.state.editors.push(id);
    });

    Layout.getRenderer().enable();
  };

  this._advanceState = function() {
    console.log('Advancing browser state');
    var previousTransform = new Transform();
    var tmp = new Transform();
    previousTransform.copyFrom(Layout.getRenderer().getTransform(self.state.editors[self.state.editors.length-1]));

    for(var i = 0; i < self.state.editors.length; ++i) {
      var current = Layout.getRenderer().getTransform(self.state.editors[i]);
      tmp.copyFrom(current);
      current.copyFrom(previousTransform);
      previousTransform.copyFrom(tmp);
    }
    Layout.getRenderer().refresh();
  };
};

module.exports.Controller = Controller;
