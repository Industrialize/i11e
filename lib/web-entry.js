window.i11e = require("./index.js");

window.i11e.fromDOMEvent = (element, event) => {
  let DOMEventSensor = window.i11e.createSensor({
    watch() {
      element.addEventListener(event, () => {
        this.send({
          event: event,
          sourceId: element.getAttribute("id")
        });
      });
    }
  });

  return new DOMEventSensor();
};