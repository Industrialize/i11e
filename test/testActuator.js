exports["test Actuator"] = {
  "test Actuator feature" : (test) => {
    const Node = require("../lib/Node");
    const Actuator = require("../lib/Actuator");
    const TestNode = Actuator.create({
    });

    test.ok(Node.isNode(new TestNode()));
    test.ok(Actuator.isActuator(new TestNode()));
    test.done();
  },

  "test actuator": (test) => {
    const Node = require("../lib/Node");
    const Actuator = require("../lib/Actuator");

    const ActuatorA = Actuator.create({
      act(signal, done) {
        // make side effect
        console.log(`Hello, ${signal.get("name")}`);
        done(null, `OK`);
      }
    });

    const NodeA = Node.create({
      onSignal(signal) {
        test.equal(signal.get("__result__"), "OK");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var actuatorA = new ActuatorA();

    actuatorA.to(nodeA);

    actuatorA.push({
      name: "John"
    });
  }
}
