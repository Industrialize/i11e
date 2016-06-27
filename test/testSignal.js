exports["test Signal"] = {
  "test get and set content": (test) => {
    const Signal = require("../lib/Signal");

    let signal = new Signal({
      a : 1,
      b : {
        c: "string value"
      }
    });

    test.equal(signal.get("b.c"), "string value");
    test.equal(signal.get("a"), 1);
    test.done();
  },

  "test get and set primitive type data": (test) => {
    const Signal = require("../lib/Signal");

    let signal = new Signal(1);
    test.equal(signal.payload, 1);

    signal = new Signal("string value");
    test.equal(signal.payload, "string value");

    signal = new Signal(false);
    test.equal(signal.payload, false);

    signal = new Signal(null);
    test.equal(signal.payload, null);

    test.done();
  },


  "test signal new method": (test) => {
    const Signal = require("../lib/Signal");

    let signal = new Signal({
      a : 1,
      b : {
        c: "string value"
      }
    });

    let newSignal = signal.new({
      a : 10
    });

    test.equal(newSignal.get("a"), 10);
    test.equal(newSignal.seq, signal.seq);
    test.done();
  },

  "test sequence of modified signal" : (test) => {
    const Signal = require("../lib/Signal");

    let signal = new Signal({
      a : 1,
      b : {
        c: "string value"
      }
    });

    let newSignal = signal.set("b.c", 2);

    test.equal(newSignal.get("a"), 1);
    test.equal(newSignal.get("b.c"), 2);
    test.equal(signal.seq, newSignal.seq);
    test.done();
  }
}
