const fs = require('fs');
if(!fs.existsSync('config.js')) {
  fs.createReadStream('config_example.js').pipe(fs.createWriteStream('config.js'));
  console.log("You forgot to copy config_example.js to config.js");
  console.log("We copyd it for you! Just edit config.js with any kind of Editor. E.G Nano!");
  setTimeout(() => {
    process.exit(0)
  }, 500);
} else
require('./server');
