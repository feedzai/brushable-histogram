import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";

import { storiesOf } from "@storybook/react";
import { withKnobs, number } from "@storybook/addon-knobs";

import sampleData from "./sampleData";
import Histogram from "../src/Histogram";
import "../src/Histogram.scss";

const stories = storiesOf("Histogram", module);

stories.addDecorator(withKnobs);

const formatDayFull = timeFormat("%e %b'%y");

function formatContextInterval(dateStart, dateEnd) {
    const formatStart = formatDayFull(dateStart);
    const formatEnd = formatDayFull(dateEnd);

    // If the formatted start and end date are the same then just display one
    if (formatStart === formatEnd) {
        return formatStart;
    }

    // Otherwise display the interval limits.
    return `${formatStart} - ${formatEnd}`;
}

function histogramTooltipBar(bar) {
    return (
        <Fragment>
            <div className="fdz-css-graph-histogram-bars--tooltip-value">
                {Math.floor(bar.yValue)} Events
            </div>
            <div className="fdz-css-graph-histogram-bars--tooltip-dates">
                {formatContextInterval(bar.x0, bar.x1)}
            </div>
        </Fragment>
    );
}

stories
    .add("Basic example", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
        />))
    .add("With a custom tooltip", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            tooltipBarCustomization={histogramTooltipBar}
        />))
    .add("With a custom axis formatters", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatDayFull}
            yAxisFormatter={(value) => (value > 0 ? `${value}$` : "")}
            yAccessor={(datapoint) => datapoint.total}
        />))
    .add("Without the play button", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            renderPlayButton={false}
        />))
    .add("With a custom a height", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            height={number("height (min 150)", 300)}
            tooltipBarCustomization={histogramTooltipBar}
        />));
