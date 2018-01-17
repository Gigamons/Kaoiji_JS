const vm = require('vm');

// "Uncaught" yep... its 100% now Uncaught LOL!
process.on('uncaughtException', ex => {
    console.error(ex);
});

let virt = vm.createContext();
let runnedvm = vm.runInNewContext("let test = 1; test + 2", virt, {displayErrors: true});

console.log(String(runnedvm));
