const NUMBER_OF_POINTS = 60000;
const startTimestamp = 1533164400000;

/**
 * Calculates some sample data
 *
 * @param {number} numberOfPoints
 * @returns {Array.<Object>}
 */
export function calculate(numberOfPoints) {
    const data = [];

    for (let i = 0; i < numberOfPoints; i++) {
        data.push({
            "timestamp": startTimestamp + Math.abs(Math.floor(Math.cos(i) * 1000000000)),
            "total": Math.abs(Math.sin(i))
        });
    }

    return data;
}

export default calculate(NUMBER_OF_POINTS);

export const smallSample = calculate(10);
