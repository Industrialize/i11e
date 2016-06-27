
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Processor extends Node {
  constructor(options, eventemitter) {
    super(options, eventemitter);
    this.addFeature("Processor");
  }

  process(signal, done) {
    done(null, signal);
  }

  onSignal(signal) {
    this.process(signal, (error, result) => {
      if (error) throw error;
      this.send(result);
    });
  }
}

module.exports = {
  Class: Processor,
  isProcessor: object => {
    return typeof object === "object" && Array.isArray(object.feature) && object.feature.indexOf("Processor") >= 0;
  },
  create: delegate => {
    return class NewProcessor extends Processor {
      get type() {
        if (typeof delegate.type === "function") {
          return delegate.type.call(this);
        } else {
          return super.type;
        }
      }

      get inputs() {
        if (typeof delegate.inputs === "function") {
          return delegate.inputs.call(this);
        } else {
          return super.inputs;
        }
      }

      get outputs() {
        if (typeof delegate.outputs === "function") {
          return delegate.outputs.call(this);
        } else {
          return super.outputs;
        }
      }

      process(signal, done) {
        if (typeof delegate.process === "function") {
          return delegate.process.call(this, signal, done);
        } else {
          return super.process(signal, done);
        }
      }
    };
  }
};