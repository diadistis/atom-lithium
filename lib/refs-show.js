var Transform = require('./transform');

var Controller = function(Layout) {
  var self = this;

  this.state = null;
  this.markers = [];

  this.activate = function() {
    console.log('Activating show');
    if(!self.state)
      self._initializeState();
    else
      Layout.activateController(null);
  };

  this.select = function() {
    console.log('Select() event @ show');
    self.deactivate();
  };

  this.deactivate = function() {
    console.log('Deactivating show');
    self.state = null;
    self._dropMarkers();
    Layout.getRenderer().disable();
  };

  this._dropMarkers = function() {
    self.markers.forEach(function(d){d.destroy();});
    self.markers = [];
  };

  this._getCurrentEditors = function() {
    var result = [];
    atom.workspace.getTextEditors().forEach(function(editor) {
      var lines = editor.getLineCount();
      var from = Math.floor(lines / 3);
      var to = 2 * from;

      result.push({
        editor: editor,
        ranges: [
          [from, to]
        ]
      });
    });
    return result;
  };

  this._initializeState = function() {
    var editors = self._getCurrentEditors();
    if(editors.length == 0) {
      return;
    }

    console.log('Initializing show state');
    self.state = {
      editors: [],
      current: 0
    };

    Layout.ensureEditorsAreBuilt();

    var pane = editors[0].editor;
    var width = pane.getWidth();
    var height = pane.getHeight();
    var scale = .9;
    var Dx = Math.floor(scale * (width / 2) * (1 - Math.cos(30)));
    var Dy = Math.floor(scale * (height / 4) * Math.cos(10));

    editors.forEach(function(editorObj, index) {
      var editor = editorObj.editor;
      var element = atom.views.getView(editor);
      var id = Layout.getRenderer().addEditor(element);
      var transform = Layout.getRenderer().getTransform(id);
      transform.reset();

      transform.rotate = [ -10, 30, 0 ];
      transform.translate = [
        Dx - index * Dx / editors.length,
        -Dy + 1.2 * index * Dy / editors.length,
        -index * 200 ];
      transform.depth = 600;
      transform.scale = scale;
      transform.opacity = Math.min(1, Math.max(.5, 1.2 * (editors.length - index) / editors.length));
      transform.zIndex = 10 * (editors.length - index);

      var editorState = {
        id: id,
        editor: editor,
        element: element,
        transform: transform,
        ranges: editorObj.ranges
      };
      self.state.editors.push(editorState);

      self._markEditor(editorState);
    });

    Layout.getRenderer().enable();
  };

  this._advanceState = function() {
    console.log('Advancing show state');
    var previousTransform = new Transform();
    var tmp = new Transform();
    previousTransform.copyFrom(self.state.editors[self.state.editors.length-1].transform);

    for(var i = 0; i < self.state.editors.length; ++i) {
      var current = self.state.editors[i].transform;
      self.state.editors[i].element.style['pointer-events'] = 'none';
      tmp.copyFrom(current);
      current.copyFrom(previousTransform);
      previousTransform.copyFrom(tmp);
    }

    self.state.current++;
    self.state.current %= self.state.editors.length;

    Layout.getRenderer().restoreSingleAttribute(self.state.editors[self.state.current].id, 'pointer-events');
    Layout.getRenderer().refresh();
  };

  this._markEditor = function(editorObj) {
    var editor = editorObj.editor;

    editorObj.ranges.forEach(function(lineRange) {
      var mark = editor.markBufferRange([[lineRange[0], 0], [lineRange[1], 0]], {persistent:false});
      self.markers.push(mark);
      editor.decorateMarker(mark, { type: 'line', class: 'highlight-refs' });
      editor.scrollToBufferPosition([Math.floor((lineRange[0]+lineRange[1])/2),0], {center:true});
    });
  };
};

module.exports.Controller = Controller;
