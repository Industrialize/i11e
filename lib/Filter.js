
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Filter extends Node {
  constructor(options, eventemitter) {
    super(options, eventemitter);
    this.addFeature("Filter");
  }

  accept(signal) {
    return true;
  }

  onSignal(signal) {
    if (this.accept(signal)) this.send(signal);
  }
}

module.exports = {
  Class: Filter,
  isFilter: object => {
    return typeof object === "object" && Array.isArray(object.feature) && object.feature.indexOf("Filter") >= 0;
  },
  create: delegate => {
    return class NewFilter extends Filter {
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

      accept(signal) {
        if (typeof delegate.accept === "function") {
          return delegate.accept.call(this, signal);
        } else {
          return super.accept(signal);
        }
      }
    };
  }
};