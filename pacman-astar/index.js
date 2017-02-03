const offset = 3
const types = {
    space: 45,
    wall: 37,
    food: 46
}

function processData(input) {
    const inputParts = input.split('\n')

    let [pY, pX] = inputParts[0].split(' ')
    let [fY, fX] = inputParts[1].split(' ')
    let [sY, sX] = inputParts[2].split(' ')

    const grid = inputParts.slice(offset, sY + offset)

    pY = parseInt(pY, 10)
    pX = parseInt(pX, 10)
    fY = parseInt(fY, 10)
    fX = parseInt(fX, 10)
    sY = parseInt(sY, 10)
    sX = parseInt(sX, 10)

    const graph = new Grid(grid, sY, sX)
    const path = aStar(graph.grid[pY][pX], graph.grid[fY][fX], graph)

    process.stdout.write(
        (path.length - 1) + '\n' +
        path.join('\n'),
        'ascii'
    )
}

function heuristic(a, b) {
    return (
        Math.abs(b.y - a.y) +
        Math.abs(b.x - a.x)
    )
}

function getPath(node) {
    const path = []
    let current = node

    while (current !== undefined && current !== null) {
        path.unshift(current)
        current = current.parent
    }

    return path
}

function Grid(grid, sY, sX) {
    let iY = -1
    let iX, row

    this.grid = Array(sY)

    while (++iY < sY) {
        row = grid[iY].split('')
        this.grid[iY] = Array(sX)
        iX = -1

        while (++iX < sX) {
            this.grid[iY][iX] = new GridNode(iY, iX, row[iX].charCodeAt(0))
        }
    }
}

Grid.prototype.neighbors = function (node) {
    const grid = this.grid
    const nodes = []
    const y = node.y
    const x = node.x

    if (grid[y - 1] && grid[y - 1][x] !== undefined) {
        nodes.push(grid[y - 1][x])
    }

    if (grid[y + 1] && grid[y + 1][x] !== undefined) {
        nodes.push(grid[y + 1][x])
    }

    if (grid[y][x - 1] !== undefined) {
        nodes.push(grid[y][x - 1])
    }

    if (grid[y][x + 1] !== undefined) {
        nodes.push(grid[y][x + 1])
    }

    return nodes
}

function GridNode(y, x, code) {
    this.y = y
    this.x = x
    this.g = Infinity
    this.h = Infinity
    this.parent = null

    if (code === types.wall) {
        this.weight = Infinity
    } else if (code === types.food) {
        this.weight = 0
    } else {
        this.weight = 1
    }
}

GridNode.prototype.isValid = function () {
    return !isFinite(this.weight)
}

GridNode.prototype.getWeight = function () {
    return this.weight
}

GridNode.prototype.toString = function () {
    return this.y + ' ' + this.x
}

function aStar(start, goal, grid) {
    const open = [start]

    let current, neighbors, neighbor, score

    start.g = 0
    start.h = heuristic(start, goal)

    while (open.length > 0) {
        current = open.pop()

        if (current === goal) {
            return getPath(current)
        }

        current.closed = true

        neighbors = grid.neighbors(current)

        for (neighbor of neighbors) {
            if (neighbor.closed === true || neighbor.isValid()) {
                continue
            }

            score = current.g + neighbor.getWeight()

            if (score < neighbor.g) {
                neighbor.parent = current
                neighbor.g = score
                neighbor.h = neighbor.g + heuristic(neighbor, goal)
            }

            if (open.indexOf(neighbor) < 0) {
                open.push(neighbor)
            }
        }

        open.sort((a, b) => {
            if (a.h < b.h) {
                return 1
            } else if (a.h > b.h) {
                return -1
            }

            return 0
        })
    }

    return []
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
