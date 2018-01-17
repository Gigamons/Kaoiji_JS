const request = require('request');

function getDatabyIP(ip) {
    return new Promise((resolve, reject) => {
        request.get('http://ip-api.com/json/'+ip, (err, res, b) => {
            try {
                if(err) reject(err);
                else if(b) resolve(JSON.parse(b));
            } catch(ex){
                reject(ex);
            }
        });
    });
}

module.exports = getDatabyIP;