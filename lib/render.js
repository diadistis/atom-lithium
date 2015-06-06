var Transform = require('./transform');

var Renderer = function() {
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

    if(self.enabled)
      self.enable();
    else
      self.disable();
  };

  this.enable = function() {
    self._refreshState();
    console.log('Enabling 3D View (',Object.keys(self.editors).length,' editors)');

    self._setPanelTabsVisibility(false);
    self.underlayer.style.opacity = '0.4';

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];
      editor.tranform.apply(editor.element);

      editor.cache = {
        opacity: editor.element.style['opacity'],
        display: editor.element.style['display'],
        ptrEvents: editor.element.style['pointer-events'],
        zIndex: editor.element.style['zIndex']
      };

      self._getEditorUnderlayer(editor.element).style['opacity'] = self.config.EditorBackgroundOpacity;
      editor.element.style['opacity'] = self.config.EditorOpacity;
      editor.element.style.display = 'block';
      editor.element.style['z-index'] = editor.zIndex;
      if(!editor.originallyFocused)
        editor.element.style['pointer-events'] = 'none';
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
      editor.element.style['opacity'] = editor.cache.opacity;
      editor.element.style['display'] = editor.cache.display;
      editor.element.style['pointer-events'] = editor.cache.ptrEvents;
      editor.element.style['zIndex'] = editor.cache.zIndex;
    });

    self.editors = {};
  };

  this.addEditor = function(editor, zIndex) {
    var id = self._newId();

    console.log('Adding[',id,']');

    self.editors[id] = {
      element: editor,
      focused: function() {
        return editor.className.indexOf('is-focused') >= 0;
      },
      zIndex: zIndex || 0,
      cache: {
      },
      tranform: new Transform()
    };
    return id;
  };

  this.removeEditor = function(id) {
    console.log('Removing[',id,']');
    delete self.editors[id];
  };

  this.clearEditors = function() {
    self.editors = {};
  };

  this.getTransform = function(id) {
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
