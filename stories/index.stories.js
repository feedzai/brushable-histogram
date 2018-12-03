import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, boolean, text, number } from "@storybook/addon-knobs";

import sampleData from "./sampleData";
import Histogram from "../src/Histogram";
import "../src/Histogram.scss";

const stories = storiesOf("Histogram", module);

stories.addDecorator(withKnobs);

const formatMinute = timeFormat("%M");

function histogramTooltipBar(bar) {
    return (
        <Fragment>
            <div>
                {bar.yValue} Events
            </div>
            <div>
                {`${formatMinute(bar.x0)} - ${formatMinute(bar.x1)}`}
            </div>
        </Fragment>
    );
}

stories
    .add("bare bones example", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
        />))
    .add("have a custom tooltip", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            tooltipBarCustomization={histogramTooltipBar}
        />))
    .add("have custom axis formatters", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAxisFormatter={(value) => `${value} carrots`}
            yAccessor={(datapoint) => datapoint.total}
        />))
    .add("have custom a height", () =>
        (<Histogram
            data={sampleData}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            height={number("height", 150)}
        />));
