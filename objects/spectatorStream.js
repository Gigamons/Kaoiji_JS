// THIS IS A SPECTATOR STREAM, LIKE A VIDEO! NOT A CIRCLE STREAM! LIKE CLICK THE CIRCLES!
const fs = require('fs');

const OsuPacket = require('../main_modules/osu-packet');
const Token = require('./Token');
const Channel = require('./Channel');
const PacketStream = require('./PacketStreams');
const userstatusrequest = require('../handler/public/requestStatusUpdate');

let Streams = [];

function createStream(token, UserID){
    const obj = {
        StreamHostID: UserID,
        StreamToken: token,
        replay: "",
        beatmapchecksum: "",
        playmode: 0,
        mods: 0,
        SpectatorList: [],
    }
    const user = Token.getDatabyUserToken(token);
    PacketStream.addStream('spec_'+UserID);
    PacketStream.addUsertoStream('spec_'+UserID, user[1]);
    Channel.createChannel([
        '#spec_'+UserID,
        'Spectator stream ID: '+UserID,
        false,
        false,
        false,
        false,
        true,
        'spec_'+UserID
    ]);
    Streams.push(obj);
}

function deleteStream(token){
    for(let i = 0, len = Streams.length; i < len; i++){
        try {
            if(Streams[i].StreamToken == token){
                PacketStream.removeStream('spec_'+Streams[i].StreamHostID);
                Streams.splice(i, 1);
            }
        }
        catch (ex){ }
    }
}

function getStreamByID(StreamHostID){
    for(let i = 0, len = Streams.length; i < len; i++){
        if(Streams[i].StreamHostID == StreamHostID){
            return [
                i, Streams[i]
            ];
        }
    }
}

function getStreamByToken(token){
    for(let i = 0, len = Streams.length; i < len; i++){
        if(Streams[i].StreamToken == token){
            return [i, Streams[i]];
        }
    }
}

function getStreamBySpectatorToken(token){
    for(let i = 0, len = Streams.length; i < len; i++){
        for(let y = 0, len = Streams[i].SpectatorList.length; y < len; y++){
            if(Streams[i].SpectatorList[y].Token == token){
                return [i, y, Streams[i]];
            }
        }
    }
}

function joinStream(token, StreamHostID){
    const user = Token.getDatabyUserToken(token);
    const Stream = getStreamByID(StreamHostID);

    if(Stream){
        if(user){
            const StreamID = Stream[0];
            const obj = {
                UserID: user.general.UserID,
                Token: user.token,
            }
            Streams[StreamID].SpectatorList.push(obj);

            const w = new OsuPacket.Bancho.Writer();
            w.SpectatorJoined(user.general.UserID);
            Token.BroadcastToUserID(StreamHostID, w.toBuffer)

            const writer = new OsuPacket.Bancho.Writer();
            writer.FellowSpectatorJoined(user.general.UserID);
            writer.ChannelJoinSuccess('#spectator');

            PacketStream.addUsertoStream('spec_'+Streams[StreamID].StreamHostID, user)
            broadCastToEveryone(StreamID, writer.toBuffer);
        }
    }
}

function cantSpec(token){
    const writer = new OsuPacket.Bancho.Writer();

    const user = Token.getDatabyUserToken(token)[1];
    const Stream = getStreamBySpectatorToken(token);
    const StreamID = Stream[0];

    // Fixed after a week.
    writer.SpectatorCantSpectate(user.general.UserID);

    broadCastToEveryone(StreamID, writer.toBuffer)
}

function leaveStream(t){
        const user = Token.getDatabyUserToken(t);
        const Stream = getStreamBySpectatorToken(t);
    if(Stream){
        const StreamID = Stream[0];
        const SpectatorID = Stream[1];
        const StreamHostID = Stream[2].StreamHostID;
        Streams[StreamID].SpectatorList.splice(SpectatorID, 1);

        console.log(user.general.UserName + " Stopped Spectating.");

        const w = new OsuPacket.Bancho.Writer();
        w.SpectatorLeft(user.general.UserID);
        Token.BroadcastToUserID(StreamHostID, w.toBuffer);

        const writer = new OsuPacket.Bancho.Writer();
        writer.FellowSpectatorLeft(user.general.UserID);
        broadCastToEveryone(StreamID, writer.toBuffer);
    }
}

