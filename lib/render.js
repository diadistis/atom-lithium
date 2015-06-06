var Transform = require('./transform');

var CachedAttributes = [ 'opacity', 'display', 'pointer-events', 'z-index' ];

var Renderer = function() {
  var self = this;
/*
  this.config = {
    EditorBackgroundOpacity: 0.6,
    EditorOpacity: 0.8
  };
*/
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

  this.refresh = function() {
    self.enable(true);
  };

  this.enable = function(refreshMode) {
    self._refreshState();
    console.log('Enabling 3D View (',Object.keys(self.editors).length,' editors)');

    if(!refreshMode)
      self._setPanelTabsVisibility(false);

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];

      if(!refreshMode) {
        editor.cache = self._buildAttributeCache(editor.element);
        // self._getEditorUnderlayer(editor.element).style['opacity'] = self.config.EditorBackgroundOpacity;
        // editor.element.style['opacity'] = self.config.EditorOpacity;
        editor.element.style.display = 'block';
        if(!editor.originallyFocused)
          editor.element.style['pointer-events'] = 'none';
      }

      editor.transform.apply(editor.element);
    });
  };

  this.disable = function() {
    console.log('Disabling 3D View');

    self._setPanelTabsVisibility(true);
    self.underlayer.style.opacity = 1;

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];
      Transform.resetBox(editor.element);
      // self._getEditorUnderlayer(editor.element).style['opacity'] = 1;
      self._restoreAttributeCache(editor.element, editor.cache);
    });

    self.editors = {};
  };

  this.addEditor = function(editor) {
    var id = self._newId();

    console.log('Adding[',id,']');

    self.editors[id] = {
      element: editor,
      cache: null,
      transform: new Transform()
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
    return self.editors[id].transform;
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

  this._buildAttributeCache = function(element) {
    var cache = {};
    CachedAttributes.forEach(function(attr) {
      cache[attr] = element.style[attr];
    });
    return cache;
  };

  this._restoreAttributeCache = function(element, cache) {
    CachedAttributes.forEach(function(attr) {
      element.style[attr] = cache[attr];
    });
  };
};

module.exports = new Renderer();
