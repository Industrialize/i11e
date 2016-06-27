// @flow
const Sensor = require("./Sensor");
const Signal = require("./Signal");

const ListSensor = Sensor.create({
  watch() {
    this.options.forEach((v) => {
      this.send(new Signal(v));
    });
    this.send(Signal.End());
  }
});

module.exports = {
  ofList(elements : [any]) : Sensor.Class {
    return new ListSensor(elements);
  }
}
