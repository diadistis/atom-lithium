AtomLithiumView = require './atom-lithium-view'
{CompositeDisposable} = require 'atom'

module.exports = AtomLithium =
  atomLithiumView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @atomLithiumView = new AtomLithiumView(state.atomLithiumViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @atomLithiumView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-lithium:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @atomLithiumView.destroy()

  serialize: ->
    atomLithiumViewState: @atomLithiumView.serialize()

  toggle: ->
    console.log 'AtomLithium was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
