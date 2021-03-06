'use strict';



function JSONPlugin(rail, options) {
  if (!(this instanceof JSONPlugin)) {
    return new JSONPlugin(rail, options);
  }
  rail.use('buffer');

  this._rail = rail;

  this.auto = options.auto || false;
  this.max = options.max || 1048576; // 1 MiB

  this._setup();
}
module.exports = JSONPlugin;


JSONPlugin.prototype._setup = function() {
  var self = this;
  var rail = this._rail;

  rail.on('plugin-response', function(call, options, response) {
    if (options.json || self.auto &&
        response.headers['content-type'] === 'application/json') {
      self.intercept(call);
    }
  });

  this._intercept = function(call, options, response) {
    self._interceptResponse(call, options, response);
  };
};


JSONPlugin.prototype.intercept = function(call) {
  this._rail.plugins.buffer.intercept(call);
  call.__intercept('response', this._intercept);
};


JSONPlugin.prototype._interceptResponse = function(call, options, response) {
  if (response.buffer) {

    if (response.buffer.length > this.max) {
      call.emit('warn', 'json', 'blocked', 'max length exceeded');

    } else {
      try {
        response.json = JSON.parse(response.buffer);
      } catch (err) {
        call.emit('warn', 'json', 'failed', 'parse error');
      }
    }
  }

  call.__emit('response', response);
};
