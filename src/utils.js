import { timeFormat } from "d3-time-format";
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from "d3-time";
import { max as d3Max, min as d3Min } from "d3-array";
import {
    X_AXIS_HEIGHT,
    BUTTON_PADDING,
    DENSITY_CHART_HEIGHT_PX,
    PADDING
} from "./constants";

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
 * Returns true if the two given objects are equal deeply.
 * @param {*} obj1
 * @param {*} obj2
 * @returns {boolean}
 */
function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
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
    if (Array.isArray(data1) === false || Array.isArray(data2) === false) {
        return false;
    }

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

/**
 * Compares the props with the given names in the two prop objects and
 * returns whenever they have the same value (shallow comparison).
 *
 * @param {Object} props
 * @param {Object} prevProps
 * @param {Array.<string>} propNames
 * @returns {boolean}
 */
export function havePropsChanged(props, prevProps, propNames) {
    for (let i = 0; i < propNames.length; i++) {
        const propName = propNames[i];

        if (prevProps.hasOwnProperty(propName) && props[propName] !== prevProps[propName]) {
            return true;
        }
    }

    return false;
}

/**
 * Receives the size the component should have, the padding and the how much vertical space the
 * histogram and the density plots should take and calculates the charts sizes and positions
 *
 * @param {Object} props
 * @returns {Object}
 * @private
 */
export function calculateChartsPositionsAndSizing(props) {
    const { height, renderPlayButton, spaceBetweenCharts, size } = props;
    const width = size.width;

    let playButtonPadding = 0;

    if (renderPlayButton) {
        playButtonPadding = (width > (PADDING + PADDING)) ? BUTTON_PADDING : 0;
    }

    const histogramHeight = height - DENSITY_CHART_HEIGHT_PX - spaceBetweenCharts;

    return {
        histogramChartDimensions: {
            width: (width - PADDING),
            height: histogramHeight,
            heightForBars: histogramHeight - X_AXIS_HEIGHT
        },
        densityChartDimensions: {
            width: width - (PADDING * 4) - playButtonPadding,
            height: DENSITY_CHART_HEIGHT_PX
        }
    };
}

/**
 * Calculates the size of the histogram and density charts and the domain.
 * @param {Object} props
 * @param {Array.<Object>} previousData
 * @param {Object} previousBrushTimeDomain
 * @param {Object} [previousBrushDomainFromProps]
 * @returns {Object}
 */
export function calculateChartSizesAndDomain(props, previousData, previousBrushTimeDomain,
    previousBrushDomainFromProps) {
    const { histogramChartDimensions, densityChartDimensions } = calculateChartsPositionsAndSizing(props);

    let nextState = {
        histogramChartDimensions,
        densityChartDimensions
    };

    if (props.data.length === 0) {
        const now = dateToTimestamp(Date.now());

        return {
            ...nextState,
            data: [],
            brushTimeDomain: {
                min: now,
                max: now
            },
            overallTimeDomain: {
                min: now,
                max: now
            },
            brushDomainFromProps: props.brushDomain
        };
    }

    const hasDataChanged = !isHistogramDataEqual(props.xAccessor, props.yAccessor, props.data, previousData);

    // We allow the user to pass a custom brush domain via props, however we only want to honor that
    // as long as the user didn't interact with the brush via the UI.
    const brushDomainChanged = isObject(props.brushDomain)
        && !isEqual(props.brushDomain, previousBrushDomainFromProps);

    // If the new information received is different we need to verify if there is any update in the max and min
    // values for the brush domain.
    if (hasDataChanged) {
        // We need to store the date so that we can compare it to new data comming from `props`
        // to see if we need to recalculate the domain
        nextState = { ...nextState, data: props.data };

        const min = d3Min(props.data, props.xAccessor);

        // We're incrementing 1 millisecond in order avoid the last data point to have no width on the histogram
        const max = d3Max(props.data, props.xAccessor) + 1;

        // If the brush domain changed we could
        if (min !== previousBrushTimeDomain.min || max !== previousBrushTimeDomain.max) {
            nextState = {
                ...nextState,
                brushTimeDomain: {
                    min: dateToTimestamp(min),
                    max: dateToTimestamp(max)
                },
                overallTimeDomain: {
                    min: dateToTimestamp(min),
                    max: dateToTimestamp(max)
                }
            };
        }
    }

    if (brushDomainChanged) {
        nextState.brushTimeDomain = props.brushDomain;
    }

    nextState.brushDomainFromProps = props.brushDomain;

    return nextState;
}
