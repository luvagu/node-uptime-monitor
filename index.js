/*
* Primary file for the API
*
*/

// Utility commands available:
// SERVER >>> NODE_DEBUG=server node index.js
// PERFORMANCE >>> NODE_DEBUG=performance node index.js
// WORKERS >>> NODE_DEBUG=workers node index.js
// CLI >>> NODE_DEBUG=cli node index.js

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')
const cli = require('./lib/cli')

// Delclare the app
const app = {}

// Init functions
app.init = (callback) => {
    // Start the server
    server.init()

    // Start the workers
    workers.init()

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
       cli.init()
       callback()
    }, 50)
}

// Self executing (invoking) only if required directly
if (require.main === module) {
    app.init(() => {})
}


// Export the app
module.exports = app