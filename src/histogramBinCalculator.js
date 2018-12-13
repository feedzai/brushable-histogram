import { histogram as d3Histogram } from "d3-array";

/**
 * histogramBinCalculator
 *
 * This module is a proxy to the histogram logic in d3, and it exists so that ce can mock this logic
 * and in different enviroments the results can be slightly different for the same
 * data (even in the same timezone).
 *
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

export default ({ xAccessor, yAccessor, histogramChartXScale, defaultBarCount, data }) => {
    // Setting the histogram function/converter
    const histogram = d3Histogram()
        .value(xAccessor)
        .domain(histogramChartXScale.domain()) // using the x-axis domain
        .thresholds(histogramChartXScale.ticks(defaultBarCount));

    // Calculating the time histogram bins
    return histogram(data).map((bar) => {
        const yValue = bar.reduce((sum, curr) => sum + yAccessor(curr), 0);

        return { ...bar, yValue };
    });
};
