var MyoModule;

module.exports = MyoModule = {
  active: false,
  test: function() {
    if (!this.active) {
      console.log('MyoModule.test: started');
      this.active = !this.active;
    } else {
      console.log('MyoModule.test: stopped');
      this.active = !this.active;
    }
  }
};
