// @flow
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Filter extends Node {
  constructor(options : any, eventemitter : ?EventEmitter) {
    super(options, eventemitter);
    this.addFeature("Filter");
  }

  accept(signal : Signal) {
    return true;
  }

  onSignal(signal : Signal) {
    if (this.accept(signal)) this.send(signal);
  }
}

module.exports = {
  Class : Filter,
  isFilter : (object : any) : boolean => {
    return typeof object === "object"
      && Array.isArray(object.feature)
      && object.feature.indexOf("Filter") >= 0;
  },
  create: (delegate : any) => {
    return class NewFilter extends Filter {
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

      accept(signal : Signal) {
        if (typeof delegate.accept === "function") {
          return delegate.accept.call(this, signal);
        } else {
          return super.accept(signal);
        }
      }
    }
  }
}
