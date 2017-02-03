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
        let outputBuffer, fileBuffer;

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
                log('ERROR')
                console.error(err)
            })

            child.on('disconnet', () => {
                log('DISCONNECTED')
            })

            child.stderr.on('data', (data) => {
                log('ERROR')
                console.log(Buffer.from(data).toString('ascii'))
            })

            child.stdout.on('data', (data) => {
                if (outputBuffer !== undefined) {
                    outputBuffer = Buffer.concat([outputBuffer, Buffer.from(data)])
                } else {
                    outputBuffer = Buffer.from(data)
                }
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
                    log('FAIL')
                } else {
                    log('PASS')
                }

                log('given output')
                console.log(outputBuffer.toString('ascii'))
                log('for expected output see this file:', getFilePath(outputFiles[index]))

                if (child.connected) {
                    child.kill('SIGTERM')
                }
            }

            function log(...msg) {
                console.log(`[${child.pid} | ${Date.now()} | ${getFilePath(file)}] ${msg.join(' ')}`)
            }

            function getFilePath(filePath) {
                return filePath.slice(__dirname.length + 1)
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