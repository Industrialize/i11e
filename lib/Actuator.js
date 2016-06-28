
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Actuator extends Node {
  constructor(options, eventemitter) {
    super(options, eventemitter);
    this.addFeature("Actuator");
  }

  get outputs() {
    return ["__result__"];
  }

  act(signal, done) {
    done();
  }

  onSignal(signal) {
    this.act(signal, (error, result) => {
      if (error) throw error;
      if (result) {
        this.send(signal.set("__result__", result));
      } else {
        this.send(signal);
      }
    });
  }
}

module.exports = {
  Class: Actuator,
  isActuator: object => {
    return typeof object === "object" && Array.isArray(object.feature) && object.feature.indexOf("Actuator") >= 0;
  },
  create: delegate => {
    return class NewActuator extends Actuator {
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

      poweron() {
        if (typeof delegate.poweron === "function" && this.status !== "power on") {
          delegate.poweron.call(this);
        }
        super.poweron();
      }

      act(signal, done) {
        if (typeof delegate.act === "function") {
          return delegate.act.call(this, signal, done);
        } else {
          return super.act(signal, done);
        }
      }
    };
  }
};