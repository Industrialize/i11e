exports["test processor"] = {
  "test Processor feature" : (test) => {
    const Node = require("../lib/Node");
    const Processor = require("../lib/Processor");
    const TestNode = Processor.create({
    });

    test.ok(Node.isNode(new TestNode()));
    test.ok(Processor.isProcessor(new TestNode()));
    test.done();
  },

  "test process": (test) => {
    const Node = require("../lib/Node");
    const Processor = require("../lib/Processor");

    const ProcessorA = Processor.create({
      process(signal, done) {
        done(null, signal.set("greeting", `Hello, ${signal.get("name")}`));
      }
    });

    const NodeA = Node.create({
      onSignal(signal) {
        test.equal(signal.get("greeting"), "Hello, John");
        test.done();
      }
    });

    var nodeA = new NodeA();
    var processorA = new ProcessorA();

    processorA.to(nodeA);

    processorA.push({
      name: "John"
    });
  }
}
