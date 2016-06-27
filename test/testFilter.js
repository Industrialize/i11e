exports["test Filter"] = {
  "test Filter feature" : (test) => {
    const Node = require("../lib/Node");
    const Filter = require("../lib/Filter");
    const TestNode = Filter.create({
    });

    test.ok(Node.isNode(new TestNode()));
    test.ok(Filter.isFilter(new TestNode()));
    test.done();
  },

  "test filter": (test) => {
    const Node = require("../lib/Node");
    const Sensor = require("../lib/Sensor");
    const Filter = require("../lib/Filter");

    const SensorA = Sensor.create({
      watch() {
        // make side effect
        setTimeout(() => {
          this.send({
            greeting: "Hello, John",
            language: "en"
          });

          setTimeout(() => {
            this.send({
              greeting: "Bonjour, Jean",
              language: "fr"
            })
          }, 1000);

        }, 1000);
      }
    });

    const FilterA = Filter.create({
      accept(signal) {
        return signal.get("language") === "fr";
      }
    })

    const NodeA = Node.create({
      onSignal(signal) {
        test.equal(signal.get("greeting"), "Bonjour, Jean");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var filterA = new FilterA();
    var sensorA = new SensorA();

    sensorA
      .to(filterA)
      .to(nodeA);

    sensorA.watch();
  }
}
