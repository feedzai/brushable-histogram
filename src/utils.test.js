import {
    isObject,
    histogramDefaultYAxisFormatter,
    multiDateFormat,
    isHistogramDataEqual,
    dateToTimestamp,
    calculateChartsPositionsAndSizing,
    calculateChartSizesAndDomain,
    havePropsChanged
} from "./utils";
import { max as d3Max, min as d3Min } from "d3-array";
import { smallSample } from "../stories/sampleData";

let xAccessor, yAccessor, previousBrushDomain;

// We are doing this because `timeMonth` returns dates with an 1 hour offset
// locally and in ci, even though the timezone is the same.
jest.mock("d3-time", () => ({
    timeSecond: (date) => date,
    timeMinute: (date) => date,
    timeHour: (date) => date,
    timeDay: (date) => date,
    timeWeek: (date) => date,
    timeMonth: (date) => date,
    timeYear: (date) => date
}));

beforeEach(() => {
    const brushDomainMin = d3Min(smallSample, xAccessor);
    const brushDomainMax = d3Max(smallSample, xAccessor) + 1;

    xAccessor = (elm) => elm.timestamp;
    yAccessor = (elm) => elm.total;
    previousBrushDomain = { max: brushDomainMax, min: brushDomainMin };
});

describe("isObject", () => {
    it("returns true if an object is passed", () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(() => {})).toBe(true);
    });

    it("returns false if a non object is passed", () => {
        expect(isObject(1)).toBe(false);
        expect(isObject("")).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
    });
});

describe("histogramDefaultYAxisFormatter", () => {
    it("returns the value if it is an integer bigger than zero", () => {
        expect(histogramDefaultYAxisFormatter(1)).toBe(1);
    });

    it("returns the value if it is an integer smaller or equal to zero", () => {
        expect(histogramDefaultYAxisFormatter(-1)).toBe("");
        expect(histogramDefaultYAxisFormatter(0)).toBe("");
    });

    it("returns an empty string if the value is decimal", () => {
        expect(histogramDefaultYAxisFormatter(1.1)).toBe("");
    });

    it("returns an empty string if the value is not a number", () => {
        expect(histogramDefaultYAxisFormatter({})).toBe("");
    });
});

describe("multiDateFormat", () => {
    it("returns a string representation of the date", () => {
        expect(multiDateFormat(new Date(1533164400000))).toBe("2018");
    });
});

describe("isHistogramDataEqual", () => {
    it("returns true if the data is equal for x and y", () => {
        expect(isHistogramDataEqual((elm) => elm.timestamp, (elm) => elm.amount, [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 3
        }], [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 3
        }])).toBe(true);
    });

    it("returns false if the data is not equal for x", () => {
        expect(isHistogramDataEqual((elm) => elm.timestamp, (elm) => elm.amount, [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 3
        }], [{
            timestamp: 4,
            amount: 2
        }, {
            timestamp: 2,
            amount: 3
        }])).toBe(false);
    });

    it("returns false if the data is not equal for y", () => {
        expect(isHistogramDataEqual((elm) => elm.timestamp, (elm) => elm.amount, [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 3
        }], [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 8
        }])).toBe(false);
    });

    it("returns false if any of the parameters is not an array", () => {
        expect(isHistogramDataEqual((elm) => elm.timestamp, (elm) => elm.amount, null, [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 8
        }])).toBe(false);

        expect(isHistogramDataEqual((elm) => elm.timestamp, (elm) => elm.amount, [{
            timestamp: 1,
            amount: 2
        }, {
            timestamp: 2,
            amount: 8
        }], null)).toBe(false);
    });
});

describe("dateToTimestamp", () => {
    it("returns the correspondent timestamp if a date object is passed", () => {
        expect(dateToTimestamp(new Date(1533164400000))).toBe(1533164400000);
    });

    it("returns the number if a number is passed", () => {
        expect(dateToTimestamp(1533164400000)).toBe(1533164400000);
    });
});

describe("havePropsChanged", () => {
    it("returns true if a prop has changed", () => {
        expect(havePropsChanged({ name: "bob", age: 12 }, { name: "gary" }, ["name", "age"])).toBe(true);
    });

    it("returns false if no prop has changed", () => {
        expect(havePropsChanged({ name: "bob", age: 12 }, { name: "bob" }, ["name", "age"])).toBe(false);
    });

    it("returns false if no listed prop has changed", () => {
        expect(havePropsChanged({ name: "gary", age: 12 }, { name: "bob" }, ["age"])).toBe(false);
        expect(havePropsChanged({ name: "gary", age: 12 }, { name: "bob", age: 12 }, ["age"])).toBe(false);
    });
});

describe("calculateChartsPositionsAndSizing", () => {
    it("calculate the sizes correctly if the play button is rendered", () => {
        expect(calculateChartsPositionsAndSizing({
            height: 150,
            renderPlayButton: true,
            spaceBetweenCharts: 15,
            size: {
                width: 1000
            }
        })).toEqual({
            "densityChartDimensions": {
                "height": 20,
                "width": 940
            },
            "histogramChartDimensions": {
                "height": 115,
                "heightForBars": 97,
                "width": 990
            }
        });
    });

    it("calculate the sizes correctly if the play button is not rendered", () => {
        expect(calculateChartsPositionsAndSizing({
            height: 150,
            renderPlayButton: false,
            spaceBetweenCharts: 15,
            size: {
                width: 1000
            }
        })).toEqual({
            "densityChartDimensions": {
                "height": 20,
                "width": 960
            },
            "histogramChartDimensions": {
                "height": 115,
                "heightForBars": 97,
                "width": 990
            }
        });
    });
});

describe("calculateChartSizesAndDomain", () => {
    it("returns the data if the data has changed", () => {
        expect(calculateChartSizesAndDomain({
            height: 150,
            renderPlayButton: false,
            spaceBetweenCharts: 15,
            size: {
                width: 1000
            },
            data: smallSample,
            xAccessor: xAccessor,
            yAccessor: yAccessor
        }, smallSample.slice(1), previousBrushDomain)).toEqual({
            "data": smallSample,
            "densityChartDimensions": {
                "height": 20,
                "width": 960
            },
            "histogramChartDimensions": {
                "height": 115,
                "heightForBars": 97,
                "width": 990
            }
        });
    });

    it("returns the data and domain if the domain has changed", () => {
        expect(calculateChartSizesAndDomain({
            height: 150,
            renderPlayButton: false,
            spaceBetweenCharts: 15,
            size: {
                width: 1000
            },
            data: smallSample,
            xAccessor: xAccessor,
            yAccessor: yAccessor
        }, smallSample.slice(1), { min: 1533164500146, max: 1533167401146 })).toEqual({
            "data": smallSample,
            "brushDomain": {
                "max": 1534164400001,
                "min": 1533309900034
            },
            "densityChartDimensions": {
                "height": 20,
                "width": 960
            },
            "histogramChartDimensions": {
                "height": 115,
                "heightForBars": 97,
                "width": 990
            }
        });
    });

    it("returns doesn't return data and domain if the data has not changed", () => {
        expect(calculateChartSizesAndDomain({
            height: 150,
            renderPlayButton: false,
            spaceBetweenCharts: 15,
            size: {
                width: 1000
            },
            data: smallSample,
            xAccessor: xAccessor,
            yAccessor: yAccessor
        }, smallSample, previousBrushDomain)).toEqual({
            "densityChartDimensions": {
                "height": 20,
                "width": 960
            },
            "histogramChartDimensions": {
                "height": 115,
                "heightForBars": 97,
                "width": 990
            }
        });
    });
});
