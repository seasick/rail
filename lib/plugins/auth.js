'use strict';


function auth(rail, opt_options) {
  opt_options = opt_options || {};

  // on construction, right before configure()
  rail.on('plugin-call', function(call, options) {
    console.log('auth::plugin-call');
  });

  // after configure()
  rail.on('plugin-configure', function(call, options) {
    console.log('auth::plugin-configure');
  });

  // after request()
  rail.on('plugin-request', function(call, options, request) {
    console.log('auth::plugin-request');
  });

  // on response
  rail.on('plugin-response', function(call, options, response) {
    console.log('auth::plugin-response');
  });
}
module.exports = auth;