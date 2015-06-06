var Renderer = require('./render');
var BrowseRefsCtrl = require('./refs-browse').Controller;
var ShowRefsCtrl = require('./refs-show').Controller;

var Layout = function() {
  var self = this;

  this.activeController = null;
  this.controllers = {
    browseRefs: new BrowseRefsCtrl(self),
    showRefs: new ShowRefsCtrl(self)
  };

  this.setup = function() {
    Renderer.setup();
  };

  this.getRenderer = function() {
    return Renderer;
  };

  this.activateController = function(name) {
    if(self.activeController&&self.activeController.name!==name) {
      console.log('Deactivating controller: ', self.activeController.name);
      self.activeController.deactivate();
      self.activeController = null;
    }

    if(name) {
      console.log('Activating controller: ', name);
      self.activeController = self.controllers[name];
      self.activeController.name = name;
      self.activeController.activate();
    } else {
      self.activeController = null;
    }
  };

  this.ensureEditorsAreBuilt = function() {
    var pane = atom.workspace.getPanes()[0];
    var count = pane.getItems().length;
    for(var i = 0; i < count; ++i)
      pane.activateNextItem();
  };

  this._enterFull3D = function() {
    Renderer.clearEditors();

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
  };

  this._exitFull3D = function() {

    Renderer.disable();
  };
};

module.exports = new Layout();
