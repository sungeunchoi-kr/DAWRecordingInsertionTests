const utils = require('./utils')

console.log('** Test "isRectInScreen()"')

var resultMatrix = [
    utils.isRectInScreen({ x: 0, y: 0, width: 200, height: 100 }, { x: 0, y: 0, width: 50, height: 50 }),
    utils.isRectInScreen({ x: 0, y: 0, width: 200, height: 100 }, { x: -100, y: -100, width: 50, height: 50 }),
    utils.isRectInScreen({ x: 0, y: 0, width: 200, height: 100 }, { x: 200, y: 100, width: 50, height: 50 }),
    utils.isRectInScreen({ x: 200, y: 100, width: 200, height: 100 }, { x: 200, y: 100, width: 50, height: 50 }),
    utils.isRectInScreen({ x: 200, y: 100, width: 200, height: 100 }, { x: 0, y: 0, width: 50, height: 50 }),
    utils.isRectInScreen({ x: 0, y: 23, width: 1792, height: 1097 }, { "x":780,"y":23,"width":417,"height":1097 }),
    utils.isRectInScreen({ x: 0, y: 23, width: 1792, height: 1097 }, { "x":780,"y":23,"width":417,"height":2097 }),
    utils.isRectInScreen({ x: 0, y: 23, width: 1792, height: 1097 }, { "x":780,"y":22223,"width":417,"height":1097 }),

    utils.isRectInScreen({ x: 100, y: 100, width: 100, height: 100 }, { "x":150,"y":150,"width":10,"height":10 }),
    utils.isRectInScreen({ x: 100, y: 100, width: 100, height: 100 }, { "x":0,"y":0,"width":1000,"height":1000 }),

    utils.isRectInScreen({ "x":0,"y":0,"width":1920,"height":1040 }, { "x":810,"y":0,"width":300,"height":8 }),
]

var answer = [
    true, false, false, true, false, true, true, false,
    true, true, false
]

for (let i=0; i<resultMatrix.length; ++i) {
    if (answer[i] != resultMatrix[i]) { throw new Error(`Test "pointIsInRect()" failed at i=${i}`)}
}

console.log('test done.')