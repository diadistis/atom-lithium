var Transform = require('./transform');

var CachedAttributes = [ 'opacity', 'display', 'pointer-events', 'z-index', 'transform-style' ];

var Renderer = function() {
  var self = this;

  this.editors = {};
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

  this.refresh = function() {
    self.enable(true);
  };

  this.enable = function(refreshMode) {
    console.log('Enabling 3D View (',Object.keys(self.editors).length,' editors)');

    if(!refreshMode)
      self._setPanelTabsVisibility(false);

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];

      if(!refreshMode) {
        editor.cache = self._buildAttributeCache(editor.element);
        editor.element.style.display = 'block';
        editor.element.style['pointer-events'] = 'none';
      }

      editor.transform.apply(editor.element);
    });
  };

  this.disable = function() {
    console.log('Disabling 3D View');

    self._setPanelTabsVisibility(true);

    Object.keys(self.editors).forEach(function(id) {
      var editor = self.editors[id];
      Transform.resetBox(editor.element);
      self._restoreAttributeCache(editor.element, editor.cache);
    });

    self.editors = {};
  };

  this.addEditor = function(editor) {
    var id = self._newId();

    self.editors[id] = {
      element: editor,
      cache: null,
      transform: new Transform()
    };

    return id;
  };

  this.removeEditor = function(id) {
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
