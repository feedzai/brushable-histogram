/**
 * contants
 *
 * Contains contants used for rendering.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

// We reserve some space for the x adn y axis ticks.
export const X_AXIS_HEIGHT = 18;
export const X_AXIS_PADDING = .02;
export const Y_AXIS_PADDING = 3;
export const BUTTON_PADDING = 20;

// We place as many ticks as a third of the number of bars, enough to give context and not overlap.
export const BARS_TICK_RATIO = 3;

export const MIN_ZOOM_VALUE = 1;

// The density chart has a fixed height
export const DENSITY_CHART_HEIGHT_PX = 20;

// The minimum total height of the chart
export const MIN_TOTAL_HEIGHT = 100;

// An internal magic value used to align things horizontally
export const PADDING = 10;

// Histogram bar tooltip size constants
export const HISTOGRAM_BAR_TOOLTIP_WIDTH = 100;
export const HISTOGRAM_BAR_TOOLTIP_HEIGHT = 40;
