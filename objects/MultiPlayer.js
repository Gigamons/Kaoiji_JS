const Token = require('./Token');
const PacketStreams = require('./PacketStreams');
const OsuPacket = require('../main_modules/osu-packet');

let mpLobbys = [];

function joinLobby(token) {
  const w = new OsuPacket.Bancho.Writer();
  for (let i = 0; i < mpLobbys.length; i++) {
    const mplob = mpLobbys[i];
    w.MatchNew(mplob);
  }
  PacketStreams.addUsertoStream("lobby", token);
  Token.BroadcastToToken(token);
}

function leaveLobby(token) {
  const w = new OsuPacket.Bancho.Writer();
  for (let i = 0; i < mpLobbys.length; i++) {
    const mplob = mpLobbys[i];
    w.MatchDisband(mplob);
  }
  PacketStreams.removeUserFromStream("lobby", token)
}

function creatempLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
  const 
}

function deletempLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
}

function joinmpLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
}

function leavempLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
}