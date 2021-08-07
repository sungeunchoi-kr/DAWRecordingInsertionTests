const {
    app,
    screen,
    dialog,
    protocol, 
    systemPreferences,
    ipcMain: ipc,
    shell,
    BrowserWindow,
    Notification
} = require('electron')

const utils = require('./utils')

const os = require('os')
const fs = require('fs')
const path = require('path')
const process = require('process')
const platform = os.platform()

const moment = require('moment')
const isDev = require('electron-is-dev')

//////// Logs
let logContext = { name: 'init' }
const logBuffer = []
function formatVarsObject(vars) {
    const indent = '    '
    return Object.keys(vars).map(k => {
        try {
            return indent + k + ': ' + JSON.stringify(vars[k], null, '  ')
            .split('\n')
            .map((s,i) => i === 0 ? s : indent + s)
            .join('\n')
        } catch(e) {
            return `<failed to stringify object: e=${JSON.stringify(serializeError(e))}>`
        }
    })
    .join('\n')
}
function formatLog(scope, message, vars) {
    const ts = moment().toISOString()
    if (vars) {
        return `${ts} [${scope}] ${message}\n${formatVarsObject(vars)}`
    } else {
        return `${ts} [${scope}] ${message}`
    }
}
const log = {
    verbose: (scope, message, vars) => {
        if (process.env.LOG_VERBOSE_MAIN_THREAD) {
            logBuffer.push({ timestamp: new Date(), context: logContext, level: 'verbose', scope, message, vars })
            const m = formatLog(scope, message, vars)
            console.log(m)
        }
    },
    info: (scope, message, vars) => {
        logBuffer.push({ timestamp: new Date(), context: logContext, level: 'info', scope, message, vars })
        const m = formatLog(scope, message, vars)
        console.log(m)
    },
    error: (scope, message, vars) => {
        if (vars && vars.e) {
            vars.e = serializeError(vars.e)
        }
        logBuffer.push({ timestamp: new Date(), context: logContext, level: 'error', scope, message, vars })
        const m = formatLog(scope, message, vars)
        console.error(m)
    },
    assert: (scope, message, vars) => {
        if (vars && vars.e) {
            vars.e = serializeError(vars.e)
        }
        logBuffer.push({ timestamp: new Date(), context: logContext, level: 'assert', scope, message, vars })
        const m = '!! ASSERTION !! ' + formatLog(scope, message, vars)
        console.error(m)
    }
}
//// logs end

let __app_is_ready = false

const { spawn } = require('child_process')

// npm installing this package resulted in error about the project being compiled against a
// different Node version. Refer to: <https://stackoverflow.com/a/52796884>
//   1. npm i -D electron-rebuild
//   2. Remove node-modules and packages-lock.json
//   3. npm i
//   4. ./node_modules/.bin/electron-rebuild
//
// Also, just running `npm run build` and `npm run pack` will suffice.
let PortAudio = null
try {
    if (platform === 'darwin') {
        PortAudio = require('naudiodon')
    }
} catch(e) {
    console.error(`An error occurred while loading "naudiodon". The module will not be loaded.`)
    console.error(e)
}

let midi = null
try {
    if (platform === 'darwin') {
        midi = require('midi')
        process.env.MIDI_DRIVER_LOADED = '1'
    } else {
        process.env.MIDI_DRIVER_LOADED = ''
    }
} catch(e) {
    log.assert('midi', `An error occurred while loading module "midi". The module will not be loaded.`, { e })
    process.env.MIDI_DRIVER_LOADED = ''
}

try {
    if (platform === 'darwin') {
        require('ffmpeg-static')
    }
} catch(e) {
    console.error(`An error occurred while loading "ffmpeg-static". The module will not be loaded.`)
    console.error(e)
}

const background_color = '#202122'
const app_root_dir = require('app-root-dir').get()
log.info(`init`, `got app_root_dir="${app_root_dir}".`)

if (process.env.AUDIO_BUFFER_SIZE) {
    log.info('init', `AUDIO_BUFFER_SIZE detected; setting audio-buffer-size flag to "${process.env.AUDIO_BUFFER_SIZE}".`)
    app.commandLine.appendSwitch('audio-buffer-size', process.env.AUDIO_BUFFER_SIZE)
}
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }])

let ffmpeg_binary_path = null
let ffmpeg_enabled = false
if (platform === 'darwin') {
    ffmpeg_binary_path = path
        .join(app_root_dir, '/node_modules/ffmpeg-static/ffmpeg')
        .replace('app.asar', 'app.asar.unpacked')
} else if (platform === 'win32') {
} else if (platform === 'linux') {
} else {   
}

const { rootPath } = require('electron-root-path')
if (!isDev && platform === 'darwin') {
    process.env.MUSE_RESOURCES_PATH = path.join(rootPath, 'Contents', 'Resources')
} else {
    process.env.MUSE_RESOURCES_PATH = path.join(rootPath, 'resources')
}

if (process.env.OS_OVERRIDE) {
    process.env.OS = process.env.OS_OVERRIDE
} else {
    process.env.OS = platform
}
if (!process.env.APP_VERSION) {
    process.env.APP_VERSION = app.getVersion()
}

log.info(`init`, `env vars:
OS=${process.env.OS} release=${os.release()}
APP_VERSION=${process.env.APP_VERSION}
NAB_PATH=${process.env.NAB_PATH}`)

