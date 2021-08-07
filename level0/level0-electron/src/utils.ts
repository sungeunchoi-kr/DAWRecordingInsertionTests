// export function copyStyles(sourceDoc: any, targetDoc: any) {
//     Array.from(sourceDoc.styleSheets).forEach((styleSheet: any) => {
//         if (styleSheet.cssRules) { // true for inline styles
//             const newStyleEl = sourceDoc.createElement('style')

//             Array.from(styleSheet.cssRules).forEach((cssRule: any) => {
//                 newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText))
//             })

//             targetDoc.head.appendChild(newStyleEl)
//         } else if (styleSheet.href) { // true for stylesheets loaded from a URL
//             const newLinkEl = sourceDoc.createElement('link')

//             newLinkEl.rel = 'stylesheet'
//             newLinkEl.href = styleSheet.href
//             targetDoc.head.appendChild(newLinkEl)
//         }
//     })
// }

// An alternative 'copyStyles' I found. Keeping it here in case I need 
// it in the future.
// NOTE: Ever since introducing { frame: false } in new BrowserWindow() in electron.js, this version
// of copyStyles must be used; the above copyStyles throws an error on a built app.
export function copyStyles (sourceDoc: any, targetDoc: any) {
    Array.from(sourceDoc.querySelectorAll('link[rel="stylesheet"], style'))
    .forEach((link: any) => {
        targetDoc.head.appendChild(link.cloneNode(true));
    })
}

export const arrayInPlaceRemove = function<T>(arr: T[], callback: (v: T, i: number) => boolean) {
    let i = arr.length
    while (i--) {
        if (callback(arr[i], i)) {
            arr.splice(i, 1)
        }
    }
}

export function removeInPlace<T>(array: Array<T>, condition: (value: T) => boolean) {
    let next_place = 0;

    for (let value of array) {
        if (!condition(value))
            array[next_place++] = value
    }

    array.splice(next_place)
}

export function chunkArray(a: any[], n: number, balanced: boolean) {
    if (n < 2)
        return [a];

    var len = a.length,
            out = [],
            i = 0,
            size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }

    else {

        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));

    }

    return out;
}

/**
 * Optimally fit a rectangle R inside a rectangular container C, where both R and C
 * have a fixed aspect ratio.
 * 
 * @param cw Container width.
 * @param ch Container height.
 * @param rw The width of the rectangle to fit (R).
 * @param rh The height of the rectangle to fit (R).
 * @returns Width and height of R, resized to maximally fit the container while
 * maintaining its aspect ratio. 
 */
export const fitRect = (cw: number, ch: number, rw: number, rh: number) => {
    const cr = cw / ch
    const rr = rw / rh
    if (cr <= rr) {
        return {
            w: cw,
            h: (cw / rw) * rh
        }
    } else {
        return {
            w: (ch / rh) * rw,
            h: ch
        }
    }
}

export function shuffleArray<T>(array: T[]): T[] {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter)

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter]
        array[counter] = array[index]
        array[index] = temp
    }

    return array
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // @ts-ignore
            resolve()
        }, ms)
    })
}