import { isObject } from "./utils";

/**
 * canvasRenderUtils
 *
 * Contains utility methods used to render on a `<canvas>` element.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
 * Returns the canvas 2d context of the given canvas element.
 *
 * We have this call in a separated method so that it can stubbed in unit tests.
 *
 * @param {HTMLElement} element
 * @returns {Object}
 */
export function getRenderContext(element) {
    return element.getContext("2d");
}

/**
 * Clears the given canvas.
 * @param {Object} context
 * @param {number} width
 * @param {number} height
 */
export function clearCanvas(context, width, height) {
    context.save();
    context.clearRect(0, 0, width, height);
}

/**
 * Renders a rectangle in Canvas
 *
 * @param {Object} canvasContext
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} options
 */
export function drawRect(canvasContext, x = 0, y = 0, width = 0, height = 0, options = null) {
    canvasContext.beginPath();

    canvasContext.fillStyle = isObject(options) && (options.fillStyle) ? options.fillStyle : "transparent";

    canvasContext.fillRect(x, y, width, height);
}
