'use strict';

const Token = require('./Token');

let Streams = []

function getStreambyName(StreamName) {
  for (let i = 0; i < Streams.length; i++) {
    const e = Streams[i];
    if (e.name === StreamName)
      return e
  }
}

function BroadcastToStream(StreamName, buffer = new Buffer(''), token) {
  for (let i = 0; i < Streams.length; i++) {
    const e = Streams[i];
    if (e.name === StreamName) {
      for (let y = 0; y < e.users.length; y++) {
        const user = e.users[y];
        if(!user)
          continue;
        if (token) {
          if (user.token === token) {
            continue;
          } else {
            Token.BroadcastToToken(user.token, buffer);
          }
        } else {
          Token.BroadcastToToken(user.token, buffer);
        }
      }
    }
  }
}

function addStream(StreamName) {
  let streamexists = false;
  for (let i = 0; i < Streams.length; i++) {
    const e = Streams[i];
    if (e.name === StreamName) {
      streamexists = true;
      break;
    }
  }
  if (streamexists === false)
    Streams.push(StreamOBJECT([StreamName]));
}

function removeStream(StreamName) {
  for (let i = 0; i < Streams.length; i++) {
    const e = Streams[i];
    if (e.name === StreamName)
      Streams.splice(i, 1);
  }
}

function addUsertoStream(StreamName, TokenOBJ) {
  const s = getStreambyName(StreamName);
  if (s) {
    s.users.push(TokenOBJ);
    return true;
  } else {
    return false;
  }
}

function removeUserFromStream(StreamName, token) {
  const s = getStreambyName(StreamName);
  if (s) {
    for (let i = 0; i < s.users.length; i++) {
      const e = s.users[i];
      if (!e)
        continue;
      if (e.token === token) {
        s.users.splice(i, 1);
      }
    }
    return true;
  } else {
    for (let y = 0; y < Streams.length; y++) {
      const e = Streams[e];
      for (let i = 0; i < e.users.length; i++) {
        const c = e.users[i];
        if (c.token === token) {
          e.users.splice(i, 1);
        }
      }
    }
    return false;
  }
}

function StreamOBJECT(arr) {
  return {
    name: String(arr[0]),
    spectator: false, // TODO use this?
    multiplayer: false, // TODO use this?
    users: []
  }
}

module.exports = {
  addStream,
  removeStream,
  getStreambyName,
  addUsertoStream,
  removeUserFromStream,
  BroadcastToStream
}