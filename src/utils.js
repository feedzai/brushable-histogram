import { timeFormat } from "d3-time-format";
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from "d3-time";

/**
 * utils
 *
 * Contains utility methods.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
 * Returns true if the given value is an Object.
 * @param {*} obj
 * @returns {boolean}
 */
export function isObject(obj) {
    return Object(obj) === obj;
}

/**
 * The default histogram y axis formatter. Only returns integer values.
 * @param {number} value
 * @returns {String}
 */
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

/**
 * Formats a date. This is the histogram default x axis formatter.
 *
 * This code is adapted from the D3 documentation.
 *
 * @param {Date} date
 * @returns {string}
 */
export function multiDateFormat(date) {
    let formatter;

    if (timeSecond(date) < date) {
        formatter = formatMillisecond;
    } else if (timeMinute(date) < date) {
        formatter = formatSecond;
    } else if (timeHour(date) < date) {
        formatter = formatMinute;
    } else if (timeDay(date) < date) {
        formatter = formatHour;
    } else if (timeMonth(date) < date) {
        if (timeWeek(date) < date) {
            formatter = formatDay;
        } else {
            formatter = formatWeek;
        }
    } else if (timeYear(date) < date) {
        formatter = formatMonth;
    } else {
        formatter = formatYear;
    }

    return formatter(date);
}

/**
 * Compares the x and y histogram data in two arrays and returns whenever they are the same.
 * @param {function} xAcessor The function that will return the x value.
 * @param {function} yAcessor The function that will return the y value.
 * @param {Array.<Object>} data1 The first data array.
 * @param {Array.<Object>} data2 The second data array.
 * @returns {boolean}
 */
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

/**
 * Converts a Date object to unix timestamp if the parameter is
 * indeed a date, if it's not then just return the value.
 * @param {Date|number} date
 * @returns {number}
 */
export function dateToTimestamp(date) {
    return date instanceof Date ? date.getTime() : date;
}
