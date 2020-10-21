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
const example = require('./lib/exampleDebuggingProblem')

// Delclare the app
const app = {}

// Init functions
app.init = () => {
    // Start the server
    debugger;
    server.init()
    debugger;

    // Start the workers
    debugger;
    workers.init()
    debugger;

    // Start the CLI, but make sure it starts last
    debugger;
    setTimeout(() => {
       cli.init()
    }, 50)
    debugger;

    
    // Set foo at 1
    debugger;
    let foo = 1
    console.log('Just assigned 1 to foo');
    debugger;

    // Increment foo
    foo++
    console.log('Just incremented foo');
    debugger;

    // Square foo
    foo = foo * foo
    console.log('Just squared foo');
    debugger;

    // Convert foo to string
    foo = foo.toString()
    console.log('Just converted foo to string');
    debugger;

    // Call example init
    example.init()
    console.log('Just called the library');
    debugger;
}

// Execute
app.init()

// Export the app
module.exports = app