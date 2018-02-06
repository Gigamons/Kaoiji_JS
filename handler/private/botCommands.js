const Token = require('../../objects/Token');
const OsuPacket = require('../../main_modules/osu-packet');
const PacketStreams = require('../../objects/PacketStreams');
const EventTools = require('../../common').EventTool;
const MySQL = require('../../common').MySQLManager;
const UserTools = require('../../common').UserTools;
const config = require('../../config');
const common = require('../../common');
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

async function ban(args = [], channel, description = 'Haitai') {
  const writer = new OsuPacket.Bancho.Writer;
  const toBanUser = args[0];

  if(toBanUser === null || toBanUser === undefined || toBanUser === '' || toBanUser.startsWith(' ')) {
      writer.SendMessage({
          sendingClient: config.Bancho.BotName,
          message: description,
          target: channel,
          senderId: 100
      })
      PacketStreams.BroadcastToStream('main', writer.toBuffer);
      return;
  }

  const UserID = await UserTools.getuserid(toBanUser);

  await MySQL.query("UPDATE users SET banned = 1 WHERE id = ?", [UserID])
  EventTools.WriteKick(UserID, null);
}

async function setPerm(args = [], channel, description = 'Haitai') {
  const writer = new OsuPacket.Bancho.Writer;
  const toRankUser = args[0];
  const Permission = args[1];


  if(toRankUser === null || toRankUser === undefined || toRankUser === '' || toRankUser.startsWith(' ')) {
      writer.SendMessage({
          sendingClient: config.Bancho.BotName,
          message: description,
          target: channel,
          senderId: 100
      })
      PacketStreams.BroadcastToStream('main', writer.toBuffer);
      return;
  }
  let perm = 0;
  switch (Permission) {
        case "dev":
        perm = common.PrivilegeHelper.makePrivileges([
            common.Privileges.AdminBanUsers,
            common.Privileges.AdminBeatmaps,
            common.Privileges.AdminChatMod,
            common.Privileges.AdminDeveloper,
            common.Privileges.AdminKickUsers,
            common.Privileges.AdminManageUsers,
            common.Privileges.AdminPannelAccess,
            common.Privileges.AdminPrivileges,
            common.Privileges.AdminReports,
            common.Privileges.AdminSendAlerts,
            common.Privileges.AdminSettings,
            common.Privileges.AdminSilenceUsers,
            common.Privileges.AdminWipeUsers,
            common.Privileges.BAT,
            common.Privileges.Supporter,
            common.Privileges.TournamentStaff
        ]);
          break;
        case "admin":
          perm = common.PrivilegeHelper.makePrivileges([
            common.Privileges.BAT,
            common.Privileges.AdminSilenceUsers,
            common.Privileges.AdminBanUsers,
            common.Privileges.AdminBeatmaps,
            common.Privileges.AdminChatMod,
            common.Privileges.AdminKickUsers,
            common.Privileges.AdminPannelAccess,
            common.Privileges.AdminManageUsers,
            common.Privileges.AdminWipeUsers,
            common.Privileges.Supporter
          ])
          break;
        case "mod":
        perm = common.PrivilegeHelper.makePrivileges([
            common.Privileges.BAT,
            common.Privileges.AdminChatMod,
            common.Privileges.AdminKickUsers,
            common.Privileges.Supporter
        ])
          break;
        case "supporter":
        perm = common.PrivilegeHelper.makePrivileges([
            common.Privileges.Supporter
        ])
          break;
  }
  const UserID = await UserTools.getuserid(toRankUser);

  await MySQL.query("UPDATE users SET privileges = ? WHERE id = ?"[perm, UserID])
}

module.exports = {
    alert,
    kick,
    ban,
    setPerm,
    math
}
