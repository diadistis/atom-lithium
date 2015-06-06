var AtomLithium;

AtomLithium = require('../lib/atom-lithium');

describe("AtomLithium", function() {
  var activationPromise, workspaceElement, _ref;
  _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);
    return activationPromise = atom.packages.activatePackage('atom-lithium');
  });
  return describe("when the atom-lithium:toggle event is triggered", function() {
    it("hides and shows the modal panel", function() {
      expect(workspaceElement.querySelector('.atom-lithium')).not.toExist();
      atom.commands.dispatch(workspaceElement, 'atom-lithium:toggle');
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(function() {
        var atomLithiumElement, atomLithiumPanel;
        expect(workspaceElement.querySelector('.atom-lithium')).toExist();
        atomLithiumElement = workspaceElement.querySelector('.atom-lithium');
        expect(atomLithiumElement).toExist();
        atomLithiumPanel = atom.workspace.panelForItem(atomLithiumElement);
        expect(atomLithiumPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-lithium:toggle');
        return expect(atomLithiumPanel.isVisible()).toBe(false);
      });
    });
    return it("hides and shows the view", function() {
      jasmine.attachToDOM(workspaceElement);
      expect(workspaceElement.querySelector('.atom-lithium')).not.toExist();
      atom.commands.dispatch(workspaceElement, 'atom-lithium:toggle');
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(function() {
        var atomLithiumElement;
        atomLithiumElement = workspaceElement.querySelector('.atom-lithium');
        expect(atomLithiumElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-lithium:toggle');
        return expect(atomLithiumElement).not.toBeVisible();
      });
    });
  });
});
