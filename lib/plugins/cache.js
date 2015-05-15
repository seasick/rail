'use strict';
var crypto = require('crypto');
var lru = require('lru-cache');



function CachePlugin(rail, options) {
  if (!(this instanceof CachePlugin)) {
    return new CachePlugin(rail, options);
  }
  rail.use('buffer');

  this._rail = rail;
  this._intercept = null;

  this.methods = ['HEAD', 'GET', 'POST'];
  this.enablePOST = options.enablePOST || false;

  this.cache = lru({
    max: options.max || 134217728 // 128 MiB
  });

  this._setup();
}
module.exports = CachePlugin;


CachePlugin.prototype._setup = function() {
  var self = this;
  var rail = this._rail;

  rail.on('plugin-configure', function(call, options) {
    var data, key = self._key(options);

    if (key) {
      call.cacheKey = key;
      data = self.cache.get(key);

      if (data) {
        call.__intercept('request', function(call2) {
          call2.__emit('response', data);
        });
      }
    }

  });

  rail.on('plugin-response', function(call, options, response) {
    self.intercept(call);
  });

  this._intercept = function(call, options, response) {
    self._interceptResponse(call, options, response);
  };
};


CachePlugin.prototype.intercept = function(call) {
  this._rail.plugins.buffer.intercept(call);
  call.__intercept('response', this._intercept);
};


CachePlugin.prototype._interceptResponse = function(call, options, response) {
  if (response.buffer) {
    this.cache.set(call.cacheKey, response);
  }

  call.__emit('response', response);
};


CachePlugin.prototype._key = function(options) {
  var req = options.request || {};
  if (!req.method || this.methods.indexOf(req.method) === -1) {
    return;
  }

  return crypto.createHash('md5')
      .update(JSON.stringify(options))
      .digest('hex');
};
