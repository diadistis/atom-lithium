var AtomLithiumView;

module.exports = AtomLithiumView = (function() {

  AtomLithiumView.name = 'AtomLithiumView';

  function AtomLithiumView(serializedState) {
    var message;
    this.element = document.createElement('div');
    this.element.classList.add('atom-lithium');
    message = document.createElement('div');
    message.textContent = "The AtomLithium package is Alive! It's ALIVE!";
    message.classList.add('message');
    this.element.appendChild(message);
  }

  AtomLithiumView.prototype.serialize = function() {};

  AtomLithiumView.prototype.destroy = function() {
    return this.element.remove();
  };

  AtomLithiumView.prototype.getElement = function() {
    return this.element;
  };

  return AtomLithiumView;

})();
