
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Sensor extends Node {
  constructor(options, eventemitter) {
    super(options, eventemitter);
    this.addFeature("Sensor");
  }
}

module.exports = {
  Class: Sensor,
  isSensor: object => {
    return typeof object === "object" && Array.isArray(object.feature) && object.feature.indexOf("Sensor") >= 0;
  },
  create: delegate => {
    return class NewSensor extends Sensor {
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

      watch() {
        if (typeof delegate.watch === "function") {
          return delegate.watch.call(this);
        }
      }
    };
  }
};