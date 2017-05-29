function processData(input) {
    const inputArr = input.split('\n')
    const stoneAmount = inputArr.slice(1).map(v => parseInt(v, 10))

    stoneAmount.forEach(e => {
        const x = e % 7

        process.stdout.write(((x >= 2 && x <= 6) ? 'First' : 'Second') + '\n')
    });
}

process.stdin.resume();
process.stdin.setEncoding("ascii");
_input = "";
process.stdin.on("data", function (input) {
    _input += input;
});

process.stdin.on("end", function () {
    processData(_input);
});
