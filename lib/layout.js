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
      Renderer.disable();
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

  this.select = function() {
    if(self.activeController)
      self.activeController.select();
  };

  this.ensureEditorsAreBuilt = function() {
    var pane = atom.workspace.getPanes()[0];
    var count = pane.getItems().length;
    for(var i = 0; i < count; ++i)
      pane.activateNextItem();
  };
};

module.exports = new Layout();
