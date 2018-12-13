/**
 * histogramBarGeometry
 *
 * This module contains the histogram bar position and dimension calculation.
 *
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
  * Calculates the dimensions for the given `bar` given the scales and other parameters.
  * @returns {Object}
  */
export function calculateDimensions({ xScale, yScale, heightForBars, margin, bar }) {
    const width = xScale(bar.x1)
        - xScale(bar.x0) - margin;
    const height = heightForBars - yScale(bar.yValue);

    return { width, height };
}

/**
  * Calculates the position and dimensions for the given `bar` given the scales and other parameters.
  * @returns {Object}
  */
export function calculatePositionAndDimensions({ xScale, yScale, heightForBars, margin, bar }) {
    const { width, height } = calculateDimensions({ xScale, yScale, heightForBars, margin, bar });

    const x = xScale(bar.x0) + margin / 2;
    const y = yScale(bar.yValue);

    return {
        width,
        height,
        x,
        y
    };
}
