import { calculatePositionAndDimensions } from "./histogramBarGeometry";

describe("calculatePositionAndDimensions", () => {
    it("should calculate the position and dimensions for the given bar", () => {
        const xScale = (x) => x;
        const yScale = (y) => y;
        const bar = {
            x0: 0,
            x1: 40,
            yValue: 10
        };
        const heightForBars = 100;
        const margin = 2;

        expect(calculatePositionAndDimensions({ xScale, yScale, heightForBars, margin, bar })).toEqual({
            height: 90,
            width: 38,
            x: 1,
            y: 10
        });
    });
});
