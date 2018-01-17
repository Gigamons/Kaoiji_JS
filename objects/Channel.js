const Token = require('../objects/Token');
const OsuPacket = require('../main_modules/osu-packet');
const common = require('../common');

let channels = [];

function JoinChannel(token, channel = '#osu') {
    const writer = new OsuPacket.Bancho.Writer;
    const TokenData = Token.getDatabyUserToken(token);
    if(TokenData){
        const PrivilegePerm = TokenData[1].general.Privileges;
        const info = channelInfo(channel);
        if(channelExists(channel)){
            if(channelAdminOnly(channel)){
                if(common.PrivilegeHelper.hasPrivilege(PrivilegePerm, common.Privileges.BAT)){
                    writer.ChannelJoinSuccess(channel);
                    Token.BroadcastToToken(token, writer.toBuffer)
                    channels[info[0]].JoinedUsers.push(JoinedUsersOBJECT([TokenData[1].general.UserID, TokenData[1].general.UserName, TokenData[1].token]))
                    return writer.toBuffer;
                } else {
                    writer.ChannelRevoked(channel);
                    writer.CommandError();
                    writer.Unauthorised();
                    Token.BroadcastToToken(token, writer.toBuffer)
                    return writer.toBuffer;
                }
            } else {
                writer.ChannelJoinSuccess(channel);
                Token.BroadcastToToken(token, writer.toBuffer)
                channels[info[0]].JoinedUsers.push(JoinedUsersOBJECT([TokenData[1].general.UserID, TokenData[1].general.UserName, TokenData[1].token]))
                return writer.toBuffer;
            }
        } else {
            writer.ChannelRevoked(channel);
            writer.CommandError();
            writer.Unauthorised();
            Token.BroadcastToToken(token, writer.toBuffer);
            return writer.toBuffer;
        }
    }
}

function LeaveChannel(token, channel = '#osu') {
    const writer = new OsuPacket.Bancho.Writer;
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
        if(e.ChannelName == channel){
            for (let y = 0; y < e.JoinedUsers.length; y++) {
                const c = e.JoinedUsers[y];
                if(c.UserToken == token){
                    e.JoinedUsers.splice(y, 1);
                    writer.ChannelRevoked(channel);
                    Token.BroadcastToToken(Token, writer.toBuffer)
                }
            }
        }
    }
}

function channelAdminOnly(channel = '#osu') {
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
        if(e.ChannelName == channel){
            if(e.Status.AdminOnly) return true;
            else return false;
        }
    }
}

function channelReadOnly(channel = '#osu') {
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
        if(e.ChannelName == channel){
            if(e.Status.ReadOnly) return true;
            else return false;
        }
    }
}

function channelExists(channel = '#osu') {
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
        if(e.ChannelName == channel)
            return true;
    }
}

function channelInfo(channel = '#osu') {
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
            if(e.ChannelName == channel)
                return [
                    i, e
                ];
    }
}

function FirstChannelPacket(token) {
    const OsuPacket = require('../main_modules/osu-packet');
    const writer = new OsuPacket.Bancho.Writer;
    const UserPrivileges = Token.getDatabyUserToken(token)[1].general.Privileges;
    writer.ChannelListingComplete();
    for (let i = 0; i < channels.length; i++) {
        const element = channels[i];
        if(element.AdminOnly && common.PrivilegeHelper.hasPrivilege(UserPrivileges, common.Privileges.BAT)){
            writer.ChannelAvailable({
                channelName: element.ChannelName,
                channelTopic: element.ChannelDescription,
                channelUserCount: 0
            });
        } 
        else if(element.AdminOnly && !common.PrivilegeHelper.hasPrivilege(UserPrivileges, common.Privileges.BAT)){}
        else {
            writer.ChannelAvailable({
                channelName: element.ChannelName,
                channelTopic: element.ChannelDescription,
                channelUserCount: 0
            });
        }
    }
    Token.BroadcastToToken(token);
    JoinChannel(token, '#osu');
    JoinChannel(token, '#announce');
    return writer.toBuffer;
}
/**
 * arr[0] = ChannelName
 * arr[1] = ChannelDescription
 * arr[2] = Show Channel
 * arr[3] = AdminOnly
 * arr[4] = ReadOnly
 * arr[5] = WriteOnly
 * arr[6] = Temp
 * arr[7] = PacketStream
 */
function createChannel(arr = []) {
    channels.push(ChannelOBJECT(arr))
}

function createDefault() {
    createChannel(['#osu', 'Osu\'s Default channel.', true, false, false, false, false, 'main'])
    createChannel(['#announce', 'Osu\'s Default channel.', true, false, true, false, false, 'main'])
    createChannel(['#userlog', 'Osu\'s Default channel.', false, false, true, false, false, 'main'])
}

function deleteChannel(channel = null) {
    for (let i = 0; i < channels.length; i++) { 
        const e = channels[i];
        if(e.ChannelName == channel){
            for (let y = 0; y < e.JoinedUsers.length; y++) {
                const c = e.JoinedUsers[y];
                LeaveChannel(c.UserToken, channel);
            }
            setTimeout(() => {
                channels.splice(i, 1);
            }, 100);
        }
    }
}

function ChannelOBJECT(arr = []) {
    return {
        ChannelName: arr[0], // Channel Name? E.G "#osu"
        ChannelDescription: arr[1], // Channel Description? E.G "Hi, i'm a Description"
        Status: {
            ShowChannel: arr[2], // Should it join in ChannelList?
            AdminOnly: arr[3], // Admin Only?
            ReadOnly: arr[4], // Read Only? (Dont affect admins.)
            WriteOnly: arr[5], // Write Only? Nobody can read, only write. (Dont affect admins.)
            Temporary: arr[6], // Is the channel Temporary? means it get deleted after everything leaved OR server is restarted OR whatever i'll do.
            Stream: arr[7], // PacketStream, Like 'Main'
            moderated: false // ofc false, becourse this channel just got created.
        },
        JoinedUsers: []
    }
}

function JoinedUsersOBJECT(arr = []) {
    return {
        UserID: arr[0],
        UserName: arr[1],
        UserToken: arr[2]
    }
}
module.exports = {
    JoinChannel,
    LeaveChannel,
    channelAdminOnly,
    channelReadOnly,
    channelExists,
    channelInfo,
    createDefault,
    createChannel,
    FirstChannelPacket,
    deleteChannel
}