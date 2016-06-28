// @flow
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Sensor extends Node {
  constructor(options : any, eventemitter : ? EventEmitter) {
    super(options, eventemitter);
    this.addFeature("Sensor");
  }
}

module.exports = {
  Class : Sensor,
  isSensor : (object : any) : boolean => {
    return typeof object === "object"
      && Array.isArray(object.feature)
      && object.feature.indexOf("Sensor") >= 0;
  },
  create: (delegate : any) => {
    return class NewSensor extends Sensor {
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

      get outputs() : [string] {
        if (typeof delegate.outputs === "function") {
          return delegate.outputs.call(this);
        } else {
          return super.outputs;
        }
      }

      poweron() {
        if (typeof delegate.poweron === "function" && this.status !== "power on") {
          delegate.poweron.call(this);
        }
        super.poweron();
      }

      watch() {
        if (typeof delegate.watch === "function") {
          return delegate.watch.call(this);
        }
      }
    }
  }
}
