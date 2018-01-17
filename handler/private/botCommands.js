const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');
const PacketStreams = require('../../objects/PacketStreams');
const EventTools = require('../../common').EventTool;
const UserTools = require('../../common').UserTools;
const config = require('../../config');
const vm = require('vm');

function alert(msg = [], channel, description = 'Haitai') {
    const writer = new OsuPacket.Bancho.Writer;
    let fullmsg = '';
    for (let i = 0; i < msg.length; i++) {
        const element = msg[i];
        fullmsg += ' '+element;
    }
    fullmsg = fullmsg.slice(1);

    if(fullmsg === null || fullmsg === undefined || fullmsg === '' || fullmsg.startsWith(' ')) {
        writer.SendMessage({
            sendingClient: config.Bancho.BotName,
            message: description,
            target: channel,
            senderId: 100
        })
        PacketStreams.BroadcastToStream('main', writer.toBuffer);
        return;
    }
    writer.Announce(fullmsg);
    PacketStreams.BroadcastToStream('main', writer.toBuffer);
}

async function math(args = [], channel, description = 'Haitai') {
    const writer = new OsuPacket.Bancho.Writer;
    let fullmsg = '';
    for (let i = 0; i < args.length; i++) {
        const element = args[i];
        if(i == 0)
            fullmsg += element;
        else fullmsg += element;
    }

    if(fullmsg === null || fullmsg === undefined || fullmsg === '' || fullmsg.startsWith(' ')) {
        writer.SendMessage({
            sendingClient: config.Bancho.BotName,
            message: description,
            target: channel,
            senderId: 100
        });
        PacketStreams.BroadcastToStream('main', writer.toBuffer);
        return;
    }
    let virt = vm.createContext();
    let runnedvm;
    try {
        runnedvm = vm.runInNewContext(`let channel = \`${channel}\`;
        ${fullmsg}
        `, virt, {displayErrors: false, timeout: 1000});
    } catch (ex) {
        runnedvm = ex.toString();
    }

    if(runnedvm == null || runnedvm == NaN || runnedvm == undefined)
        runnedvm = 'No output.';
    
    writer.SendMessage({
        sendingClient: config.Bancho.BotName,
        message: String(runnedvm),
        target: channel,
        senderId: 100
    });

    PacketStreams.BroadcastToStream('main', writer.toBuffer);
}

async function kick(args = [], channel, description = 'Haitai') {
    const writer = new OsuPacket.Bancho.Writer;
    const toKickUser = args[0];

    if(toKickUser === null || toKickUser === undefined || toKickUser === '' || toKickUser.startsWith(' ')) {
        writer.SendMessage({
            sendingClient: config.Bancho.BotName,
            message: description,
            target: channel,
            senderId: 100
        })
        PacketStreams.BroadcastToStream('main', writer.toBuffer);
        return;
    }

    const UserID = await UserTools.getuserid(toKickUser);
    EventTools.WriteKick(UserID, null);
}

module.exports = {
    alert,
    kick,
    math
}