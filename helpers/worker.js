const base64 = require('urlsafe-base64');
const child_process = require('child_process');

function spawnWorker (file, json, callback){
    let j = base64.encode(new Buffer(json));
    let child = child_process.spawn('node', [file, j]);
    let o = '';
    child.stdout.on('data', (data) => {
      o += data;
      if(file === 'server.js'){
          console.log(data.toString());
      }
    });
    child.on('exit', function (code, signal) {
        if(o.startsWith('out:')){
            let Json = o.split('out:')[1].replace('\n', '');
            let d = JSON.parse(base64.decode(Json));
            callback(null, d);
            return;
        } else {
            callback(null, o);
        }
        if(Number(code) > 1)
            callback(o, null);
    });
    child.on('error', (err)=>{
      callback(err, null);
    });
}

module.exports = {
    spawnWorker
};