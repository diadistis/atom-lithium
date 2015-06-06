var MyoModule;
var Myo = require('myo');
var LithiumLayout = require('./layout');

module.exports = MyoModule = {
  active: false,
  myoCtrl: null,
  test: function() {
    if (!this.active) {
      console.log('MyoModule.test: started');
      this.active = !this.active;
      var _this = this;

      // Gestures
      // 'fingers_spread'
      // 'fist'
      // 'wave_out'
      // 'wave_in'
      // 'rest'
      // 'thumb_to_pinky'

      this.myoCtrl = Myo.create();
      myMyo = this.myoCtrl;

      enableEmg = false;

      //
      // Minimum Time required for each gesture
      //
      minGestureInterval = 300;
      //
      // Unlock time after successful gesture
      //
      unlockInterval = 5000;


      var timeDate = new Date();
      var lastNow = timeDate.getTime();
      var dataInterval = 400;

      myMyo.on('connected', function(data, timestamp){
        myMyo.streamEMG(enableEmg);
        console.log('connected!', this.id);
      });


      // myMyo.on('gyroscope', function(data){
      //   localtimeDate = new Date();
      //   localnow = localtimeDate.getTime();
      //
      //   //console.log('Gyrscope : ', data);
      //
      //   if ((localnow - lastNow) > dataInterval){
      //     lastNow = localnow;
      //     console.log('Gyrscope : ', data);
      //   }
      // });
      //
      // myMyo.on('orientation', function(data){
      //   localtimeDate = new Date();
      //   localnow = localtimeDate.getTime();
      //
      //   //console.log('Gyrscope : ', data);
      //
      //   if ((localnow - lastNow) > dataInterval){
      //     lastNow = localnow;
      //     console.log('orientation : ', data);
      //   }
      // });

      myMyo.on('accelerometer', function(data){
        var localtimeDate = new Date();
        var localNow = localtimeDate.getTime();

        //console.log('Gyrscope : ', data);

        //console.log('LocalTIme : ', localNow, lastNow);


        if ((localNow - lastNow) > dataInterval){
          //console.log('LocalTIme : ', localNow, lastNow);
          lastNow = localNow;
          //console.log('accelerometer : ', data);

          //console.log('accelerometer y : ', data.y);

          if (data.y > 0.4) {
            console.log('accelerometer y : ', data.y);
            console.log('Accelerate Left : ', data);
          }

          if (data.y < -0.4) {
            console.log('accelerometer y : ', data.y);
            console.log('Accelerate Right : ', data);
            LithiumLayout.activateController('browseRefs');
          }

        }
      });


      //
      // Setup Gesture Callbacks
      //
      // myMyo.on('wave_in', function(edge){
      //   myMyo.timer(edge, minGestureInterval, function(){
      //         console.log('wave_in Here');
      //         myMyo.unlock(unlockInterval);
      //     });
      // });
      //
      //
      // myMyo.on('wave_out', function(edge){
      //   myMyo.timer(edge, minGestureInterval, function(){
      //         console.log('wave_out Here');
      //         myMyo.unlock(unlockInterval);
      //     });
      // });
      //
      myMyo.on('fist', function(edge){
        myMyo.timer(edge, minGestureInterval, function(){
              console.log('fist Here');
              LithiumLayout.activateController(null);
              myMyo.unlock(unlockInterval);
          });
      });
      //
      // myMyo.on('fingers_spread', function(edge){
      //   myMyo.timer(edge, minGestureInterval, function(){
      //         console.log('fingers_spread Here');
      //         myMyo.unlock(unlockInterval);
      //         LithiumLayout.activateController(null);
      //     });
      // });

      // myMyo.on('pose', function(pose_name, edge){
      //   //console.log('Started ', pose_name);
      //   if (pose_name != "undefined" && pose_name != "rest")
      //   {
      //     myMyo.timer(edge, minGestureInterval, function(){
      //       console.log('Started ', pose_name);
      //       myMyo.unlock(unlockInterval);
      //     });
      //   }
      // });

      // var timeDate = new Date();
      // var now = timeDate.getTime();
      //
      // myMyo.on('emg', function(data){
      //     console.log(data);
      // });

      //myo.experimental.js

      // myMyo.on('connected', function(){
      //     myMyo.streamEMG(true);
      // });
      // myMyo.on('emg', function(data){
      //     console.log(data);
      // });

      // Myo.on('pose', function(pose_name, edge){
      //     if(pose_name != 'rest' && edge){
      //         console.log('Started ', pose_name);
      //     }
      // });

    } else {
      console.log('MyoModule.test: stopped');
      this.active = !this.active;

      myMyo.on('connected', function(data, timestamp){
        myMyo.streamEMG(enableEmg);
        console.log('connected!', this.id);
      });

      myMyo.streamEMG(false);
      this.myoCtrl.off();
      this.myoCtrl.off('gyroscope');
      this.myoCtrl.off('orientation');
      this.myoCtrl.off('accelerometer');
      this.myoCtrl.off('imu');
      this.myoCtrl.off('pose');
      this.myoCtrl.off('fist');
      this.myoCtrl.off('wave_out');
      this.myoCtrl.off('wave_in');
      this.myoCtrl.off('fingers_spread');
      this.myoCtrl.off('rest');
      this.myoCtrl.off('thumb_to_pinky');

    }
  }
};
