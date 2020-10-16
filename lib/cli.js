/*
 * CLI-Related Tasks
 *
 */

// Dependencies
const readline = require('readline')
const util = require('util')
const debug = util.debuglog('cli')
const events = require('events')
class _EVENTS extends events {}
const e = new _EVENTS()
const os = require('os')
const v8 = require('v8')
const _data = require('./data')

// Instantiate the CLI module object
const cli = {}

// Input handlers
e.on('man', (str) => {
    cli.responders.help()
})

e.on('help', (str) => {
    cli.responders.help()
})

e.on('exit', (str) => {
    cli.responders.exit()
})

e.on('stats', (str) => {
    cli.responders.stats()
})

e.on('list users', (str) => {
    cli.responders.listUsers()
})

e.on('more user info', (str) => {
    cli.responders.moreUserInfo(str)
})

e.on('list checks', (str) => {
    cli.responders.listChecks(str)
})

e.on('more check info', (str) => {
    cli.responders.moreCheckInfo(str)
})

e.on('list logs', (str) => {
    cli.responders.listLogs()
})

e.on('more log info', (str) => {
    cli.responders.moreLogInfo(str)
})

// CLI FORMATTING - Create a horizontal line across the screen
cli.horizontalLine = () => {
    // Get the available screen size
    const width = process.stdout.columns

    let line = ''
    for (let i = 0; i < width; i++) {
        line += '-' 
    }
    console.log(line)
}

// CLI FORMATTING - Create a centered text on the screen
cli.centered = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : ''

    // Get the available screen size
    const width = process.stdout.columns

    // Calculate the left padding there should be
    const leftPadding = Math.floor((width - str.length) / 2)

    // Put in left padded spaces before the string itself
    let line = ''
    for (let i = 0; i < leftPadding; i++) {
        line += ' '
    }
    line += str
    console.log(line)
}

// CLI FORMATTING - Create a vertical space
cli.verticalSpace = (lines) => {
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1

    for (let i = 0; i < lines; i++) {
        console.log('')
    }
}

// Responders object
cli.responders = {}

// Help / man responder
cli.responders.help = () => {
    //console.log('You asked for help')

    const commands = {
        'exit': 'Kill the CLI (and reset the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get the statistics of the underlying OS and resource utilization',
        'list users': 'Show a list of all the registered (undeleted) users in the system',
        'more user info --{userId}': 'Show details of a specific user',
        'list checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and the "--down" flags are both optional',
        'more check info --{checkId}': 'Show details of a specified check',
        'list logs': 'Show a list of all the logs available to be read (compressed and uncompressed)',
        'more log info --{filename}': 'Show details of a specified log file'
    }
    
    // Show a header for the help page that is as wide as the screen
    cli.horizontalLine()
    cli.centered('CLI MANUAL')
    cli.horizontalLine()
    cli.verticalSpace(2)

    // Show each command followed by its explanation, in white and yellow respectively
    for (const key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m'
            const padding = 60 - line.length
            for (let i = 0; i < padding; i++) {
                line += ' '
            }
            line += value
            console.log(line)
            cli.verticalSpace()
        }
    }

    // Another vertical space
    cli.verticalSpace()

    // End with another horizontal line
    cli.horizontalLine()
}

// Exit responder
cli.responders.exit = () => {
    console.log('Exiting the command prompt and application')
    process.exit(0)
}

// Stats responder
cli.responders.stats = () => {
    // console.log('You asked for stats')

    // Compile an object of stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloaced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + ' Seconds'
    }

    // Show a header for the help page that is as wide as the screen
    cli.horizontalLine()
    cli.centered('SYSTEM STATISTICS')
    cli.horizontalLine()
    cli.verticalSpace(2)

    // Show each command followed by its explanation, in white and yellow respectively
    for (const key in stats) {
        if (stats.hasOwnProperty(key)) {
            const value = stats[key];
            let line = '\x1b[33m' + key + '\x1b[0m'
            const padding = 60 - line.length
            for (let i = 0; i < padding; i++) {
                line += ' '
            }
            line += value
            console.log(line)
            cli.verticalSpace()
        }
    }

    // Another vertical space
    cli.verticalSpace()

    // End with another horizontal line
    cli.horizontalLine()
}

