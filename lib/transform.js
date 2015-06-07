var Transform = function() {
  var self = this;
  this.translate = [20,200,0];
  this.rotate = [0,45, 45];
  this.scale = .4;
  this.depth = 200;
  this.opacity = 1;
  this.zIndex = 0;

  this.reset = function() {
    self.translate = [0,0,0];
    self.rotate = [0,0,0];
    self.scale = 1;
    self.depth = 0;
    self.opacity = 1;
    self.zIndex = 0;
  };

  this.copyFrom = function(other) {
    self.translate = other.translate;
    self.rotate = other.rotate;
    self.scale = other.scale;
    self.depth = other.depth;
    self.opacity = other.opacity;
    self.zIndex = other.zIndex;
  };

  this.apply = function(box) {
    var transform = 'perspective('+self.depth+'px) ';
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

    if(self.scale != 1)
      transform += 'scale('+self.scale+', '+self.scale+')';

    transform = transform.trim();

    box.style['transition'] = '1s';
    box.style['transform'] = transform;
    box.style['opacity'] = self.opacity;
    box.style['z-index'] = self.zIndex;
  };
};

Transform.resetBox = function(box) {
  box.style['transform'] = 'none';
  box.style['opacity'] = 1;
  box.style['z-index'] = 1;
};

module.exports = Transform;
