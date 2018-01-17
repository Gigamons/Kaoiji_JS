const PacketStream = require('../objects/PacketStreams');
const spectatorStream = require('../objects/spectatorStream');
const Channel = require('../objects/Channel');
const Token = require('../objects/Token');

const config = require('../config');
const common = require('../common');
const Bot = require('../objects/Bot');

const OsuPacket = require('../main_modules/osu-packet');

function sendMessageToChannel(token, message = '', channel = '') {
    const User = Token.getDatabyUserToken(token);
    try {
        let spectatorstream = spectatorStream.getStreamBySpectatorToken(token)
        let specstream;
        if(channel == '#spectator' && spectatorstream){
            try {
                specstream = spectatorstream[2];
                channel = '#spec_'+specstream.StreamHostID;
            } catch (ex){

            }
        }
        // We dont want to crash the Message Heavyhandler. for this reason put it in a  try catch loop if user is not Spectating.
        if(specstream == undefined && channel == '#spectator'){
            try {
                spectatorstream = spectatorStream.getStreamByToken(token);
                specstream = spectatorstream[1];
                channel = '#spec_'+specstream.StreamHostID;
            } catch (ex) {

            }
        }
        const UserPrivileges = User[1].general.Privileges;
        const ChannelExists = Channel.channelExists(channel);
        const ChannelAdminOnly = Channel.channelAdminOnly(channel);
        const ChannelReadOnly = Channel.channelReadOnly(channel);

        const hasBatPerm = common.PrivilegeHelper.hasPrivilege(UserPrivileges, common.Privileges.BAT);
        const isSilenced = User[1].general.Silenced;
        if(User){
            const w = new OsuPacket.Bancho.Writer;
            if(!ChannelExists) throw 'notfound';
            if(ChannelAdminOnly && !hasBatPerm) throw 'permission';
            if(ChannelReadOnly && !hasBatPerm) throw 'permission';
            if(isSilenced) throw 'silence';
            if(message.length > 2048) throw 'tobigmessage';
            if(Bot.commandExist(message.split(' ')[0])){
                let Command = message.split(' ')[0];
                let Arguments = message.split(' ').splice(1)
                Bot.commandFunction(token, channel, User[1].general.UserName, Command, Arguments);
                return;
            }

            if(channel.startsWith('#spec_') && specstream){
                w.SendMessage({
                    sendingClient: User[1].general.UserName,
                    message: message,
                    target: '#spectator',
                    senderId: User[1].general.UserID
                });
                PacketStream.BroadcastToStream('spec_'+specstream.StreamHostID, w.toBuffer, token = token);
            } else {
                w.SendMessage({
                    sendingClient: User[1].general.UserName,
                    message: message,
                    target: channel,
                    senderId: User[1].general.UserID
                });
                w.SpectatorJoined(100);
                w.FellowSpectatorJoined(100);
                PacketStream.BroadcastToStream('main', w.toBuffer);
            } 
        }
    } catch(ex){
        // console.log(ex);
        const w = new OsuPacket.Bancho.Writer;
        switch (ex) {
            case 'permission':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'You dont have the Permission to write here. Tbh Nobody can see this message, becourse "You are S.P.E.C.I.A.L" :)',
                    target: channel,
                    senderId: 100
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'notfound':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'Sorry bro, this channel doesent exist',
                    target: User[1].general.UserName,
                    senderId: 100
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'silence':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'You are silenced.... HOW DID YOU WROTE?!?!?',
                    target: channel,
                    senderId: 100
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            case 'tobigmessage':
                w.SendMessage({
                    sendingClient: 'BananaBot',
                    message: 'WHOOPS your message is to big :) please send it again in 2 parts. Tbh if you press ArrowUP you can revert the message whiteout loosing anything!',
                    target: channel,
                    senderId: 100
                });
                Token.BroadcastToToken(token, w.toBuffer);
                break;
            default:
                console.log(ex);
                break;
        }
    }
}

module.exports = {
    sendMessageToChannel
}