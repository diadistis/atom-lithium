var Renderer = require('./render');

var Layout = function() {
  var self = this;

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

    self.modeFull3D = true;
  };

  this._exitFull3D = function() {

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
