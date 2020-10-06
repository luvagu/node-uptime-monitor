/*
 * Server-related tasks
 * 
 */

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
const path = require('path')

const config = require('./config')
const handlers = require('./handlers')
const helpers = require('./helpers')

// @TODO remove
// helpers.sendTwilioSms('4158675309', 'test', (e) => console.log('Twilio response', e))

// Instantiate the server module object
const server = {}

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res)    
})

// Instantiate the HTTPS server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res)    
})

// All the server logic for both http and https servers
server.unifiedServer = (req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path e.g. /foo or /foo/bar
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    const queryStringObject = parsedUrl.query

    // Get the HTTP Method
    const method = req.method.toLocaleLowerCase()

    // Get the headers as an object
    const headers = req.headers

    // Get the payload (body), if any
    const decoder = new StringDecoder('utf-8')
    let buffer = ''
    req.on('data', data => buffer += decoder.write(data))
    req.on('end', () => {
        buffer += decoder.end()

        // Choose the handler this request should go to. If one is not found use the not found handler
        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound

        // Counstruct the data object to send to the handler
        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200

            // Use the payload called bu the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {}

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload)

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            // Log the response
            console.log('Returning this response: ', statusCode, payloadString)
        })
    })

}

server.router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks
}

// Init script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`))

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`))
}

// Export the module
module.exports = server