import React from "react";
import PropTypes from "prop-types";
import Portal from "../common/components/Portal";
import { HISTOGRAM_BAR_TOOLTIP_WIDTH, HISTOGRAM_BAR_TOOLTIP_HEIGHT } from "../constants";

/**
 * BarTootip
 *
 * Renders the histogram bar tooltip that allows to display information about a specific bar.
 * The tooltip content is customizable and is provided by the tooltipBarCustomization custom render function.
 *
 * @author Nuno Neves (nuno.neves@feedzai.com)
 */

const propsTypes = {
    selectedBarPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
        width: PropTypes.number
    }),
    currentBar: PropTypes.object.isRequired,
    tooltipBarCustomization: PropTypes.func.isRequired
};
const defaultProps = {
    selectedBarPosition: {
        top: 0,
        left: 0,
        width: 0
    }
};

function BarTooltip({ selectedBarPosition, currentBar, tooltipBarCustomization }) {
    if (typeof tooltipBarCustomization !== "function") {
        return null;
    }

    const { top, left, width } = selectedBarPosition;
    const tooltipStyle = {
        position: "fixed",
        left: `${left - (HISTOGRAM_BAR_TOOLTIP_WIDTH / 2) + (width / 2)}px`,
        top: `${top - HISTOGRAM_BAR_TOOLTIP_HEIGHT}px`
    };

    const tooltipElement = tooltipBarCustomization(currentBar);

    return (
        <Portal>
            <div
                className="fdz-css-graph-histogram-bars--tooltip"
                style={tooltipStyle}
            >
                {tooltipElement}
            </div>
        </Portal>
    );
}

BarTooltip.propTypes = propsTypes;
BarTooltip.defaultProps = defaultProps;

export default React.memo(BarTooltip);
