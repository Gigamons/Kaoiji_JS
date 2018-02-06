const request = require('request');
const bluebird = require('bluebird');

const OsuPacket = require('../main_modules/osu-packet');

const common = require('../common');

const config = require('../config');
const Token = require('../objects/Token');

const logger = common.Logger;
const UserTools = common.UserTools;
const MySQL = common.MySQLManager;
const redis = common.RedisManager;

const countryHelper = require('../helpers/countryHelper');
const IPHelper = require('../helpers/IPHelper');

const PacketStreams = require('../objects/PacketStreams');
const Channel = require('../objects/Channel');
const updatestats = require('./private/UpdateStatistics')
const UserPresence = require('./public/UserPresence');
const titleUpdate = require('../heavyhandler/titleUpdate');

//const Permissions = consts.Permissions;

const login = async (res, req, packet) => {
    const writer = new OsuPacket.Bancho.Writer;
    const LoginData = parselogin(packet);
    if(LoginData != undefined){
        try {
            const userid = await UserTools.getuserid(LoginData.username);
            if(!userid) throw 'username';
            const checkAuth = UserTools.checkAuth(userid, LoginData.password);
            if(!checkAuth) throw 'password';
            const user = await UserTools.getuser(userid);
            if(user.Banned.status) {
                loginBanned(res, user)
                return;
            };

            let responseToken;
            let tourney;

            if(LoginData.osuversion.includes('tourney')){
                tourney = true;
            } else {
                tourney = false;
            }
            
            if(!tourney){
                await Token.DeleteoldTokens(user.UserID);
            }

            let BufferArray = new Buffer('');
            let r = 1;
            let perm = 1;

            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.BAT)){
                r |= 2;
            }
            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.Supporter) || config.Bancho.freedirect){
                r |= 4;
            }
            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.TournamentStaff)){
                r |= 32;
            }
            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.AdminDeveloper)){
                perm |= 8;
            }
            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.AdminChatMod)){
                perm |= 6;
            }
            if(common.PrivilegeHelper.hasPrivilege(user.Privileges, common.Privileges.AdminBanUsers)){
                perm |= 16;
            }

            let countryId = 0;
            let longitude = 0;
            let latitude = 0;

            try {
                let i = req.headers['X-Real-IP'];
                if(i == "127.0.0.1" || i == '0.0.0.0')
                    i = '';
                let IP = Object(await IPHelper(i));
                countryId = Number(countryHelper.CountryToID(IP.countryCode));
                longitude = Number(IP.lon);
                latitude = Number(IP.lat);
            } catch (ex) {
                console.log(ex);
                countryId = Number(0);
                longitude = Number(0);
                latitude = Number(0);
            }
            responseToken = Token.addToken([user.UserID, user.UserName, tourney, user.Privileges, false, 24+LoginData.timeoffset, countryId, perm, longitude, latitude])
            await updatestats(responseToken, undefined, true);
            const u = Token.getDatabyUserToken(responseToken)[1];

            writer.UserSilenced(0);
            writer.LoginReply(user.UserID);
            writer.ProtocolNegotiation(config.server.choprotocolversion);
            writer.LoginPermissions(r); 
            UserPresence(responseToken, undefined);
            
            Channel.FirstChannelPacket(responseToken);

            PacketStreams.addUsertoStream('main', u);

            require('./private/UpdateStatistics')(responseToken, 0, Boolean(true))
            require('./public/UserPresenceBundle')(responseToken);

            if(!Token.getDatabyUserToken(responseToken)[1]) throw 'Something goes horrible wrong!';
            titleUpdate(responseToken);
            res.writeHead(200,{
                'cho-token': responseToken,
                'cho-protocol': config.server.choprotocolversion,
                'Connection': 'keep-alive',
                'Keep-Alive': 'timeout=5, max=100',
                'Content-Type': 'text/html; charset=UTF-8'
            });
            BufferArray = Buffer.concat([writer.toBuffer, Token.getDatabyUserToken(responseToken)[1].output.read()])
            res.write(BufferArray);
            res.end();
        } catch (ex) {
            switch (ex) {
                case 'username':
                    res.write(loginFailed(res));
                    res.end();
                    break;
                case 'password':
                    res.write(loginFailed(res));
                    res.end();
                    break;
                default:
                    writer.buffer.buffer = new Buffer('');
                    writer.LoginReply(-5);
                    writer.Announce('Report this.');
                    writer.Announce(ex.toString());
                    console.log(ex);
                    res.writeHead(200,{
                        'cho-token': 'NOOO ERROR!!',
                        'cho-protocol': config.server.choprotocolversion,
                        'Connection': 'keep-alive',
                        'Keep-Alive': 'timeout=5, max=100',
                        'Content-Type': 'text/html; charset=UTF-8'
                    });
                    res.write(writer.toBuffer);
                    res.end();
                    break;
            }
        }
    } else {
        writer.LoginReply(-1);
        writer.Announce('I Dont think so >:(');
        res.writeHead(403, {
            'cho-token': null,
            'cho-protocol': config.server.choprotocolversion,
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=5, max=100',
            'Content-Type': 'text/html; charset=UTF-8'
        });
        res.write(writer.toBuffer);
        res.end();
    }
};


