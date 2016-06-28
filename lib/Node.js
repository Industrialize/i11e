
const EventEmitter = require('eventemitter3');
const uuid = require('node-uuid');
const Signal = require('./Signal');

class Node {

  constructor(options = {}, eventemitter) {
    this._feature = ["Node"];
    this._id = uuid.v1();
    this._status = "power off";
    this.options = options;
    this.incomingEvent = "incoming-" + this.id;
    this.outgoingEvent = "outgoing-" + this.id;
    if (eventemitter) {
      this.ee = eventemitter;
    } else {
      this.ee = new EventEmitter();
    }

    this.ee.on(this.incomingEvent, signal => {
      this.onReceive(signal);
    });
  }

  get id() {
    return this._id;
  }

  /**
   * Get the Node type
   * @return {string} the node type
   */
  get type() {
    return "node-" + uuid.v1();
  }

  /**
   * Get the features of the Node
   * @return {string} all the features
   */
  get feature() {
    return this._feature;
  }

  get status() {
    return this._status;
  }

  /**
   * The input data name array in signal
   * @return {array} array of name
   */
  get inputs() {
    return [];
  }

  /**
   * The output data name array in signal
   * @return {array} array of name
   */
  get outputs() {
    return [];
  }

  /**
   * add feature
   * @param  {Array | string} features - a single feature string or a list of feature
   */
  addFeature(features) {
    if (typeof features === "string") {
      this._feature.push(features);
    } else {
      features.forEach(feature => {
        this._feature.push(feature);
      });
    }
  }

  hasFeature(feature) {
    return this._feature.indexOf(feature) >= 0;
  }

  // ==================================================================
  //  Basic methods to override
  // ==================================================================

  /**
   * run the node
   */
  poweron() {
    if (this.status === "power on") {
      // do nothing
    } else {
        this.watch();
        this._status = "power on";
      }
  }

  /**
   * watch the environment
   */
  watch() {}

  /**
   * act to a signal, create side effects, modify the environment
   * @param  {Signal}   signal the signal to process
   * @param  {Function} done   callbackk function (err, result)
   */
  act(signal, done) {}

  /**
   * check if accept the signal or not
   * @param  {Signal} signal - the signal to check
   * @return {Boolean}   true if accept otherwise false
   */
  accept(signal) {
    return true;
  }

  /**
   * Process the signal
   * @param  {Signal} signal - Signal the signal to process
   * @param  {Function} done - callback function
   */
  process(signal, done) {
    done(null, signal);
  }

  /**
   * override by the subclass: entry point to process END signal
   * Usually you don't need to override this method
   * @param  {Signal} signal - the end signal
   */
  onEnd(signal) {
    // by defaut just pass through this signal
    this.send(signal);
  }

  /**
   * override by the subclass: process error
   * @param  {Signal} signal the signal contains the error
   * @return {Node}       current node
   */
  onError(signal) {
    // by default just pass through this signal
    this.send(signal);
  }

  // ==================================================================
  //  Advanced method to override
  // ==================================================================

  /**
   * Override by the subclass: entry point to process incoming signals
   * Usually you don't need to override this method
   *
   * the default signal processing process
   * 1. call accept method, if accept, keep processing, otherwise skip the signal
   * 2. do side effect with this signal by calling act method
   * 2. call process method to process the signal, and generate new signal
   * @param  {Signal} signal the incoming signal
   */
  onSignal(signal) {
    // 1.filter
    if (!this.accept(signal)) {
      this.next();
      return;
    }
    // 2. make side effects
    this.act(signal, (error, result) => {
      if (error) throw error;
      // don't care about the result
    });
    // 3. transform the signal
    this.process(signal, (error, result) => {
      if (error) throw error;
      this.send(result);
      this.next();
    });
  }

  // ==================================================================
  //  Internal methods, DO NOT OVERRIDE
  // ==================================================================

