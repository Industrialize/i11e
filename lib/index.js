
const Node = require("./Node");
const Sensor = require("./Sensor");
const Processor = require("./Processor");
const Actuator = require("./Actuator");
const Filter = require("./Filter");
const Signal = require("./Signal");
const BasicSensors = require("./BasicSensors");

function addOperator(names, operator) {
  function func(...args) {
    const node = operator(...args);
    return this.to(node);
  };

  if (Array.isArray(names)) {
    names.forEach(name => {
      // $FlowIgnore
      Node.Class.prototype[name] = func;
    });
  } else {
    // $FlowIgnore
    Node.Class.prototype[names] = func;
  }
}

addOperator(["node", "n"], function (comment, delegate) {
  if (typeof comment == "object") delegate = comment;
  const DelegateNode = Node.create(delegate);
  return new DelegateNode();
});

addOperator(["processor", "p"], function (comment, process) {
  if (typeof comment == "function") process = comment;
  const DelegateProcessor = Processor.create({ process });
  return new DelegateProcessor();
});

addOperator(["sensor", "s"], function (comment, watch) {
  if (typeof comment == "function") watch = comment;
  const DelegateSensor = Sensor.create({ watch });
  return new DelegateSensor();
});

addOperator(["actuator", "a"], function (comment, act) {
  if (typeof comment == "function") act = comment;
  const DelegateActuator = Actuator.create({ act });
  return new DelegateActuator();
});

addOperator(["filter", "f"], function (comment, accept) {
  if (typeof comment == "function") accept = comment;
  const DelegateFilter = Filter.create({ accept });
  return new DelegateFilter();
});

addOperator("map", function (map) {
  const MapProcessor = Processor.create({
    process(signal, done) {
      try {
        done(null, map(signal));
      } catch (err) {
        done(err);
      }
    }
  });
  return new MapProcessor();
});

addOperator("throttle", ms => {
  var last = new Date().getTime();
  const ThrottleNode = Node.create({
    onSignal(signal) {
      var now = new Date().getTime();
      if (now - ms >= last) {
        last = now;
        this.send(signal);
      }
    }
  });
  return new ThrottleNode();
});

addOperator("errors", errHandler => {
  const ErrorHandlerNode = Node.create({
    onError(signal) {
      errHandler(signal, signal => {
        this.send(signal);
      });
    }
  });
  return new ErrorHandlerNode();
});

addOperator("done", endHandler => {
  const DoneNode = Node.create({
    onEnd(signal) {
      endHandler(signal);
    }
  });
  return new DoneNode();
});

module.exports = {
  createNode: Node.create,
  createSensor: Sensor.create,
  createProcessor: Processor.create,
  createActuator: Actuator.create,
  createFilter: Filter.create,

  isNode: Node.isNode,
  isActuator: Actuator.isActuator,
  isProcessor: Processor.isProcessor,
  isFilter: Filter.isFilter,
  isSensor: Sensor.isSensor,

  addOperator: addOperator,

  Error: Signal.Error,
  End: Signal.End,

  isSignal: Signal.isSignal,
  hasError: Signal.hasError,
  isEnd: Signal.isEnd,

  ofList: BasicSensors.ofList
};