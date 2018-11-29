import { isFunction, isObject } from "lodash";

export function randomString() {
    return Math.random().toString(36).substr(2, 11);
}

export function callIfExists(fn, ...params) {
    if (isFunction(fn)) {
        return fn.apply(this, params);
    }

    return fn;
}

export function clearCanvas(context, width, height) {
    context.save();
    context.clearRect(0, 0, width, height);
}

/**
 * Renders a rectangle in Canvas
 *
 * @param {Object} canvasContext
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Object} options
 */
export function drawRect(canvasContext, x = 0, y = 0, width = 0, height = 0, options = null) {
    canvasContext.beginPath();

    canvasContext.fillStyle = isObject(options) && (options.fillStyle) ? options.fillStyle : "transparent";

    canvasContext.fillRect(x, y, width, height);
}
