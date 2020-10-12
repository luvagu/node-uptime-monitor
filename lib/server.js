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

// Debug utility
// Use command 'NODE_DEBUG=server node index.js'
const util = require('util')
const debug = util.debuglog('server')

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
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound

        // If the request is within the public directory, use the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler

        // Counstruct the data object to send to the handler
        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        }

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload, contentType) => {

            // Determine the type of response (fallback to JSON)
            contentType = typeof(contentType) == 'string' ? contentType : 'json'

            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200

            // Return the response-parts that are content-specific
            let payloadString = ''
            if (contentType == 'json') {
                // Set the header content-type
                res.setHeader('Content-Type', 'application/json')
                // Use the payload called by the handler, or default to an empty object
                payload = typeof(payload) == 'object' ? payload : {}
                // Convert the payload to a string
                payloadString = JSON.stringify(payload)
            }

            if (contentType == 'html') {
                // Set the header content-type
                res.setHeader('Content-Type', 'text/html')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) == 'string' ? payload : ''
            }

            if (contentType == 'favicon') {
                // Set the header content-type
                res.setHeader('Content-Type', 'image/x-icon')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            if (contentType == 'css') {
                // Set the header content-type
                res.setHeader('Content-Type', 'text/css')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            if (contentType == 'js') {
                // Set the header content-type
                res.setHeader('Content-Type', 'application/x-javascript')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            if (contentType == 'png') {
                // Set the header content-type
                res.setHeader('Content-Type', 'image/png')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            if (contentType == 'jpg') {
                // Set the header content-type
                res.setHeader('Content-Type', 'image/jpeg')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            if (contentType == 'plain') {
                // Set the header content-type
                res.setHeader('Content-Type', 'text/plain')
                // Use the payload called by the handler, or default to an empty string
                payloadString = typeof(payload) !== 'undefined' ? payload : ''
            }

            // Return the response-parts that are common to all content-types
            res.writeHead(statusCode)
            res.end(payloadString)

            // Log the response, if it's 200, print green otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            }
            
        })
    })

}

server.router = {
    ping: handlers.ping,
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    public: handlers.public    
}

// Init script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => console.log('\x1b[36m%s\x1b[0m', `The http server is listening on port ${config.httpPort} in ${config.envName} mode`))

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => console.log('\x1b[35m%s\x1b[0m', `The https server is listening on port ${config.httpsPort} in ${config.envName} mode`))
}

// Export the module
module.exports = server