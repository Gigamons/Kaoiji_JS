const common = require('../common');
const Token= require('./Token');

let commands = [];

function commandExist(command) {
    for (let i = 0; i < commands.length; i++) {
        const element = commands[i];
        if(element.Command.Command == command)
            return true;
    }
}

function hasCommandPermission(token, command) {
    const cmddata = getCommand(command);
    const tokenData = Token.getDatabyUserToken(token);

    if(cmddata && tokenData){
        const cmdid = cmddata[0];
        const cmd = cmddata[1];
    
        const tokenID = tokenData[0];
        const tokenarray = tokenData[1];
        if(cmd.Privilege == 0 || cmd.Privilege == 1) return true;
        if(common.PrivilegeHelper.hasPrivilege(tokenarray.general.Privileges, cmd.Privilege))
            return true;
        else return false;
    } else {
        return false;
    }
}

function commandFunction(token, channel = '#osu', from = '', command = '!faq', args = []) {
    const cmddata = getCommand(command);
    if(cmddata){
        const cmdid = cmddata[0];
        const cmd = cmddata[1];
        
        const commandFunctions = require('../handler/private/botCommands');
        
        if(hasCommandPermission(token, command)){
            switch (cmd.function) {
                case 'alert':
                    commandFunctions.alert(args, channel, cmd.Description)
                    break;
                case 'kick':
                    commandFunctions.kick(args, channel, cmd.Description)
                    break;
                case 'math':
                    commandFunctions.math(args, channel, cmd.Description)
                    break;
                case 'setPerm':
                    commandFunctions.setPerm(args, channel, cmd.Description)
                    break;
                case 'ban':
                    commandFunctions.ban(args, channel, cmd.Description)
                    break;
                default:
                    break;
            }
        }
    }
}

function getCommand(command) {
    for (let i = 0; i < commands.length; i++) {
        const element = commands[i];
        if(element.Command.Command === command)
            return [
                i, element.Command
            ];
    }
    return false;
}

function ParseCommands() {
    const fs = require('fs');
    const json = JSON.parse(fs.readFileSync('configs/commands.json').toString());
    for (let i = 0; i < json.length; i++) {
        const element = json[i];
        commands.push(commandOBJ([element]))
    }
}

function commandOBJ(arr = []) {
    return {
        Command: arr[0],
    }
}

module.exports = {
    commandExist,
    hasCommandPermission,
    commandFunction,
    ParseCommands
}