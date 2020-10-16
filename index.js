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

// Delclare the app
const app = {}

// Init functions
app.init = () => {
    // Start the server
    server.init()

    // Start the workers
    workers.init()

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
       cli.init()
    }, 50)
}

// Execute
app.init()

// Export the app
module.exports = app