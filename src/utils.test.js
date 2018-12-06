import {
    isObject,
    histogramDefaultYAxisFormatter,
    multiDateFormat,
    isHistogramDataEqual,
    dateToTimestamp
} from "./utils";

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
        expect(multiDateFormat(new Date(1533164400000))).toBe("Thu 02");
        expect(multiDateFormat(new Date(1533164401000))).toBe(":01");
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
});

describe("dateToTimestamp", () => {
    it("returns the correspondent timestamp if a date object is passed", () => {
        expect(dateToTimestamp(new Date(1533164400000))).toBe(1533164400000);
    });

    it("returns the number if a number is passed", () => {
        expect(dateToTimestamp(1533164400000)).toBe(1533164400000);
    });
});

