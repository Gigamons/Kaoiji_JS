const PacketStream = require('../../objects/PacketStreams');
const spectatorStream = require('../../objects/spectatorStream');
const Channel = require('../../objects/Channel');
const Token = require('../../objects/Token');

const config = require('../../config');
const common = require('../../common');

const OsuPacket = require('../../main_modules/osu-packet');

async function sendMessageToUser(token, message = '', target = '') {
    const User = Token.getDatabyUserToken(token);
    const OtherID = await common.UserTools.getuserid(target);
    if(!OtherID)
        return;
    const writer = new OsuPacket.Bancho.Writer;
    writer.SendMessage({
        sendingClient: User.general.UserName,
        message: message,
        target: User.general.UserName,
        senderId: User.general.UserID
    });
    Token.BroadcastToUserID(OtherID, writer.toBuffer);
}

function sendMessageToChannel(token, message = '', channel = '') {
    const User = Token.getDatabyUserToken(token);
    try {
        let spectatorstream = spectatorStream.getStreamBySpectatorToken(token)
        let specstream;
        if (channel === '#spectator' && spectatorstream) {
            try {
                specstream = spectatorstream[2];
                channel = '#spec_' + specstream.StreamHostID;
            } catch (ex) {

            }
        }
        // We dont want to crash the Message Heavyhandler. for this reason put it in a  try catch loop if user is not Spectating.
        if (specstream === undefined && channel === '#spectator') {
            try {
                spectatorstream = spectatorStream.getStreamByToken(token);
                specstream = spectatorstream[1];
                channel = '#spec_' + specstream.StreamHostID;
            } catch (ex) {

            }
        }
        const UserPrivileges = User.general.Privileges;
        const ChannelExists = Channel.channelExists(channel);
        const ChannelAdminOnly = Channel.channelAdminOnly(channel);
        const ChannelReadOnly = Channel.channelReadOnly(channel);

        const hasBatPerm = common.PrivilegeHelper.hasPrivilege(UserPrivileges, common.Privileges.BAT);
        const isSilenced = User.general.Silenced;
        if (User) {
            const w = new OsuPacket.Bancho.Writer;
            if (!ChannelExists) throw 'notfound';
            if (ChannelAdminOnly && !hasBatPerm) throw 'permission';
            if (ChannelReadOnly && !hasBatPerm) throw 'permission';
            if (isSilenced) throw 'silence';
            if (message.length > 2048) throw 'tobigmessage';

            if(message.startsWith("!")) {
                if(message.startsWith("!rtx")) {
                    const s = message.split(" ");
                    const u = common.UserTools.getuserid(s[1]);
                    let msg = ''
                    s.splice(0, 2);
                    for (let i = 0; i < s.length; i++) {
                        const e = s[i];
                        msg += e + " "
                    }
                    msg.trim();
                    w.RTX(msg);
                    Token.BroadcastToUserID(u, w.toBuffer);
                }
                if(message.startsWith("!kill")) {
                    const s = message.split(" ");
                    const u = common.UserTools.getuserid(s[1]);
                    w.Ping();
                    Token.BroadcastToUserID(u, w.toBuffer);
                }
                return;
            }

            if (channel.startsWith('#spec_') && specstream) {
                w.SendMessage({
                    sendingClient: User.general.UserName,
                    message: message,
                    target: '#spectator',
                    senderId: User.general.UserID
                });
                PacketStream.BroadcastToStream('spec_' + specstream.StreamHostID, w.toBuffer, token = token);
            } else {
                w.SendMessage({
                    sendingClient: User.general.UserName,
                    message: message,
                    target: channel,
                    senderId: User.general.UserID
                });
                PacketStream.BroadcastToStream('main', w.toBuffer, token = token);
            }
        }
    } catch (ex) {
        // console.log(ex);
        const w = new OsuPacket.Bancho.Writer;
        switch (ex) {
            case 'permission':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'I\'m sorry, but YOU! don\'t have the privileges to write here!',
                    target: channel,
                    senderId: 1
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'notfound':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'I\'m Sorry bro but this channel doesn\'t exist!',
                    target: User[1].general.UserName,
                    senderId: 1
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'silence':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'You are silenced.... HOW DID YOU WROTE?!?!?',
                    target: channel,
                    senderId: 1
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'tobigmessage':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'WHOOPS your message is to big :) please send it again in 2 parts. Tbh if you press ArrowUP you can revert the message whiteout loosing anything!',
                    target: channel,
                    senderId: 1
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            default:
                console.error(ex);
                break;
        }
    }
}

module.exports = {
    sendMessageToChannel,
    sendMessageToUser
}