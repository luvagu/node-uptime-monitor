/*
* Primary file for the API
*
*/

// Dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')

// Delclare the app
const app = {}

// Init functions
app.init = () => {
    // Start the server
    server.init()

    // Start the workers
    workers.init()
}

// Execute
app.init()

// Export the app
module.exports = app