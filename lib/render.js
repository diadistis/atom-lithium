Transform = function() {
  var self = this;
  this.translate = [20,200,0];
  this.rotate = [0,45, 45];
  this.depth = 200;

  this.apply = function(box) {
    console.log('Applying 3D styles');

    box.style['perspective'] = self.depth + 'px';

    var transform = '';
    if(self.rotate[0])
      transform += 'rotateX('+self.rotate[0]+'deg) ';
    if(self.rotate[1])
      transform += 'rotateY('+self.rotate[1]+'deg) ';
    if(self.rotate[2])
      transform += 'rotateZ('+self.rotate[2]+'deg) ';

    if(self.translate[0])
      transform += 'translateX('+self.translate[0]+'px) ';
    if(self.translate[1])
      transform += 'translateY('+self.translate[1]+'px) ';
    if(self.translate[2])
      transform += 'translateZ('+self.translate[2]+'px) ';

    transform = transform.trim();

    box.style['transform'] = transform;
  };
};

Transform.reset = function(box) {
  box.style['perspective'] = '';
  box.style['transform'] = 'none';
};

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
