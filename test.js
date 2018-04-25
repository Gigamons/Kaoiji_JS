const redis = require("redis");
redisclient = redis.createClient();

const mysql = require("mysql");
const conf = require("./config.js");
const fs = require("fs");

const mysqlserv = mysql.createConnection({
  host     : conf.mysql.host,
  user     : conf.mysql.username,
  password : conf.mysql.password
});

if(!fs.existsSync('config.js')) {
  fs.createReadStream('config_example.js')
  console.log("You forgot to rename config_example.js to config.js please do it now.");
  setTimeout(() => {
    process.exit(0)
  }, 500);
}

mysqlserv.connect(function(err) {
  if (err) {
    console.error("Hmm... is mysql online? there was a error running it." + err);
    process.exit(0)
    return;
  }

redisclient.on("error", function (err) {
    console.log("Hmm.. is redis online? there was a error running it." + err);
    process.exit(0)
});

console.log("Connected on" + mysqlserv.threadId);