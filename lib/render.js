var Transform = require('./transform');

Renderer = function() {
  var self = this;

  this.boxes = {};
  this.enabled = false;

  this.setup = function() {
    console.log('Renderer::Setup');
  };

  this.toggle = function() {
    self.enabled = !self.enabled;
    if(self.enabled)
      self.enable();
    else
      self.disable();
  };

  this.enable = function() {
    console.log('Enabling 3D View');

    self._setPanelTabsVisibility(false);

    var editor = atom.workspace.getActiveTextEditor();
    var editorView = atom.views.getView(editor);
    self.addBox(editorView);

    Object.keys(self.boxes).forEach(function(id) {
      var box = self.boxes[id];
      box.tranform.apply(box.box);
    });
  };

  this.disable = function() {
    console.log('Disabling 3D View');

    self._setPanelTabsVisibility(true);

    Object.keys(self.boxes).forEach(function(id) {
      var box = self.boxes[id];
      Transform.reset(box.box);
    });

    self.boxes = {};
  };

  this.addBox = function(box) {
    var id = self._newId();

    console.log('Adding[',id,']');

    self.boxes[id] = {
      box: box,
      tranform: new Transform()
    }
    return id;
  };

  this.removeBox = function(id) {
    console.log('Removing[',id,']');
    delete self.boxes[id];
  };

  this.getBoxTransform = function(id) {
    return self.boxes[id].tranform;
  };

  this._newId = function() {
    return (''+Math.random()).substr(2);
  }

  this._getPanelTabsList = function() {
    var editor = atom.workspace.getActiveTextEditor();
    var editorView = atom.views.getView(editor);
    return editorView.parentElement.parentElement.children[0];
  };

  this._setPanelTabsVisibility = function(visible) {
    self._getPanelTabsList().style.display = visible ? 'block' : 'none';
  };
};

module.exports = new Renderer();
