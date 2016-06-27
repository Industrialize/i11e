exports["test basic sensors"] = {
  "test ofList" : (test) => {
    const Lib = require("../lib/index");

    let sum = 0;
    let sensor = Lib.ofList([1, 2, 3, 4, 5, 6, 7]);

    sensor
      .a((signal, done) => {
        done();
      })
      .p((signal, done) => {
        sum += signal.payload;
        done(null, signal.new(sum));
      })
      .n({
        onEnd(signal) {
          test.equal(sum, 28);
          test.done()
        }
      });

    sensor.watch();
  }
}
