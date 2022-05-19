const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

export default myEmitter

// myEmitter.on('event', () => {
//   console.log('an event occurred!');
// });
// myEmitter.emit('event');
