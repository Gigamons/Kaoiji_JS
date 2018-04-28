const Token = require('./Token');
const PacketStreams = require('./PacketStreams');
const crypto = require('../common').Crypto;
const OsuBuffer = require('../main_modules/osu-buffer');
const OsuPacket = require('../main_modules/osu-packet');

let mpLobbys = [];

function joinLobby(token) {
  const w = new OsuPacket.Bancho.Writer;
  for (let i = 0; i < mpLobbys.length; i++) {
    const mplob = mpLobbys[i];
    if (mplob.hidden === true)
      continue;

    w.MatchNew(mplob);
  }
  PacketStreams.addUsertoStream("lobby", token);
  Token.BroadcastToToken(token, w.toBuffer, true);
}

function leaveLobby(token) {
  const w = new OsuPacket.Bancho.Writer();
  for (let i = 0; i < mpLobbys.length; i++) {
    w.MatchDisband(i);
  }
  PacketStreams.removeUserFromStream("lobby", token)
  Token.BroadcastToToken(token, w.toBuffer);
}

function creatempLobby(token, data) {
  try {
    const w = new OsuPacket.Bancho.Writer();
    const t = Token.getDatabyUserToken(token);
    if(data.gamePassword == '')
      data.gamePassword == null;
    let l = {
      matchId: mpLobbys.length,
      inProgress: false,
      matchType: 0,
      activeMods: 0,
      gameName: data.gameName,
      gamePassword: data.gamePassword,
      beatmapName: data.beatmapName,
      beatmapId: data.beatmapId,
      beatmapChecksum: data.beatmapChecksum,
      slots: data.slots,
      host: t.general.UserID,
      playMode: 0,
      matchScoringType: 0,
      matchTeamType: 0,
      specialModes: 0,
      hidden: false,
      seed: data.seed
    }
    for (let i = 0; i < l.slots.length; i++) {
      let s = l.slots[i];
      s.mods = 0;
    }
    w.MatchNew(l);
    PacketStreams.addStream('mp_' + l.matchId)
    PacketStreams.BroadcastToStream('lobby', w.toBuffer, undefined, true);
    mpLobbys.push(l);

    joinmpLobby(token, {matchId: l.matchId, gamePassword: l.gamePassword})

  } catch (ex) {
    console.error(ex)
  }
}

function updatempLobby(token, data, force = false) {
  const w = new OsuPacket.Bancho.Writer();
}

function deletempLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
}

function joinmpLobby(token, data) {
  const w = new OsuPacket.Bancho.Writer();
  const w2 = new OsuPacket.Bancho.Writer();
  const lobby = mpLobbys[data.matchId];
  const t = Token.getDatabyUserToken(token);

  if(lobby.gamePassword === data.gamePassword || lobby.gamePassword == null || lobby.gamePassword === '' || lobby.gamePassword == undefined) {
    let full = true;
    for (let i = 0; i < lobby.slots.length; i++) {
      const slot = lobby.slots[i];
      if(slot.playerId !== -1  || slot.status === 2)
        continue;
      full = false;
      slot.playerId = t.general.UserID;
      slot.status = 4;
      break;
    }

    w.MatchJoinSuccess(lobby);
    w2.MatchUpdate(lobby);
    if(full) {
      w.buffer.buffer = new Buffer('');
      w2.buffer.buffer = new Buffer('');
      w.MatchJoinFail();
    }
    PacketStreams.BroadcastToStream('lobby', w2.toBuffer, undefined, true);
    Token.BroadcastToToken(token, w.toBuffer, true);
  } else {
    w.MatchJoinFail();
    Token.BroadcastToToken(token, w.toBuffer, true);
  }
}

function leavempLobby(token) {
  const writer = new OsuPacket.Bancho.Writer();
  const t = Token.getDatabyUserToken(token);
  for (let i = 0; i < mpLobbys.length; i++) {
    const lobby = mpLobbys[i];
    for (let w = 0; w < lobby.slots.length; w++) {
      const slot = lobby.slots[w];
      if (slot.playerId !== t.general.UserID)
        continue;
        
      slot.playerId = -1;
      slot.mods = 0;
      slot.team = 0;
      slot.status = 1;
      for (let x = 0; x < lobby.slots.length; x++) {
        const c = lobby.slots[x];
        if (c === -1)
          continue;
        allempty = false;
        break;
      }
      if (allempty) {
        lobby.hidden = true;
        writer.MatchDisband(i);
      }
      writer.MatchUpdate(lobby);
    }
  }
  PacketStreams.BroadcastToStream('lobby', writer.toBuffer);

}

function changeSlot(token, data) {
  const w = new OsuPacket.Bancho.Writer();
  const t = Token.getDatabyUserToken(token);
  for (let i = 0; i < mpLobbys.length; i++) {
    const lobby = mpLobbys[i];
    for (let s = 0; s < lobby.slots.length; s++) {
      const slot = lobby.slots[s];
      if(lobby.slots[data].playerId !== -1 || lobby.slots[data].status === 2)
        return;

      lobby.slots[data].playerId = t.general.UserID
      lobby.slots[data].status = 4;
      lobby.slots[data].mods = slot.mods;
      lobby.slots[data].team = slot.team;

      slot.playerId = -1;
      slot.status = 1;
      slot.mods = 0;
      slot.team = 0;

      console.log(updatematch(lobby))
      PacketStreams.BroadcastToStream('lobby', updatematch(lobby), undefined, true);
    }
  }
}

function updatematch(data) {
  const ob = new OsuBuffer();
  ob.WriteUInt16(data.matchId);
  ob.WriteInt8(Number(data.inProgress));
  ob.WriteByte(0);
  ob.WriteUInt32(data.mods);
  ob.WriteOsuString(data.gameName);
  ob.WriteOsuString(data.gamePassword);
  for (let i = 0; i < data.slots; i++) {
    const slot = data.slots[i];
    ob.WriteInt8(slot.status);
  }
  for (let i = 0; i < data.slots; i++) {
    const slot = data.slots[i];
    ob.WriteInt8(slot.team);
  }
  for (let i = 0; i < data.slots; i++) {
    const slot = data.slots[i];
    ob.WriteUInt32(slot.playerId);
  }
  ob.WriteInt32(data.host);
  ob.WriteUInt8(data.playMode);
  ob.WriteUInt8(data.matchScoringType);
  ob.WriteUInt8(data.matchTeamType);
  ob.WriteUInt8(data.specialModes);

  for (let i = 0; i < data.slots; i++) {
    ob.WriteUInt32(data.slots[i].mods)
  }
  ob.WriteUInt32(data.seed);
  
  const reader = new OsuPacket.Client.Reader(ob.buffer)
  console.dir(reader.Parse());
  return ob.buffer;
}

module.exports = {
  mpLobbys,
  joinLobby,
  leaveLobby,
  creatempLobby,
  deletempLobby,
  updatempLobby,
  changeSlot,
  joinmpLobby,
  leavempLobby
}