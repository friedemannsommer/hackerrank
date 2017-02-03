const offset = 2
const actions = {
    clean: 'CLEAN',
    right: 'RIGHT',
    left: 'LEFT',
    down: 'DOWN',
    up: 'UP'
}

function processData(input) {
    const inputParts = input.split('\n')
    let [y, x] = inputParts[0].split(' ')
    let [h, w] = inputParts[1].split(' ')
    
    x = parseInt(x, 10)
    y = parseInt(y, 10)
    w = parseInt(w, 10)
    h = parseInt(h, 10)
    
    const grid = inputParts.slice(offset, offset + h)
    
    process.stdout.write(
        nextMove(
            { y, x },
            parseGrid(grid)
        ) + '\n',
        'ascii'
    )
}

function parseGrid(rows) {
    const dirt = []
    
    rows.forEach((chars, yIndex) => {
        chars.split('').forEach((char, xIndex) => {
            if(char.charCodeAt(0) === 100) {
                dirt.push(
                    {
                        y: yIndex,
                        x: xIndex
                    }
                )
            }
        })
    })
    
    return dirt
}

function nextMove(bot, dirtArr) {
    let aR, bR
    
    dirtArr = dirtArr.sort((a, b) => {
        aR = Math.sqrt(Math.pow(a.x - bot.x, 2) + Math.pow(a.y - bot.y, 2))
        bR = Math.sqrt(Math.pow(b.x - bot.x, 2) + Math.pow(b.y - bot.y, 2))
        
        if(aR < bR) {
            return -1
        } else if(aR > bR) {
            return 1
        }
        
        return 0
    })
    
    const dirt = dirtArr[0]
    
    if(bot.y < dirt.y) {
        return actions.down
    }
    
    if(bot.y > dirt.y) {
        return actions.up
    }
    
    if(bot.x < dirt.x) {
        return actions.right
    }
    
    if(bot.x > dirt.x) {
        return actions.left
    }
    
    return actions.clean
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
