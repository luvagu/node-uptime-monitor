/*
 * Library that demonstrate somthing thrwing when it's init() is called
 * 
 */


// Container for the module
const example = {}

// Init function
example.init = () => {
    // This is an error created intentionally  (bar is not defined)
    let foo = bar
}

module.exports = example