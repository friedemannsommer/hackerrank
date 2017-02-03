const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const current = path.resolve(__dirname, 'dota-2-game-prediction')
const output = path.resolve(current, 'output')
const app = path.resolve(current, 'index.js')
const input = path.resolve(current, 'input')

function run() {
    Promise.all([
        getFileNames(input),
        getFileNames(output)
    ]).then((ioFiles) => {
        const [inputFiles, outputFiles] = ioFiles;
        let child, inputStream, outputStream;
        let outputBuffer, fileBuffer, temp;

        if (inputFiles.length <= 0 || outputFiles.length <= 0) {
            console.error(new Error('not enough test files'))
            process.exit(1)
        }

        inputFiles.forEach((file, index) => {
            if (outputFiles[index] === undefined) {
                console.error(new Error(
                    `input-file (${file}) has no corresponding output-file`
                ))
                return;
            }

            child = cp.spawn(process.execPath, [app], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            inputStream = fs.createReadStream(file, {
                flags: 'r',
                encoding: 'ascii',
                autoClose: true
            });

            outputStream = fs.createReadStream(outputFiles[index], {
                flags: 'r',
                encoding: 'ascii',
                autoClose: true
            });

            inputStream.pipe(child.stdin)

            outputStream.on('data', (data) => {
                if (fileBuffer !== undefined) {
                    fileBuffer = Buffer.concat([fileBuffer, Buffer.from(data)])
                } else {
                    fileBuffer = Buffer.from(data)
                }
            })

            outputStream.on('end', () => {
                if (!child.connected && outputBuffer !== undefined) {
                    checkResponse()
                }
            })

            child.on('error', (err) => {
                console.error(err)
            })

            child.on('disconnet', () => {
                console.info(`child #${child.pid} disconneted`)
            })

            child.stderr.on('data', (data) => {
                console.log(`child #${child.pid} sent error`)
                console.log(Buffer.from(data).toString('ascii'))
            })

            child.stdout.on('data', (data) => {
                temp = Buffer.from(data)

                if (outputBuffer !== undefined) {
                    outputBuffer = Buffer.concat([outputBuffer, temp])
                } else {
                    outputBuffer = temp
                }

                console.log(`child #${child.pid} sent`)
                console.log(temp.toString('ascii'))
            })

            child.stdout.on('end', () => {
                if (!outputStream.readable && fileBuffer !== undefined) {
                    checkResponse()
                }
            })

            function checkResponse() {
                if (fileBuffer === undefined || outputBuffer === undefined) {
                    return;
                }

                if (fileBuffer.compare(outputBuffer) !== 0) {
                    console.log(`child #${child.pid} wrong anwser`)
                } else {
                    console.log(`child #${child.pid} correct anwser`)
                }

                console.log('given output')
                console.log(outputBuffer.toString('ascii'))
                console.log('expected output')
                console.log(fileBuffer.toString('ascii'))
            }
        });
    }, (err) => {
        console.error(err);
        process.exit(1);
    })
}

function getFileNames(directory) {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, inputFiles) => {
            if (err) {
                reject(err)
            } else {
                resolve(
                    inputFiles.map(name => path.resolve(directory, name))
                )
            }
        })
    })
}

run()