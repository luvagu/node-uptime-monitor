/*
* Primary file for the API
*
*/

// Utility commands available:
// SERVER >>> NODE_DEBUG=server node index.js
// WORKERS >>> NODE_DEBUG=workers node index.js
// CLI >>> NODE_DEBUG=cli node index.js

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')
const cluster = require('cluster')
const os = require('os')

// Delclare the app
const app = {}

// Init functions
app.init = (callback) => {

    // If we're on the master thread, start the background workers and the CLI
    if (cluster.isMaster) {
        // Start the workers
        workers.init()

        // Start the CLI, but make sure it starts last
        setTimeout(() => {
            cli.init()
            callback()
        }, 50)

        // Fork the process
        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork()
        }

    } else {

        // If we're not on the master thread, start the HTTP server
        server.init()
    }
}

// Self executing (invoking) only if required directly
if (require.main === module) {
    app.init(() => {})
}


// Export the app
module.exports = app