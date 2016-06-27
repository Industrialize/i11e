exports['test Node'] = {
  "test Node feature" : (test) => {
    const Node = require("../lib/Node");
    const TestNode = Node.create({
    });

    test.ok(Node.isNode(new TestNode()));
    test.done();
  },

  'test creation': (test) => {
    const Node = require("../lib/Node");
    const TestNode = Node.create({
      type() {
        return "Test Node";
      },

      inputs() {
        return ["name"];
      },

      outputs() {
        return ["greeting"];
      }
    });

    var node = new TestNode();

    test.equal(node.type, "Test Node");
    test.equal(node.inputs[0], "name");
    test.equal(node.outputs[0], "greeting");
    test.done();
  },

  "test node connection": (test) => {
    const Node = require("../lib/Node");

    const NodeA = Node.create({
      onSignal(signal) {
        let newSignal = signal.set("greeting", `Hello, ${signal.get("name")}`);
        this.send(newSignal);
      }
    });

    const NodeB = Node.create({
      onSignal(signal) {
        test.equal(signal.get("greeting"), "Hello, John");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var nodeB = new NodeB();

    nodeA.to(nodeB);

    nodeA.push({
      name: "John"
    });
  },

  "test node watch": (test) => {
    const Node = require("../lib/Node");
    const NodeA = Node.create({
      watch() {
        setTimeout(() => {
          this.send({"greeting": "Hello!"});
        }, 1000);
      }
    });

    const NodeB = Node.create({
      onSignal(signal) {
        test.equal(signal.get("greeting"), "Hello!");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var nodeB = new NodeB();

    nodeA.to(nodeB);

    nodeA.watch();
  },

  "test error handling": (test) => {
    const createNode = require("../lib/index").createNode;
    const BasicOperators = require("../lib/BasicOperators");
    BasicOperators.register();

    let afterErrorProcessing = false;

    const SensorNode = createNode({
      watch() {
        setTimeout(() => {
          this.send({"greeting": "Hello!"});
        }, 1000);
      }
    });

    const ErrorGeneratorNode = createNode({
      process(signal, done) {
        done(new Error("Error in processing"));
      }
    });

    const ErrorHandlerNode = createNode({
      onError(signal) {
        test.equal(signal.get("greeting"), "Hello!");
        test.equal(signal.hasError(), true);
        test.equal(signal.error.message, "Error in processing");

        setTimeout(() => {
          test.equal(afterErrorProcessing, false);
          test.done();
        }, 1000);
      }
    });

    var sensor = new SensorNode();
    var processor = new ErrorGeneratorNode();
    var errorHandler = new ErrorHandlerNode();

    let pipeline = sensor
      .to(processor)
      .to(errorHandler)
      .a((signal, done) => {
        // this code will not be executed, as the signal is consumed by error handler
        afterErrorProcessing = true;
        done();
      });

    sensor.watch();
  },

  "test error handling with rethrowing error": (test) => {
    const createNode = require("../lib/index").createNode;

    let afterErrorProcessing = false;

    const SensorNode = createNode({
      watch() {
        setTimeout(() => {
          this.send({"greeting": "Hello!"});
        }, 1000);
      }
    });

    const ErrorGeneratorNode = createNode({
      process(signal, done) {
        done(new Error("Error in processing"));
      }
    });

    const ErrorHandlerNode = createNode({
      onError(signal) {
        test.equal(signal.get("greeting"), "Hello!");
        test.equal(signal.hasError(), true);
        test.equal(signal.error.message, "Error in processing");
        this.send(signal);
      }
    });

    const ErrorHandlerNode2 = createNode({
      onError(signal) {
        test.equal(afterErrorProcessing, false);
        test.done();
      }
    });

    var sensor = new SensorNode();
    var processor = new ErrorGeneratorNode();
    var errorHandler = new ErrorHandlerNode();
    var errorHandler2 = new ErrorHandlerNode2();

    let pipeline = sensor
      .to(processor)
      .to(errorHandler)
      .a((signal, done) => {
        // this code will not be executed, as the error signal is rethrowed by error handler
        afterErrorProcessing = true;
        done();
      })
      .to(errorHandler2);

    sensor.watch();
  },

  "test end signal" : (test) => {
    const Lib = require("../lib/index");

    let processed = 0;
    const NodeA = Lib.createNode({
      act(signal, done) {
        processed++;
        done();
      }
    });

    const NodeB = Lib.createNode({
      act(signal, done) {
        processed++;
        done();
      }
    });

    var nodeA = new NodeA();
    var nodeB = new NodeB();

    nodeA.to(nodeB);

    nodeA.push({name : "John"});
    nodeA.push(Lib.End());
    nodeA.push({name : "John"});

    setTimeout(() => {
      test.equal(processed, 2);
      test.done();
    }, 1000);
  }
}
