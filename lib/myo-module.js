var MyoModule;
var Myo = require('myo');
var LithiumLayout = require('./layout');

function mod(n, m) {
        return ((n % m) + m) % m;
}

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
      var dataInterval = 1000;

      myMyo.on('connected', function(data, timestamp){
        myMyo.streamEMG(enableEmg);
        console.log('connected!', this.id);
        myMyo.setLockingPolicy('none');
        myMyo.lock();
      });

      // Implement your own locking. Example: (Handle locking yourself like described above!!!!)
      lastPose = "rest";
      browseRefsEnabled = false;

      myMyo.on('double_tap', function (edge) {
          if(edge){
              lastPose = "rest";
              if(!myMyo.isLocked)  {
                  console.log("Lock");
                  myMyo.lock();
                  LithiumLayout.activateController(null);
                  lithiumCtrl = 'browseRefs';
                  browseRefsEnabled = false;
              }else {
                  console.log("Unlock");
                  myMyo.unlock();
              }
          }
      });


      accelDataInit = null;
      myMyo.on('fist', function(edge){
        if (myMyo.isLocked)
          return;
        myMyo.timer(edge, minGestureInterval, function(){
              console.log('fist Here');
              lastPose = 'fist';
              accelDataInit = null;
              if (browseRefsEnabled == true)
              {
                  LithiumLayout.select();
              }
              //LithiumLayout.activateController(null);
              myMyo.unlock();
          });
      });


      myMyo.on('pose', function(pose_name, edge){
        //console.log('Started ', pose_name);
        if (myMyo.isLocked)
          return;
        if (pose_name != "undefined" && pose_name != "rest" && pose_name != "fist" &&
            pose_name != "double_tap")
        {
          myMyo.timer(edge, minGestureInterval, function(){
            //console.log('Started ', pose_name);
            switch(pose_name) {
              case "wave_out":
                  lithiumCtrl = 'browseRefs';
                  console.log('Started ', pose_name , lithiumCtrl);
                  break;
              case "wave_in":
                  lithiumCtrl = 'showRefs';
                  console.log('Started ', pose_name , lithiumCtrl);
                  break;
              case "fingers_spread":
                  break;
              default:
                  break;
            }
            myMyo.unlock();
          });
        }
      });



      lithiumCtrl = 'browseRefs';

      motionType = 'imu';

      myMyo.on(motionType, function(data){

        if (myMyo.isLocked || lastPose != 'fist')
          return;

        var localtimeDate = new Date();
        var localNow = localtimeDate.getTime();

        //console.log('Gyrscope : ', data);

        //console.log('LocalTIme : ', localNow, lastNow);




        if ((localNow - lastNow) > dataInterval){
          //console.log('LocalTIme : ', localNow, lastNow);
          lastNow = localNow;
          //console.log(motionType + "  : ", data);

          //console.log('accelerometer ' + "  : ", data.accelerometer);
          //console.log('accelerometer' + "  : ", data.accelerometer);
          //console.log('gyroscope' + "  : ", data.gyroscope);

          //console.log('accelerometer y : ', data.y);

          if (accelDataInit == null)
          {
            accelDataInit = data.accelerometer;
          }

          accelData = data.accelerometer;

          //console.log('Orientation x,y  : ', accelData.x , accelData.y);


          accelDiffx = accelData.x;
          accelDiffy = accelData.y;
          // accelDiffx = accelData.x - accelDataInit.x;
          // accelDiffy = accelData.y - accelDataInit.y;
          //accelDiffx = mod(accelData.x - accelDataInit.x, 1);
          //accelDiffy = mod(accelData.y - accelDataInit.y, 1);
          // accelDiffx = (accelData.x - accelDataInit.x) % 1;
          // accelDiffy = (accelData.y - accelDataInit.y) % 1
          //console.log('Orientation x,y  : ', accelDiffx ,accelDiffy);

          if (accelDiffx > 0.4) {
            //console.log(motionType + " " + axis +" : ", tesVal);
            //console.log('Orientation Down  : ', accelDiffx);
          }

          if (accelDiffx < -0.3) {
            //console.log(accelDataLast + " " + axis +" : ", tesVal);
            //console.log('Orientation Up  : ', accelDiffx);
            ///console.log('Accelerate Right : ', data);
            //LithiumLayout.activateController('browseRefs');
          }

          if (accelDiffy> 0.4) {
            //console.log(motionType + " " + axis +" : ", tesVal);
            //console.log('Orientation Left  : ', accelDiffy);
            //console.log('Accelerate Left : ', data);
          }

          if (accelDiffy < -0.3) {
            //console.log(motionType + " " + axis +" : ", tesVal);
            //console.log('Orientation Right  : ', accelDiffy);
            console.log('Accelerate Right : ', data);
            browseRefsEnabled = true;
            LithiumLayout.activateController(lithiumCtrl);
          }

        }
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

      //
      //
      //'orientation'
      //'gyroscope'
      //'accelerometer'
      //'imu'

      // var pose = "rest";
      // var lastOrientation = null;
      // var scrollCenterOrientation = null;
      // myMyo.on('accelerometer', function(data){
      //   if (pose === "fist") {
      //     //console.log(data.x.toFixed(1), data.y.toFixed(1), data.z.toFixed(1));
      //     if (data.x < (scrollCenterOrientation.x - 0.4)) {
      //       console.log("scroll up");
      //     } else if (data.x > (scrollCenterOrientation.x + 0.3)) {
      //       console.log("scroll down");
      //     }
      //   }
      //   lastOrientation = data;
      // });
      //
      // myMyo.on('pose', function(pose_name, edge){
      //   console.log('pose : ', pose_name);
      //   if (!edge)
      //   {
      //       pose = "rest";
      //   }
      //   pose = pose_name;
      //   if (pose === "fist") {
      //     scrollCenterOrientation = lastOrientation;
      //   }
      // });


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
      // myMyo.on('fist', function(edge){
      //   myMyo.timer(edge, minGestureInterval, function(){
      //         console.log('fist Here');
      //         LithiumLayout.activateController(null);
      //         myMyo.unlock(unlockInterval);
      //     });
      // });
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
      //   if (pose_name != "undefined" && pose_name != "rest" && pose_name != "fist" &&
      //       pose_name != "double_tap")
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
