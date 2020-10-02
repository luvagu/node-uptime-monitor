/*
* Primary file for the API
*
*/

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')

// Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)    
})

// Start the HTTP server
httpServer.listen(config.httpPort, () => console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`))

// Instantiate the HTTPS server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)    
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`))

// All the server logic for both http and https servers
const unifiedServer = (req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path e.g. /foo or /foo/bar
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // Get the query string as an object
    const queryString = parsedUrl.query

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
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // Counstruct the data object to send to the handler
        const data = {
            trimmedPath: trimmedPath,
            queryString: queryString,
            method: method,
            header: headers,
            payload: buffer
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

// Define the handlers
const handlers = {}

// Sample handler
handlers.ping = (data, callback) => {
    // Callback a http status code, and a payload object
    callback(200)
}

handlers.notFound = (data, callback) => {
    callback(404)
}

const router = {
    ping: handlers.ping
}
