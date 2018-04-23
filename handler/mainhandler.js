const Token = require('../objects/Token');
const Stream = require('../objects/PacketStreams');
const sleep = require('sleep-promise');

const OsuPacket = require('../main_modules/osu-packet');

async function handlePackets(token, RawPacket) {
  const reader = new OsuPacket.Client.Reader(RawPacket);
  const writer = new OsuPacket.Bancho.Writer(RawPacket);

  const PacketData = reader.Parse();
  require('./public/pong')(token);
  for (let i = 0, len = PacketData.length; i < len; i++) {
    let Packet = PacketData[i];
    //console.dir(Packet);
    switch (Packet.id) {
      case 0:
        // Updating userstatus
        require('./public/UserStatusUpdate')(token, Packet.data)
        break;
      case 1:
        // Send message if exists and he has permission for it AND is not adminonly if user is not BAT
        require('./public/message').sendMessageToChannel(token, Packet.data.message, Packet.data.target);
        break;
      case 2:
        Token.removeToken(token);
        break;
      case 3:
        // Request StatusUpdate
        await require('./private/UpdateStatistics')(token, undefined, true)
        require('./public/requestStatusUpdate')(token);
        break;
      case 4:
        // Ping "Pong" who doesen't like it?
        let TokenData = Token.getDatabyUserToken(token);
        ++TokenData.ping;
        if (TokenData == 0) {
          await require('./private/UpdateStatistics')(token, undefined, true)
          require('./public/requestStatusUpdate')(token);
        }
        require('./public/requestStatusUpdate')(token);
        break;
      case 16:
        require('../objects/spectatorStream').joinStream(token, Packet.data)
        break;

      case 17:
        require('../objects/spectatorStream').leaveStream(token, Packet.data)
        break;
      case 18:
        const StreamID = require('../objects/spectatorStream').getStreamByToken(token)[0];
        require('../objects/spectatorStream').broadcastFrame(StreamID, Packet.data);
        break;
      case 30:
        // Well, i didn't even started working on MP yet XD
        writer.resetbuffer();
        writer.Announce('Multiplayer is not ready.');
        writer.ChannelRevoked('#lobby');
        Token.BroadcastToToken(token, writer.toBuffer);
        break;
      case 63:
        // Join channel if exists.
        require('../objects/Channel').JoinChannel(token, Packet.data);
        break;
      case 68:
        // WHY THE FUCK DOES THE CLIENT NEEDS THAT PACKET ?!? IT MAKES NO SENSE!
        // PLEASE TELL ME PEPPY!
        writer.resetbuffer();
        writer.BeatmapInfoReply();
        Token.BroadcastToToken(token, writer.toBuffer);
        break;
      case 73:
        // AddFriend
        require('./public/friends').addFriend(token, Packet.data);
        break;
      case 74:
        // RemoveFriend
        require('./public/friends').removeFriend(token, Packet.data);
        break;
      case 78:
        // Leave channel.
        require('../objects/Channel').LeaveChannel(token, Packet.data);
        break;
      case 79:
        break;
      case 85:
        require('./public/UserPresenceBundle')(token)
        for (let i = 0; i < Packet.data.length; i++) {
          const userid = Packet.data[i];
          let bot;
          if (userid === 1) bot = true;
          else bot = false;
          require('./public/UserPresence')(token, userid, bot);
          require('./public/requestStatusUpdate')(token, userid, token, bot);
        }
        break;
      default:
        console.dir(Packet);
        break;
    }
  }
}

module.exports = handlePackets;