// List users responder
cli.responders.listUsers = () => {
    // console.log('You asked to list users')

    // Get all registered users
    _data.list('users', (err, userIds) => {
        if (!err && userIds) {
            cli.verticalSpace()
            userIds.forEach(userId => {
                _data.read('users', userId, (err, userData) => {
                    if (!err && userData) {
                        let line = 'Name: ' + userData.firstName + ' ' + userData.lastName + ' Phone: ' + userData.phone + ' Checks: '
                        const numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0
                        line += numberOfChecks
                        console.log(line)
                        cli.verticalSpace()
                    }
                })
            })
        }
    })
}

// More user info responder
cli.responders.moreUserInfo = (str) => {
    // console.log('You asked for more user info', str)

    // Get the ID from the string
    const arr = str.split('--')
    const userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false

    if (userId) {
        // Lookup the user
        _data.read('users', userId, (err, userData) => {
            if (!err && userData) {
                // Remove the hashed password
                delete userData.hashedPassword

                // Print the User's JSON object with text highlighting
                cli.verticalSpace()
                console.dir(userData, {color: true})
                cli.verticalSpace()
            }
        })
    }
 
}

// List checks responder
cli.responders.listChecks = (str) => {
    // console.log('You asked to list checks', str)

    // Get all the checks
    _data.list('checks', (err, checkIds) => {
        if (!err && checkIds && checkIds.length > 0) {
            cli.verticalSpace()
            
            // Get thhe checks data
            checkIds.forEach(checkId => {
                _data.read('checks', checkId, (err, checkData) => {
                    if (!err && checkData) {
                        let includeCheck = false
                        const lowerStr = str.toLowerCase()

                        // Get the state, default to down
                        const state = typeof(checkData.state) == 'string' ? checkData.state : 'down'

                        // Get the state, default to unknown
                        const stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown'

                        // If the user has specified the state, or hasn't specified any state, include the current check accordingly
                        if (lowerStr.indexOf('--' + state) > -1 || (!lowerStr.includes('up') && !lowerStr.includes('down'))) {
                            const line = 'ID: ' + checkData.id + ' ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' State: ' + stateOrUnknown
                            console.log(line)
                            cli.verticalSpace()
                        }
                    }
                })
            })
        }
    })
}

// More check info responder
cli.responders.moreCheckInfo = (str) => {
    console.log('You asked for more check info', str)
}

// List losgs responder
cli.responders.listLogs = () => {
    console.log('You asked to list logs')
}

// More log info responder
cli.responders.moreLogInfo = (str) => {
    console.log('You asked for more log info', str)
}

// Input processor
cli.processIntput = (str) => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false

    // Only process the input if the user actially wrote something, Otherwise ignore.
    if (str) {
        // Codify the unique strings that identify the unique questions allowed to be asked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ]

        // Go through the possible inputs, emit an event whe a match is found
        let matchFound = false
        let counter = 0
        uniqueInputs.some(input => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true

                // Emit an event matching the unic input, and include the full string given by the user
                e.emit(input, str)
                return true
            }
        })

        // If no match found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry, try again')
        }

    }
}

// Init script
cli.init = () => {
    // Send the start message to the console in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '[admin] # '
    })

    // Create an initial prompt
    _interface.prompt()

    // Handle each line of input separately
    _interface.on('line', (str) => {
        // Send to the input processor
        cli.processIntput(str)

        // Re-initialize the prompt afterwards
        _interface.prompt()
    })

    // If the user stops the CLI, kill the associated process
    _interface.on('close', () => {
        process.exit(0)
    })
}

// Export the module
module.exports = cli