var Transform = require('./transform');

Renderer = function() {
  var self = this;

  this.config = {
    EditorBackgroundOpacity: 0.4,
    EditorOpacity: 0.8
  };

  this.editors = {};
  this.enabled = false;
  this.editor = null;
  this.editorView = null;
  this.underlayer = null;

  this.setup = function() {
    console.log('Renderer::Setup');
  };

  this.toggle = function() {
    self.enabled = !self.enabled;
    self._refreshState();

    if(self.enabled)
      self.enable();
    else
      self.disable();
  };

  this.enable = function() {
    console.log('Enabling 3D View');

    self._setPanelTabsVisibility(false);
    self.underlayer.style.opacity = '0.4';

    self.addEditor(self.editorView);

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];
      editor.tranform.apply(editor.element);
      self._getEditorUnderlayer(editor.element).style['opacity'] = self.config.EditorBackgroundOpacity;
      editor.element.style['opacity'] = self.config.EditorOpacity;
    });
  };

  this.disable = function() {
    console.log('Disabling 3D View');

    self._setPanelTabsVisibility(true);
    self.underlayer.style.opacity = '1.0';

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];
      Transform.reset(editor.element);
      self._getEditorUnderlayer(editor.element).style['opacity'] = 1;
      editor.element.style['opacity'] = 1;
    });

    self.editors = {};
  };

  this.addEditor = function(editor) {
    var id = self._newId();

    console.log('Adding[',id,']');

    self.editors[id] = {
      element: editor,
      focused: function() {
        return editor.className.indexOf('is-focused') >= 0;
      },
      tranform: new Transform()
    }
    return id;
  };

  this.removeEditor = function(id) {
    console.log('Removing[',id,']');
    delete self.editors[id];
  };

  this.getBoxTransform = function(id) {
    return self.editors[id].tranform;
  };

  this._newId = function() {
    return (''+Math.random()).substr(2);
  };

  this._refreshState = function() {
    self.editor = atom.workspace.getActiveTextEditor();
    self.editorView = atom.views.getView(self.editor);
    self.underlayer = self._getEditorUnderlayer(self.editorView);
  };

  this._getEditorUnderlayer = function(editorView) {
    for(var i = 0; i < editorView.childNodes.length; ++i)
      if(editorView.childNodes[i].className == 'underlayer') {
        return editorView.childNodes[i];
      }
  };

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