const loginBanned = (res, user) => {
    const writer = new OsuPacket.Bancho.Writer;
    writer.Announce('Sorry bro, you got banned from '+config.Bancho.ServerName+', Becourse: \n'+user.Banned.reason+'\nBut i wish you Good look to get unbanned \n-'+config.Bancho.BotName);
    writer.LoginReply(-1);
    writer.BanInfo(30);
    writer.Announce('Dont worry, your client is blocked for the next 30 Secounds!');
    res.writeHead(200,{
        'cho-token': 'Nope >:(',
        'cho-protocol': config.server.choprotocolversion,
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=5, max=100',
        'Content-Type': 'text/html; charset=UTF-8'
    });
    res.write(writer.toBuffer);
    res.end();
}

const loginFailed = (res) => {
    const writer = new OsuPacket.Bancho.Writer;
    writer.LoginReply(-1);
    res.writeHead(200,{
        'cho-token': 'Nope >:(',
        'cho-protocol': config.server.choprotocolversion,
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=5, max=100',
        'Content-Type': 'text/html; charset=UTF-8'
    });
    // Write it out.
    res.write(writer.toBuffer);
    res.end();
    // Post our Message to console. TBH i like this message xD
    console.error('(A Wild '+LoginData.username+' Failed to login.) He said: Fuck you bancho!');
}

const parselogin = (packet) => {
    try {
        const p = packet.toString(); // Convert our buffer to a String
        const s = p.split('\n'); // Split our Login Data to Username Password Osuversion|blabla|bla
        const n = s[2].split('|'); // Split osuversion|blablabla|blablabla to a object.
        const username = s[0]; // Username ofc
        const password = s[1]; // Password ofc
        const osuversion = n[0]; // OsuVersion ofc.
        const TimeOffset = Number(n[1]); // Comeon, i dont realy have to tell you what this is.
        const clientData = n[3].split(':')[2]; // Some system information. such as MacAdress or DiskID
        
        // If some data is not set OR is invailed throw errors
        if(username == undefined) throw 'UserName';
        if(password == undefined) throw 'password';
        if(osuversion == undefined) throw 'osuversion';
        if(TimeOffset == undefined) throw 'offset';
        if(clientData == undefined) throw 'clientData';

        // Everything alright? return parsed data.
        const obj = {
            username: String(username),
            password: String(password),
            osuversion: String(osuversion),
            timeoffset: Number(TimeOffset),
            clientdata: String(clientData)
        };
        // Here is the return.
        return obj;
    } catch (ex){
        // Else return undefined, that the login request get cancled.
        return undefined;
    }
};

module.exports = login;