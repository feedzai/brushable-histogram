import React, { Fragment } from "react";
import { timeFormat } from "d3-time-format";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withKnobs, boolean, text } from "@storybook/addon-knobs";

import sampleData from "./sampleData";
import Histogram from "../src/Histogram";
import "../src/Histogram.scss";

const stories = storiesOf("Histogram", module);

stories.addDecorator(withKnobs);

const formatMinute = timeFormat("%I:%M");

function histogramYAxisFormatter(value) {
    if (value > 0 && Number.isInteger(value)) {
        return value;
    }
    return "";
}

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
    .add("simple example", () =>
        (<Histogram
            data={sampleData}
            height={100}
            xAccessor={(datapoint) => datapoint.timestamp}
            xAxisFormatter={formatMinute}
            yAccessor={(datapoint) => datapoint.total}
            yAxisFormatter={histogramYAxisFormatter}
            tooltipBarCustomization={histogramTooltipBar}
            onIntervalChange={() => {}}
        />));
