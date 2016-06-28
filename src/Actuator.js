// @flow
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Actuator extends Node {
  constructor(options : any, eventemitter : ?EventEmitter) {
    super(options, eventemitter);
    this.addFeature("Actuator");
  }

  get outputs() : [string]{
    return ["__result__"];
  }

  act(signal : Signal, done : (err : Error | null | void, result : any) => void) {
    done();
  }

  onSignal(signal : Signal) {
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
  Class : Actuator,
  isActuator : (object : any) : boolean => {
    return typeof object === "object"
      && Array.isArray(object.feature)
      && object.feature.indexOf("Actuator") >= 0;
  },
  create: (delegate : any) => {
    return class NewActuator extends Actuator {
      get type() : string {
        if (typeof delegate.type === "function") {
          return delegate.type.call(this);
        } else {
          return super.type;
        }
      }

      get inputs() : [string] {
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

      act(signal : Signal, done : (err : Error | null | void, result : any) => void) {
        if (typeof delegate.act === "function") {
          return delegate.act.call(this, signal, done);
        } else {
          return super.act(signal, done);
        }
      }
    }
  }
}
