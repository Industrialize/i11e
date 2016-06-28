var submitSensor = i11e.fromDOMEvent(document.getElementById("submit-btn"), "click");

submitSensor
  .throttle(500)
  .p((signal, done) => {
    done(null,
      signal
        .set("firstName", document.getElementById("first_name").value)
        .set("lastName", document.getElementById("last_name").value)
    )
  })
  .p((signal, done) => {
    var firstName = signal.get("firstName");
    var lastName = signal.get("lastName");

    let error = null;

    if (!firstName || firstName === "") {
      error = new Error("No first name!");
    }

    if (!lastName || lastName === "") {
      error = new Error("No last name!");
    }

    done(error, signal);
  })
  .a((signal, done) => {
    var firstName = signal.get("firstName");
    var lastName = signal.get("lastName");
    console.log(`Hello, ${firstName} ${lastName}`);
    done();
  })
  .a((signal, done) => {
    console.log(signal.payload);
    done();
  })
  .errors((signal) => {
    console.error(signal.error.message);
  });

submitSensor.poweron();
