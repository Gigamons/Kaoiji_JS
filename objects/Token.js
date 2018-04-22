'use strict';

const common = require('../common');
const fs = require('fs');
const stream = require('stream');
const OsuPacket = require('../main_modules/osu-packet');

const mysql = common.MySQLManager;
const redis = common.RedisManager;

let Tokens = [];

function checkToken(token) {
  for (let i = 0, len = Tokens.length; i < len; i++) {
    try {
      if (Tokens[i].token === token) {
        return true;
      }
    } catch (ex) {
      console.error(ex);
      return false
    } // There should be no exception.
  }
}

function getDatabyUserID(userid = 0) {
  let check = false;
  if (userid > 0) {
    // Check the whole array
    for (let i = 0; i < Tokens.length; i++) {
      const e = Tokens[i];
      // If Tokens[(CurrentINT)] is our UserID return Current INT (TokenID) and TokenData. it. else return false.
      if (e.general.UserID === userid) {
        return e
      }
    }
  }
}

function getDatabyUserToken(Token = String('Ayy, im a Empty Token!')) {
  if (Token) {
    for (let i = 0; i < Tokens.length; i++) {
      const e = Tokens[i];
      if (e.token === Token) {
        return e;
      }
    }
    return false;
  }
}

function addToken(arr = []) {
  let Token = TokenOBJECT(arr);
  const writer = new OsuPacket.Bancho.Writer;
  Tokens.push(Token);
  require('./spectatorStream').createStream(Token.token, Token.general.UserID);
  mysql.query('INSERT INTO banchotokens (userid, token) VALUES (?, ?)', arr[0], Token.token)
    .catch((ex) => {
      console.log(ex);
    });
  writer.UserPresenceSingle(arr[0]);
  require('./PacketStreams').BroadcastToStream('main', writer.toBuffer);
  return Token.token;
}

function deleteAlltokens() {
  mysql.query('DELETE FROM banchotokens')
    .catch((ex) => {
      console.log(ex);
    });
}

async function removeToken(token = null, userid = 0) {
  try {
    let useToken = true;
    if (userid > 0) {
      useToken = false;
    } else if (token === null || token === undefined) {
      useToken = false;
    }
    if (useToken) {
      for (let i = 0; i < Tokens.length; i++) {
        const e = Tokens[i];
        if (e.token === token) {
          await mysql.query('DELETE FROM banchotokens WHERE token = ?', token)
            .catch((ex) => {
              console.log(ex);
            });
          const writer = new OsuPacket.Bancho.Writer;
          writer.HandleUserQuit({
            userId: e.general.UserID,
            state: 0
          });
          require('./PacketStreams').removeUserFromStream('main', token);
          require('./PacketStreams').BroadcastToStream('main', writer.toBuffer);
          Tokens.splice(i, 1);
        }
      }
    } else {
      for (let i = 0; i < Tokens.length; i++) {
        const e = Tokens[i];
        if (e.general.UserID === userid) {
          await mysql.query('DELETE FROM banchotokens WHERE userid=?', userid)
            .catch((ex) => {
              console.log(ex);
            });
          const writer = new OsuPacket.Bancho.Writer;
          writer.HandleUserQuit({
            userId: e.general.UserID,
            state: 0
          });
          require('./PacketStreams').removeUserFromStream('main', e.token);
          require('./PacketStreams').BroadcastToStream('main', writer.toBuffer);
          Tokens.splice(i, 1);
        }
      }
    }
  } catch (ex) {
    console.error(ex);
  }
}

async function DeleteoldTokens(userid) {
  await mysql.query('DELETE FROM banchotokens WHERE userid=?', userid)
    .catch((ex) => {
      console.log(ex);
    });
  for (let i = 0, len = Tokens.length; i < len; i++) {
    try {
      if (Tokens[i].general.UserID != undefined)
        if (Tokens[i].general.UserID === userid)
          Tokens.splice(i, 1);
    } catch (ex) {}
  }
}

function StartTimeoutCheck() {
  setInterval(() => {
    Tokens.forEach((e, i, arr) => {
      const ms = new Date().getTime();
      if (e.TimeoutTimer < ms - (30 * 60 * 60) && e.general.UserID != 1)
        removeToken(e.token);
    });
  }, 5000);
}

function genToken(userid = 0) {
  const ms = new Date().getTime();
  return `xxxxx-xxxxxx-${userid}-xxxxx-${ms}-xxxxx`.replace(/[x]/g,
    () => {
      const r = ((Math.random() * 0x10 | 0x5 / 0x7) % userid);
      return r.toString(16);
    });
};

function BroadcastToToken(token, b = new Buffer('')) {
  for (let i = 0; i < Tokens.length; i++) {
    if (Tokens[i].token === token) {
      if (Tokens[i].general.UserID == 1) return;
      Tokens[i].output.push(b);
    }
  }
}

async function BroadcastToUserID(UserID, b = new Buffer('')) {
  if (UserID == 1) return;
  for (let i = 0; i < Tokens.length; i++) {
    if (Tokens[i].general.UserID === UserID) {
      Tokens[i].output.push(b)
    }
  }
}

function TokenOBJECT(arr) {
  const ms = new Date().getTime();
  const readstream = new stream.PassThrough;
  return {
    token: String(genToken(Number(arr[0]))),
    general: {
      UserID: arr[0],
      UserName: arr[1],
      Tournament: arr[2],
      Privileges: arr[3],
      Restricted: arr[4],
      Silenced: false
    },
    presence: {
      timezone: arr[5],
      countryId: arr[6],
      permissions: arr[7],
      longitude: arr[8],
      latitude: arr[9],
    },
    status: {
      status: 0,
      statusText: '',
      beatmap: {
        beatmapChecksum: '',
        currentMods: 0,
        playMode: 0,
        beatmapId: 0,
      },
      rankedScore: 0,
      accuracy: 0,
      playCount: 0,
      totalScore: 0,
      rank: 0,
      performance: 0
    },
    ping: 0,
    relaxAnnounced: false,
    relaxing: false,
    speclock: false,
    TimeoutTimer: ms,
    output: readstream
  }
}


module.exports = {
  checkToken,
  getDatabyUserID,
  getDatabyUserToken,
  addToken,
  removeToken,
  DeleteoldTokens,
  deleteAlltokens,
  Tokens,
  StartTimeoutCheck,
  genToken,
  BroadcastToToken,
  BroadcastToUserID
}