let mainWindow = null
const windows = { }

const loadURL = 
    isDev
        ? 'http://localhost:8080'
        : `file://${path.join(__dirname, '../build/index.html')}`

function startupCheck() {
    if (ffmpeg_binary_path) {
        fs.access(ffmpeg_binary_path, fs.F_OK, err => {
            if (err) {
                log.error('ffmpeg-static', `ffmpeg binary does not exist at ffmpeg_binary_path=` +
                    `"${ffmpeg_binary_path}". Disabling ffmpeg.`)
                ffmpeg_enabled = false
            } else {
                log.info('ffmpeg-static', `ffmpeg binary check: OK. ffmpeg enabled.`)
                ffmpeg_enabled = true
            }
        })
    }
    if (PortAudio) {
        log.info('PortAudio', `PortAudio (naudiodon) sanity check: devices count = ${PortAudio.getDevices().length}.`)
    } else {
        log.info('PortAudio', `PortAudio (naudiodon) is not enabled.`)
    }

    if (!ffmpeg_enabled || !PortAudio) {
        REMOTE_RECORDING_SETUP_FAILED = '1'
    }
}

let dawControllerMidiOutput = null
let museMidiOutput = null
function midiSetup() {
    if (!midi) {
        return
    }

    dawControllerMidiOutput = new midi.Output()
    dawControllerMidiOutput.openVirtualPort('Muse DAW Controller')
    log.info('midi', `Opened virtual port "Muse DAW Controller".`)

    museMidiOutput = new midi.Output()
    museMidiOutput.openVirtualPort('Muse MIDI Output')
    log.info('midi', `Opened virtual port "Muse MIDI Output".`)

    // Keep alive
    setInterval(() => {
        dawControllerMidiOutput.sendMessage([ 0xFE, 0, 0 ])
        museMidiOutput.sendMessage([ 0xFE, 0, 0 ])
    }, 2000)
}

startupCheck()
midiSetup()

async function focusMainWindow() {
    if (platform !== 'darwin') {
        return
    }
    if (!mainWindow) { return }

    const isAlwaysOnTop_prev = mainWindow.isAlwaysOnTop()

    mainWindow.setAlwaysOnTop(true, 'floating', 1)
    mainWindow.focus()
    mainWindow.setAlwaysOnTop(false)

    if (isAlwaysOnTop_prev) {
        mainWindow.setAlwaysOnTop(true, 'floating', 1)
    }
}

function createWindow() {

}

app.on('ready', () => {
    log.info('init', 'app.ready')
    __app_is_ready = true
    createWindow()
})

// Without this, on Mac, the app exits fully. (meaning, the app exits
// down at the process level.)
app.on('window-all-closed', (e) => {
    log.info('init', 'window-all-closed')

    if (platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    log.info('init', 'app.activate')
    if (!__app_is_ready) {
        log.info('init', 'at app.activate: __app_is_ready is not true. No-op.')
        return
    }

    if (mainWindow == null) {
        createWindow()
    } else {
        focusMainWindow()
    }
})

app.on('before-quit', () => {
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

/**
 * Level0 Test:
 * Given a pcm file, record the file into the DAW.
 */
function runTest() {
    const outputDevices = PortAudio.getDevices()
    const outputDevice = outputDevices.filter(d => d.name.indexOf('Muse Recording') >= 0 && d.maxOutputChannels > 0)[0] || null
    if (outputDevice == null) {
        log.info(`test`, `outputDevice is null! Exiting.`)
        return
    }

    const _player = new PortAudio.AudioIO({
        outOptions: {
            channelCount: 2,
            maxQueue: 8,
            sampleFormat: PortAudio.SampleFormat16Bit,
            sampleRate: 44100,
            deviceId: outputDevice ? outputDevice.id : -1,
        }
    })
    log.info(`test`, `created _player.`)

    // read file & play
    // We chunk the files and write them with some time between them
    // because if we write the whole file at once into _player.write(), it crashes.
    var pcmStream = fs.createReadStream(`${app_root_dir}/../../testfiles/beeps.pcm`, { highWaterMark: 2 * 44100 /* this chunks the file. */ })
    var chunks = []
    pcmStream.on('data', function(chunk) {
        chunks.push(chunk)
    }).on('end', function() {
        log.info(`test`, `pcmStream end. Read ${chunks.length} chunks.`)

        let i = 0
        setInterval(() => {
            if (i < chunks.length) {
                if (i === 0) {
                    log.info(`test`, `_player.start()`)
                    _player.start()

                    log.info(`test`, `send DAW message start recording`)
                    dawControllerMidiOutput.sendMessage([ 0x90, 0x5F, 1 ])
                }

                log.info(`test`, `_player.write(chunks[${i}])`)
                _player.write(chunks[i])

                if (i === 0) {
                    setTimeout(() => {
                        log.info(`test`, `send DAW message stop recording`)
                        dawControllerMidiOutput.sendMessage([ 0x90, 0x5D, 1 ])
                        setTimeout(() => {
                            process.exit()
                        }, 100)
                    }, 8000)
                }

            } else {
                log.info(`test`, `done.`)
            }
            ++i
        }, 100)
    })
}

setTimeout(() => {
    runTest()
}, 3000)