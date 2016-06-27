exports["test node base operator"] = {
  "test node base operator": (test) => {
    const Lib = require("../lib/index");

    const SensorA = Lib.createSensor({
      watch() {
        setTimeout(() => {
          this.send({name: "John"});
        }, 1000);
      }
    });

    var sensor = new SensorA();

    sensor
      .p((signal, done) => {
        done(null, signal.set("greeting", `Hello, ${signal.get("name")}`));
      })
      .a((signal, done) => {
        console.log(signal.payload);
        done();
      })
      .a((signal, done) => {
        test.equal(signal.get("greeting"), "Hello, John");
        test.done();
        done();
      });

    sensor.watch();
  },

  "test new operator": (test) => {
    const Lib = require("../lib/index");

    Lib.addOperator("throttle", (ms) => {
      var last = new Date().getTime();
      const NewNode = Lib.createNode({
        onSignal(signal) {
          var now = new Date().getTime();
          if (now - ms >= last) {
            last = now;
            this.send(signal);
          }
        }
      });

      return new NewNode();
    });

    var intervalObj = null;
    var count = 0;
    const SensorA = Lib.createSensor({
      watch() {
        intervalObj = setInterval(() => {
          this.send({name: "John" + count});
          count++;
        }, 500);
      }
    });

    var sensorA = new SensorA();
    sensorA
      .throttle(2000)
      .map((signal) => {
        return signal.set("greeting", `Hello, ${signal.get("name")}`);
      })
      // .p((signal, done) => {
      //   signal.greeting = `Hello, ${signal.name}`;
      //   done(null, signal);
      // })
      .a((signal, done) => {
        test.equal(signal.get("greeting"), "Hello, John3")
        test.done();
        done();
        clearInterval(intervalObj);
      });

    sensorA.watch();
  },

  "test errors operator": (test) => {
    const Lib = require("../lib/index");

    let afterErrorProcessing = false;

    const SensorNode = Lib.createNode({
      watch() {
        setTimeout(() => {
          this.send({"greeting": "Hello!"});
        }, 1000);
      }
    });

    var sensor = new SensorNode();

    sensor
      .p((signal, done) => {
        done(new Error("Error in processing"));
      })
      .errors((signal, rethrow) => {
        test.equal(signal.get("greeting"), "Hello!");
        test.equal(signal.hasError(), true);
        test.equal(signal.error.message, "Error in processing");
        rethrow(signal);
      })
      .a((signal, done) => {
        // this code will not be executed, as the error signal is rethrowed by error handler
        afterErrorProcessing = true;
        done();
      })
      .errors((err, rethrow) => {
        test.equal(afterErrorProcessing, false);
        test.done();
      });

    sensor.watch();
  }
}
