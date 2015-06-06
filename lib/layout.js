var Renderer = require('./render');

var Layout = function() {
  var self = this;

  this.activeController = null;
  this.controllers = {
    
  };

  this.modeFull3D = false;
  this.modeBackground = false;

  this.setup = function() {
    Renderer.setup();
  };

  this.cycleModes = function() {
    if(!self.modeFull3D) {
      self.setModeFull3D();
    } else {
      self.setModeBackground();
    }
  };

  this.setModeClear = function() {
    if(self.modeFull3D)
      self._exitFull3D();
    if(self.modeBackground)
      self._exitBackground();
  };

  this.setModeFull3D = function() {
    if(self.modeFull3D)
      return;
    if(self.modeBackground)
      self._exitBackground();
    self._enterFull3D();
  };

  this.setModeBackground = function() {
    if(self.modeBackground)
      return;
    if(self.modeFull3D)
      self._exitFull3D();
    self._enterBackground();
  };

  this._enterFull3D = function() {
    Renderer.clearEditors();

    // build all panes
    var pane = atom.workspace.getPanes()[0];
    var count = pane.getItems().length;
    for(var i = 0; i < count; ++i)
      pane.activateNextItem();

    atom.workspace.getTextEditors().forEach(function(editor) {
      var id = Renderer.addEditor(atom.views.getView(editor));
      var transform = Renderer.getTransform(id);
      transform.reset();
      transform.translate = [ Math.floor(Math.random() * 150 - 200), Math.floor(Math.random() * 150 - 200), 0];
      transform.rotate = [ 0, Math.floor(Math.random() * 60), 0];
      transform.scale = .3 + .2 * Math.random();
      transform.depth = 1500;
    });

    Renderer.enable();
    self.modeFull3D = true;
  };

  this._exitFull3D = function() {

    Renderer.disable();
    self.modeFull3D = false;
  };

  this._enterBackground = function() {

    self.modeBackground = true;
  };

  this._exitBackground = function() {

    self.modeBackground = false;
  };
};

module.exports = new Layout();
