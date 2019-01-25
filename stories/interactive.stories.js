import React from "react";
import { storiesOf } from "@storybook/react";
import { withKnobs, object } from "@storybook/addon-knobs";
import Histogram from "../src/index";
import "../src/Histogram/Histogram.scss";

const stories = storiesOf("Histogram - Interactive data", module);

stories.addDecorator(withKnobs);

stories
    .add("Basic example", () => (
        <Histogram
            data={object("Data", [
                { timestamp: 1170070000000, total: 100 },
                { timestamp: 1270070000000, total: 23 },
                { timestamp: 1370070000000, total: 100 },
                { timestamp: 1470070000000, total: 23 },
                { timestamp: 1570070000000, total: 100 },
                { timestamp: 1670070000000, total: 23 },
                { timestamp: 1770070000000, total: 400 },
                { timestamp: 1870070000000, total: 200 }
            ])}
            xAccessor={(datapoint) => datapoint.timestamp}
            yAccessor={(datapoint) => datapoint.total}
            onIntervalChange={(domain) => console.log(domain)}
        />
    ));
