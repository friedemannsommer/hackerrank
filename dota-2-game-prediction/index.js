const fs = require('fs')
const path = require('path')

const team1 = 0
const team2 = 1
const predictions = [new Map(), new Map()];
const offset = [
    [0, 5],
    [5, 10]
]

function processData(input) {
    const fileStream = fs.readFile(
        path.resolve(__dirname, './trainingdata.txt'),
        {
            encoding: 'ascii',
            flag: 'r'
        },
        (err, data) => {
            if (!err) {
                let splitedLine, team, current

                data.split('\n').forEach((line) => {
                    if (line.length <= 0) {
                        return;
                    }

                    splitedLine = line.split(',')

                    if (splitedLine[splitedLine.length - 1] === '1') {
                        current = team1
                    } else {
                        current = team2
                    }

                    team = splitedLine.slice(offset[current][0], offset[current][1])

                    team.forEach((name) => {
                        if (predictions[current].has(name)) {
                            predictions[current].set(name, predictions[current].get(name) + 1)
                        } else {
                            predictions[current].set(name, 1)
                        }
                    })
                })

                processQueries()
            } else {
                throw err
            }
        }
    )

    function processQueries() {
        const inputParts = input.split('\n')
        const queries = parseInt(inputParts[0], 10)
        let teamA, teamB, round
        let sumA = 0
        let sumB = 0

        inputParts.slice(1, queries + 1).forEach((line) => {
            if (line.length <= 0) {
                return;
            }

            round = line.split(',')
            teamA = round.slice(offset[team1][0], offset[team1][1])
            teamB = round.slice(offset[team2][0], offset[team2][1])

            teamA.forEach((name) => {
                if (predictions[team1].has(name)) {
                    sumA += predictions[team1].get(name)
                }
            })

            teamB.forEach((name) => {
                if (predictions[team2].has(name)) {
                    sumB += predictions[team2].get(name)
                }
            })

            if (sumA < sumB) {
                process.stdout.write('2\n')
            } else {
                process.stdout.write('1\n')
            }
        })
    }
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
