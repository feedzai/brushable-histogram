# Brushable Histogram

[![Build Status](https://travis-ci.com/feedzai/brushable-histogram.svg?branch=master)](https://travis-ci.com/feedzai/brushable-histogram)
[![Coverage Status](https://coveralls.io/repos/github/feedzai/brushable-histogram/badge.svg?branch=master)](https://coveralls.io/github/feedzai/brushable-histogram?branch=master)

The brushable histogram renders a time histogram with a preview of the whole data below it, that can be used both to
pan and zoom in on specific intervals as well as to see an overview of the distribution of the data ([demo](https://feedzai.github.io/brushable-histogram/)).


![](https://i.imgur.com/VUYAnxy.gif?raw=true)

Brushable histogram works as an uncontrolled component.

Kudos to [Beatriz Malveiro](https://github.com/biamalveiro) for the ideia and first proptotype and to [Victor Fernandes](https://github.com/victorfern91) for improvements to that first version.

## Instalation

```shell
npm install --save @feedzai/brushable-histogram
```

Note that by default no style is included. If you want you can use the css at `@feedzai/brushable-histogram/lib/css/brushable-histogram.css` to get the same style as in the examples.

## Usage example

```js
import React, { PureComponent, Fragment } from "react";
import Histogram from "@feedzai/brushable-histogram";
import "@feedzai/brushable-histogram/lib/css/brushable-histogram.css";

const xAccessor = (datapoint) => datapoint.timestamp;
const yAccessor = (datapoint) => datapoint.total;

function histogramTooltipBar(bar) {
    return (
        <Fragment>
            <div className="fdz-css-graph-histogram-bars--tooltip-value">
                {Math.floor(bar.yValue)} Events
            </div>
        </Fragment>
    );
}

export default class HistogramExample extends PureComponent {
    render() {
        return (
            <Histogram
                data={[
                    {
                      "timestamp": 1170070000000,
                      "total": 100
                    },
                    {
                      "timestamp": 1270070000000,
                      "total": 23
                    }
                  ]}
                xAccessor={xAccessor}
                yAccessor={yAccessor}
                tooltipBarCustomization={histogramTooltipBar}
            />
        );
    }
}
```

For more advanced use cases please checkout the examples in the `stories` folder.


## Props

### `data`
**Type** `Array.<Object>` **Required**

The data to render in the histogram. The properties of each element that will be used to render the histogram will be defined in the `xAccessor` and `yAccessor` props.

### `xAccessor`
**Type** `Function` **Required**

A function that will receive an array element as argument and that should return the value of the x axis for that element. A possible example would be `({timestamp}) => timestamp`.

**Important** The histogram assumes that `xAccessor` will return an unique value for each `data` element.

### `yAccessor`
**Type** `Function` **Required**

A function that will receive an array element as argument and that should return the value of the y axis for that element. A possible example would be `({amount}) => amount`.

**Important** currently the histogram only support positive values.

### `xAxisFormatter`
**Type** `Function` **Default** `(value) => String(value)`

A function that will receive the value of the x axis returned by `xAccessor` and should return the formatted value as a string that will be displayed in the chart.

### `yAxisFormatter`
**Type** `Function` **Default** Only renders integer numbers.

A function that will receive the value of the y axis returned by `yAccessor` and should return the formatted value as a string that will be displayed in the chart.

### `height`
**Type** `number` **Default** `100`

The height in pixels that the histogram will have. Currently this does not take into account the height used by the summary chart (TODO: make this the real height).

## `onIntervalChange`
**Type** `Function` **Default** `() => {}`

This callback will be called when the selected intervall changes.

## `tooltipBarCustomization`
**Type** `Function` **Default** `() => {}`

To render a tooltip when the mouse hovers it this prop should be passed with a function that returns a React Element. This function will receive as an argument the data object relative to that column.

## `brushDomain`
**Type** `Object` **Default** `undefined`
A custom brush domain. Should have two properties: `min` and `max` both timestamps in milliseconds. Please note that if the user
changes the brush domain by interacting with the brush bar this will be ignored until you pass it a different one.

## How to install it?
`npm install brushable-histogram` --save

## Repo Organization
```
 - (root folder)
  |
  |\_ .storybook - This is the place of the storybook configurations (you should not need to change this often)
  |
  |\_ src - Source files including unit tests and the default scss
  |
  |\_ stories - Stories that showcase the usage of the component.
```
## Develop process

### `npm` tasks

#### Development tasks
- `npm run storybook` - generate the component interactive (access to the storybook server using `http://localhost:9000`)
- `npm run test` - run the unit tests (using jest)
- `npm run test:watch` - run the unit tests in watch mode (using jest)
- `npm run lint` - run the ESLint linter

#### Deployment tasks

**NOTE:** Those tasks should be executed only on the `master` branch.

- `npm run publish:dry` - runs all the publish steps but doesn't actualy publishes
- `npm run publish:major` - creates a tag and publish the X.0.0 version
- `npm run publish:minor` - creates a tag and publish the X.Y.0 version
- `npm run publish:patch` - creates a tag and publish the X.Y.Z version
