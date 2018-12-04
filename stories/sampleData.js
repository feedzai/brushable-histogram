const NUMBER_OF_POINTS = 1000;
const data = [];
const startTimestamp = 1533164400000;

for (let i = 0; i < NUMBER_OF_POINTS; i++) {
    data.push({
        "timestamp": startTimestamp + Math.floor(Math.cos(i) * 1000),
        "total": Math.sin(i)
    });
}

export default data;
