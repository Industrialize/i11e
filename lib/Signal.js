
const uuid = require("node-uuid");
const Immutable = require('immutable');

const TAGS = {
  GLOSSARY: "glossary",
  SCOPE: "scope"
};

class Signal {

  constructor(payload) {
    if (Immutable.Iterable.isIterable(payload)) {
      this._immutable = payload;
    } else if (payload instanceof Error) {
      this._immutable = Immutable.fromJS({
        __type__: "Signal",
        _seq: uuid.v1(),
        _end: false,
        _payload: null,
        _tags: {}
      }).set("_error", payload);
    } else {
      this._immutable = Immutable.fromJS({
        __type__: "Signal",
        _seq: uuid.v1(),
        _error: null,
        _end: false,
        _payload: payload,
        _tags: {}
      });
    }
  }

  get __type__() {
    return this._immutable.get("__type__");
  }

  /**
   * the unique identifier of the signal
   * @return {String} the sequence of the signal
   */
  get seq() {
    return this._immutable.get("_seq");
  }

  /**
   * alias of seq, the unique identifier of the signal
   * @return {String} the id of the signal
   */
  get id() {
    return this._immutable.get("_seq");
  }

  /**
   * The payload of the signal
   * @return {any} the payload of the signal
   */
  get payload() {
    let value = this._immutable.get("_payload");
    if (Immutable.Iterable.isIterable(value)) {
      return value.toJS();
    }
    return value;
  }

  /**
   * The error in the signal if any
   * @return {Error | null} the error object or null
   */
  get error() {
    return this._immutable.get("_error");
  }

  /**
   * If the signal is an END signal
   * @return {boolean} true if it is an END signal, otherwise false
   */
  get end() {
    return this._immutable.get("_end");
  }

  /**
   * The tags in the signal
   * @return {Map} the tags map
   */
  get tags() {
    let value = this._immutable.get("_tags");
    if (Immutable.Iterable.isIterable(value)) {
      return value.toJS();
    }
    return value;
  }

  /**
   * Create a new signal with the same sequence number
   * @param  {Any} payload - payload object of the signal
   * @return {Signal}         the new signal
   */
  new(payload) {
    let seq = this.seq;
    return new Signal(payload).setSeq(seq);
  }

  get(path) {
    let keyPath = [];
    if (typeof path === "string") {
      keyPath = path.split(".");
    } else {
      keyPath = path;
    }
    keyPath.unshift("_payload");

    let value = this._immutable.getIn(keyPath);
    if (Immutable.Iterable.isIterable(value)) return value.toJS();
    return value;
  }

  set(path, value) {
    let keyPath = [];
    if (typeof path === "string") {
      keyPath = path.split(".");
    } else {
      keyPath = path;
    }
    keyPath.unshift("_payload");
    return new Signal(this._immutable.setIn(keyPath, value));
  }

  setPayload(payload) {
    return new Signal(this._immutable.set("_payload", payload));
  }

  del(path) {
    let keyPath = [];
    if (typeof path === "string") {
      keyPath = path.split(".");
    } else {
      keyPath = path;
    }
    keyPath.unshift("_payload");

    return new Signal(this._immutable.deleteIn(keyPath));
  }

  getTag(name) {
    let value = this._immutable.getIn(["_tags", name]);
    if (Immutable.Iterable.isIterable(value)) {
      return value.toJS();
    }
    return value;
  }

  setTag(name, tag) {
    return new Signal(this._immutable.setIn(["_tags", name], tag));
  }

  delTag(name) {
    return new Signal(this._immutable.deleteIn(["_tags", name]));
  }

  setSeq(seq) {
    return new Signal(this._immutable.set("_seq", seq));
  }

  setError(error) {
    return new Signal(this._immutable.set("_error", error));
  }

  setEnd(end) {
    return new Signal(this._immutable.set("_end", end));
  }

  /**
   * Check is there is an error in the signal
   * @return {Boolean}        true if there is an Error in signal, otherwise false
   */
  hasError() {
    if (this.error instanceof Error) {
      return true;
    }
    return false;
  }

  /**
   * Check if an object is an END signal or not
   * @return {Boolean}        true if object is an END signal, otherwise false
   */
  isEnd() {
    if (this.end) {
      return true;
    }
    return false;
  }

  /**
   * Check if an object is a signal
   * @param  {Any}  signal - object to be checked
   * @return {Boolean}        true if the object is a signal, otherwise false
   */
  static isSignal(signal) {
    if (typeof signal === "object" && signal.__type__ === "Signal") {
      return true;
    }
    return false;
  }

  /**
   * Check is there is an error in the signal
   * @param  {Signal}  signal - the signal to Check
   * @return {Boolean}        true if there is an Error in signal, otherwise false
   */
  static hasError(signal) {
    if (typeof signal === "object" && signal.error instanceof Error) {
      return true;
    }
    return false;
  }

  /**
   * Check if an object is an END signal or not
   * @param  {any}  signal - object to be tested
   * @return {Boolean}        true if object is an END signal, otherwise false
   */
  static isEnd(signal) {
    if (typeof signal === "object" && signal.end) return true;
    return false;
  }

  /**
   * create an error signal
   * @param {Error} error - error object
   * @return {Signal} the error signal
   */
  static Error(error) {
    let _err = error;
    if (typeof error === "string") {
      _err = new Error(error);
    }
    return new Signal(error);
  }

  /**
   * create an end signal
   * @return {Signal} the end signal
   */
  static End() {
    let signal = new Signal();
    return signal.setEnd(true);
  }

}

module.exports = Signal;