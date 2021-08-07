
/**
 * Checks if rect shows up inside screenRect. Partial renderings allowed.
 * 
 * @param {Rectangle} screenRect
 * @param {Rectangle} rect
 * 
 * where Rectangle is { x, y, width, height }
 */
function isRectInScreen(screenRect, rect) {
    const margin = 10
    return isRectIntersect(
        screenRect.x+margin, screenRect.y+margin, screenRect.width-(margin*2), screenRect.height-(margin*2),
        rect.x, rect.y, rect.width, rect.height,
    )
}

function isRectIntersect(
    Ax, Ay, Aw, Ah,
    Bx, By, Bw, Bh
) {
    return Bx + Bw > Ax &&
        By + Bh > Ay &&
        Ax + Aw > Bx &&
        Ay + Ah > By
}

module.exports = {
    isRectInScreen,
}