exports["test Sensor"] = {
  "test Sensor feature" : (test) => {
    const Node = require("../lib/Node");
    const Sensor = require("../lib/Sensor");
    const TestNode = Sensor.create({
    });

    test.ok(Node.isNode(new TestNode()));
    test.ok(Sensor.isSensor(new TestNode()));
    test.done();
  },

  "test sensor": (test) => {
    const Node = require("../lib/Node");
    const Sensor = require("../lib/Sensor");

    const SensorA = Sensor.create({
      watch() {
        // make side effect
        setTimeout(() => {
          this.send({
            greeting: "Hello, John"
          })
        }, 1000);
      }
    });

    const NodeA = Node.create({
      onSignal(signal) {
        test.equal(signal.get("greeting"), "Hello, John");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var sensorA = new SensorA();

    sensorA.to(nodeA);

    sensorA.watch();
  }
}
