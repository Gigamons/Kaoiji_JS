const cluster = require('cluster');

let timeout = new Date().getTime() + 1000*5; // 5 secs

require('./server');
