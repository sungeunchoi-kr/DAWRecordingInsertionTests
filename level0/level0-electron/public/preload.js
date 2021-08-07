// Courtesy to https://stackoverflow.com/a/59888788
const {
    contextBridge,
    ipcRenderer
} = require('electron')

console.log('*** on=')
console.log(ipcRenderer.on)

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    //'ipc', ipcRenderer,
    'ipc', {
        on: () => { },
        send: () => { },
        once: () => { },
    }
    // 'ipc', {
    //    send: (channel, data) => {
    //        // whitelist channels
    //        let validChannels = ["toMain"];
    //        if (validChannels.includes(channel)) {
    //            ipcRenderer.send(channel, data);
    //        }
    //    },
    //    receive: (channel, func) => {
    //        let validChannels = ["fromMain"];
    //        if (validChannels.includes(channel)) {
    //            // Deliberately strip event as it includes `sender` 
    //            ipcRenderer.on(channel, (event, ...args) => func(...args));
    //        }
    //    }
    //}
)
