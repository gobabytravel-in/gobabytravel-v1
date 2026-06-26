class Stream {
  constructor() {}
  on() { return this; }
  once() { return this; }
  emit() { return this; }
  removeListener() { return this; }
  removeAllListeners() { return this; }
  pipe() { return this; }
  write() { return true; }
  end() {}
  destroy() {}
}

class Duplex extends Stream {
  constructor(opts) { super(); this.readable = true; this.writable = true; }
}

class Readable extends Stream {
  constructor(opts) { super(); this.readable = true; }
}

class Writable extends Stream {
  constructor(opts) { super(); this.writable = true; }
}

class Transform extends Duplex {}
class PassThrough extends Transform {}

module.exports = Stream;
module.exports.Stream = Stream;
module.exports.Readable = Readable;
module.exports.Writable = Writable;
module.exports.Duplex = Duplex;
module.exports.Transform = Transform;
module.exports.PassThrough = PassThrough;
