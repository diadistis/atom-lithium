Transform = function() {
  var self = this;
  this.translate = [20,200,0];
  this.rotate = [0,45, 45];
  this.depth = 200;

  this.apply = function(box) {
    console.log('Applying 3D styles');

    box.style['perspective'] = self.depth + 'px';

    var transform = '';
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

    transform = transform.trim();

    box.style['transform'] = transform;
  };
};

Transform.reset = function(box) {
  box.style['perspective'] = '';
  box.style['transform'] = 'none';
};

module.exports = Transform;