  /**
   * DO NOT OVERRIDE
   * receive a signal and process it
   * @param  {Signal} signal - signal received
   */
  onReceive(signal) {
    // all the error handling are handled in this method, so that you don't need
    // to catch the error in your code
    if (Signal.hasError(signal)) {
      try {
        this.onError(signal);
        this.next();
      } catch (err) {
        // you have an error when calling error handler :/
        console.error(err.message);
        this.next();
      }
    } else if (Signal.isEnd(signal)) {
      try {
        this.onEnd(signal);
        // remove listeners
        this.ee.removeAllListeners(this.outgoingEvent);
        this.ee.removeAllListeners(this.incomingEvent);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      try {
        this.onSignal(signal);
      } catch (err) {
        this.send(signal.setError(err));
        this.next();
      }
    }
  }

  // ==================================================================
  //  public api, do NOT override
  // ==================================================================
  /**
   * Send an outgoing signal
   * @param  {signal} signal signal object
   * @return {Node}        current node
   */
  send(signal) {
    if (!Signal.isSignal(signal)) signal = this.newSignal(signal);
    this.ee.emit(this.outgoingEvent, signal);
    return this;
  }

  /**
   * Push an incoming signal to node
   * @param  {signal} signal signal object
   * @return {Node}        current node
   */
  push(signal) {
    if (!Signal.isSignal(signal)) signal = this.newSignal(signal);
    if (signal.get("signalType") === "watch") {
      this.watch();
    } else {
      this.ee.emit(this.incomingEvent, signal);
    }
    return this;
  }

  next() {}
  //TODO: implement this for backpressure support


  /**
   * Connect to next node
   * @param  {Node} node next node
   * @return {Node}      next node
   */
  to(node) {
    this.ee.on(this.outgoingEvent, signal => {
      node.push(signal);
    });
    this._status = "connected";
    this.poweron();
    return node;
  }

  /**
   * Create a new signal
   * @param  {object} payload signal payload
   * @return {Signal}         new signal
   */
  newSignal(payload) {
    return new Signal(payload);
  }
  signal(payload) {
    return this.newSignal(payload);
  }
}

module.exports = {
  Class: Node,
  isNode: object => {
    return typeof object === "object" && Array.isArray(object.feature) && object.feature.indexOf("Node") >= 0;
  },
  addOperator: (names, operator) => {
    function func(...args) {
      const node = operator(...args);
      return this.to(node);
    };

    if (Array.isArray(names)) {
      names.forEach(name => {
        // $FlowIgnore
        Node.prototype[name] = func;
      });
    } else {
      // $FlowIgnore
      Node.prototype[names] = func;
    }
  },
  create: delegate => {
    return class NewNode extends Node {
      constructor(options, eventemitter) {
        super(options, eventemitter);
        if (typeof delegate.watch === "function") {
          this.addFeature("Sensor");
        }

        if (typeof delegate.filter === "function") {
          this.addFeature("Filter");
        }

        if (typeof delegate.process === "function") {
          this.addFeature("Processor");
        }

        if (typeof delegate.act === "function") {
          this.addFeature("Actuator");
        }
      }

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

      poweron() {
        if (typeof delegate.poweron === "function" && this.status !== "power on") {
          return delegate.poweron.call(this);
        }
        return super.poweron();
      }

      watch() {
        if (typeof delegate.watch === "function") {
          this.addFeature("Sensor");
          return delegate.watch.call(this);
        } else {
          return super.watch();
        }
      }

      act(signal, done) {
        if (typeof delegate.act === "function") {
          this.addFeature("Actuator");
          return delegate.act.call(this, signal, done);
        } else {
          return done();
        }
      }

      accept(signal) {
        if (typeof delegate.accept === "function") {
          this.addFeature("Filter");
          return delegate.accept.call(this, signal);
        }
        return true;
      }

      process(signal, done) {
        if (typeof delegate.process === "function") {
          this.addFeature("Processor");
          return delegate.process.call(this, signal, done);
        }
        this.send(signal);
      }

      onSignal(signal) {
        if (typeof delegate.onSignal === "function") {
          this.addFeature("UserDefinedNode");
          delegate.onSignal.call(this, signal);
          super.next();
          return;
        }
        super.onSignal(signal);
      }

      onEnd(signal) {
        if (typeof delegate.onEnd === "function") {
          this.addFeature("EndHandler");
          return delegate.onEnd.call(this, signal);
        } else {
          super.onEnd(signal);
        }
      }

      onError(signal) {
        if (typeof delegate.onError === "function") {
          this.addFeature("ErrorHandler");
          return delegate.onError.call(this, signal);
        } else {
          super.onError(signal);
        }
      }
    };
  }
};