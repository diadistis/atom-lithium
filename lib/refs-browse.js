var Transform = require('./transform');

var Controller = function(Layout) {
  var self = this;

  this.state = null;
  this.decorations = [];

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
    self.decorations.forEach(function(d){d.destroy();});
    self.decorations = [];
    Layout.getRenderer().disable();
  };

  this._initializeState = function() {
    var editors = atom.workspace.getTextEditors();
    if(editors.length == 0) {
      return;
    }

    console.log('Initializing browser state');
    self.state = {
      editors: []
    };

    Layout.ensureEditorsAreBuilt();

    var pane = editors[0];
    var width = pane.getWidth();
    var height = pane.getHeight();
    var scale = .9;
    var Dx = Math.floor(scale * (width / 2) * (1 - Math.cos(30)));
    var Dy = Math.floor(scale * (height / 4) * Math.cos(10));

    editors.forEach(function(editor, index) {
      var id = Layout.getRenderer().addEditor(atom.views.getView(editor));
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();

      transform.rotate = [ -10, 30, 0 ];
      transform.translate = [
        Dx - index * Dx / editors.length,
        -Dy + 1.2 * index * Dy / editors.length,
        -index * 200 ];
      transform.depth = 600;
      transform.scale = scale;
      transform.opacity = Math.min(1, Math.max(.5, 1.2 * (editors.length - index) / editors.length));
      transform.zIndex = 10 * (editors.length - index);

      var lines = editor.getLineCount();
      var from = Math.floor(lines / 3);
      var to = 2 * from;

      var mark = editor.markBufferRange([[from, 0], [to, 0]], {persistent:false});
      self.decorations.push(editor.decorateMarker(mark, { type: 'line', class: 'highlight-refs' }));

      editor.scrollToBottom();
      editor.scrollToBufferPosition([Math.floor((from+to)/2),0], {center:true});

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
