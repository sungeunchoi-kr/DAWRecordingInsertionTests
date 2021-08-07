/**
 * Loads binaries in 'resources/{OS}/bin'.
 * 
 * Place the following in package.json "build" section to have the binary files copied when
 * packaged into an app using electron-builder:
 * ```
 *  "extraFiles": [
 *    {
 *      "from": "resources/win32/bin",  // where "win32" is the relevant OS.
 *      "to": "resources/win32/bin",
 *      "filter": [
 *        "**//*" (where the "//" is "/")
 *      ]
 *    }
 *  ]
 * ```
 */
const path = require('path')
const { app } = require('electron')
const { rootPath } = require('electron-root-path')
const { platform } = require('os')

// NOTE: Apparently, IS_PROD always false, even on a packaged app.
const IS_PROD = process.env.NODE_ENV === 'production'
console.log(`[BinaryLoader] NODE_ENV=${process.env.NODE_ENV} IS_PROD=${IS_PROD}`)

const root = rootPath
const appPath = app.getAppPath()
const isPackaged =
    process.mainModule.filename.indexOf('app.asar') !== -1

const binariesPath =
    IS_PROD && isPackaged
        ? path.join(path.dirname(appPath), '..', './Resources', './bin')
        : path.join(root, './resources', platform(), './bin')

console.log(`[BinaryLoader]
    rootPath=${rootPath}
    appPath=${appPath}
    isPackaged=${isPackaged}
    binariesPath=${binariesPath}`)

module.exports = {
    path: path.resolve(binariesPath),
}
