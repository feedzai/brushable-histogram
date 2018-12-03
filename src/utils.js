import { timeFormat } from "d3-time-format";
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from "d3-time";

export function isObject(obj) {
    return Object(obj) === obj;
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

export function histogramDefaultYAxisFormatter(value) {
    if (value > 0 && Number.isInteger(value)) {
        return value;
    }
    return "";
}

const formatMillisecond = timeFormat(".%L"),
    formatSecond = timeFormat(":%S"),
    formatMinute = timeFormat("%I:%M"),
    formatHour = timeFormat("%I %p"),
    formatDay = timeFormat("%a %d"),
    formatWeek = timeFormat("%b %d"),
    formatMonth = timeFormat("%B"),
    formatYear = timeFormat("%Y");

export function multiDateFormat(date) {
    return (timeSecond(date) < date ? formatMillisecond
        : timeMinute(date) < date ? formatSecond
            : timeHour(date) < date ? formatMinute
                : timeDay(date) < date ? formatHour
                    : timeMonth(date) < date ? (timeWeek(date) < date ? formatDay : formatWeek)
                        : timeYear(date) < date ? formatMonth
                            : formatYear)(date);
}

export function isHistogramDataEqual(xAcessor, yAcessor, data1, data2) {
    if (data1.length !== data2.length) {
        return false;
    }

    for (let i = 0; i < data1.length; i++) {
        if (xAcessor(data1[i]) !== xAcessor(data2[i])) {
            return false;
        }
        if (yAcessor(data1[i]) !== yAcessor(data2[i])) {
            return false;
        }
    }

    return true;
}
