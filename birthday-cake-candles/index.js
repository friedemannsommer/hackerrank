process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin = "";
var input_stdin_array = "";
var input_currentline = 0;

process.stdin.on('data', function (data) {
    input_stdin += data;
});

process.stdin.on('end', function () {
    input_stdin_array = input_stdin.split("\n");
    main();
});

function readLine() {
    return input_stdin_array[input_currentline++];
}

/////////////// ignore above this line ////////////////////

function parseHeights(heightArr) {
    let index = -1;
    const length = heightArr.length;
    const map = new Map();

    while (++index < length) {
        let current = heightArr[index];

        if (map.has(heightArr[index])) {
            map.set(current, map.get(current) + 1);
        } else {
            map.set(current, 1);
        }
    }

    return map;
}

function main() {
    const n = parseInt(readLine(), 10);
    const heightMap = parseHeights(readLine().split(' ').map(Number));

    const iterator = heightMap.keys();
    let current = iterator.next();
    let max = 0;

    while (!current.done) {
        if (current.value > max) {
            max = current.value
        }

        current = iterator.next();
    }

    process.stdout.write(String(heightMap.get(max)));
}
