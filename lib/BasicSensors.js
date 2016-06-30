
const Sensor = require("./Sensor");
const Signal = require("./Signal");

const ListSensor = Sensor.create({
  watch() {
    this.options.forEach(v => {
      this.send(new Signal(v));
    });
    this.send(Signal.End());
  }
});

const JustSensor = Sensor.create({
  watch() {
    this.send(new Signal(this.options));
    this.send(Signal.End());
  }
});

module.exports = {
  ofList(elements) {
    return new ListSensor(elements);
  },

  just(element) {
    return new JustSensor(element);
  }
};