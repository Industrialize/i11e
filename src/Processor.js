// @flow
const EventEmitter = require('eventemitter3');
const Node = require("./Node").Class;
const Signal = require("./Signal");

class Processor extends Node {
  constructor(options : any, eventemitter : ?EventEmitter) {
    super(options, eventemitter);
    this.addFeature("Processor");
  }

  process(signal : Signal, done : (err : Error | null | void, result : Signal) => void) {
    done(null, signal);
  }

  onSignal(signal : Signal) {
    this.process(signal, (error, result) => {
      if (error) throw error;
      this.send(result);
    });
  }
}

module.exports = {
  Class : Processor,
  isProcessor : (object : any) : boolean => {
    return typeof object === "object"
      && Array.isArray(object.feature)
      && object.feature.indexOf("Processor") >= 0;
  },
  create : (delegate : any) => {
    return class NewProcessor extends Processor {
      get type() : string{
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

      process(signal : Signal, done : (err : Error | null | void, result : Signal) => void) {
        if (typeof delegate.process === "function") {
          return delegate.process.call(this, signal, done);
        } else {
          return super.process(signal, done);
        }
      }
    }
  }
}