function broadCastToEveryone(StreamID, buffer = new Buffer('')){
    const stream = Streams[StreamID];
    if(stream){
        for(let i = 0, len = stream.SpectatorList.length; i < len; i++){
            const user = Token.getDatabyUserID(stream.SpectatorList[i].UserID);
            const usertoken = user.token;
            userstatusrequest('', stream.StreamHostID, usertoken, false)
        }
        PacketStream.BroadcastToStream('spec_'+stream.StreamHostID, buffer);
    }
}


function calcacc(d, h, f, m, k, g, mode){
    let thp;
    let th;
    let acc;
    switch(mode){
        case playModes.osu:
            thp = (f*50 + h*100 + d*300)
            th = m+f+d+h;
            acc = thp/(th*300)
            return acc*100;
            break;
        case playModes.taiko:
            thp = (h*50 + d*100);
            th = (m+h+d);
            acc = thp/(th*100);
            return acc*100;
            break;
        case playModes.ctb:
            thp = d+h+f
            th = thp+m+k
            acc = thp / th;
            return acc*100;
            break;
        case playModes.mania:
            thp = f*50+h*100+k*200+d*300+g*300
            th = m+f+h+d+g+k
            acc = thp/(th*300)
            return acc*100;
            break;
        default:
            return 0;
            break;
    }
}

function broadcastReplay(StreamID) {
    let file = fs.readFileSync('replays/315140315990247.banaplay');
    console.log(file.length)
    Token.BroadcastToUserID(101, file);
}

function broadcastFrame(StreamID, Packet){
    const writer = new OsuPacket.Bancho.Writer();
    const stream = Streams[StreamID];

    for (let i = 0; i < Packet.replayFrames.length; i++) {
        const frame = Packet.replayFrames[i];
        stream.replay += `${frame.time}|${frame.mouseX}|${frame.mouseY}|${frame.buttonState},`
    }
    if(Packet.action == 2 || Packet.action == 3){
        // const mysql = require('../common/manager/mysql');
        // const archivedrank = require('../common/helpers/getRank')
        // const cryptohelper = require('../common/helpers/Crypto');
        // stream.replay += "-12345|0|0|1337"
        // let acc = calcacc(Packet.scoreFrame.count300, Packet.scoreFrame.count100, Packet.scoreFrame.count50, Packet.scoreFrame.countMiss, Packet.scoreFrame.countKatu, Packet.scoreFrame.countGeki, stream.playmode);
        // let replayHash = cryptohelper.md5String(Packet.scoreFrame.maxCombo+"osu"+"SpecPlay"+stream.beatmapchecksum+Packet.scoreFrame.totalScore+archivedrank(stream.playmode, stream.mods, acc, Packet.scoreFrame.count300, Packet.scoreFrame.count50, Packet.scoreFrame.count50, Packet.scoreFrame.countMiss));
        // let replayinfo = stream.beatmapchecksum+"|"+Packet.scoreFrame.count300 +"|"+ Packet.scoreFrame.count100 +"|"+ Packet.scoreFrame.count50 +"|"+ Packet.scoreFrame.countMiss +"|"+ Packet.scoreFrame.countKatu +"|"+ Packet.scoreFrame.countGeki +"|"+acc+"|"+"SpecPlay"+"|"+Packet.scoreFrame.totalScore+"|"+Packet.scoreFrame.maxCombo+"|"+stream.mods
        // mysql.query("INSERT INTO scores_replay (replay_hash, replay_string, replay_type, replay_info), (?,?,?,?)", [replayHash, stream.replay, 1, replayinfo]);
        // stream.replay = "";
        // writer.SendMessage({
        //     sendingClient: require('../config').Bancho.BotName,
        //     message: "SpecPlay saved UnderID: "+replayHash,
        //     target: "#spectator",
        //     senderId: 100
        // });
    } else {
        let hostToken = stream.StreamToken;
        console.log(hostToken)
        let Host = Token.getDatabyUserToken(hostToken);
        stream.beatmapchecksum = Host.status.beatmap.beatmapChecksum
        stream.playmode = Host.status.beatmap.playMode
        stream.mods = Host.status.beatmap.currentMods
    }
    writer.SpectateFrames(Packet);
    try {
        broadCastToEveryone(StreamID, writer.toBuffer)
    } catch (ex){
        console.log(ex);
    }
}

module.exports = {
    createStream,
    deleteStream,
    getStreamByID,
    getStreamBySpectatorToken,
    getStreamByToken,
    joinStream,
    leaveStream,
    cantSpec,
    broadcastFrame,
    broadcastReplay
}
