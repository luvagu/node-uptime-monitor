/*
* Primary file for  the API
*
*/

// Dependencies
const http = require('http')
const url = require('url')

// Server response to all requests with a string
const server = http.createServer((req, res) => {
    res.end('Hello world!\n')
})

// Start the server on port 3000
server.listen(3000, () => console.log('The server is listening on port 3000'))