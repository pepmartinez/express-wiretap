var _ = require ('lodash');


class MW {
  constructor (opts) {
    this._opts = opts;
    this._logger = opts.logger;
  }

  _mw (req, res, next) {
    if (!this._logger) return next ();

    if (!req.socket.__express_wiretap__write__) {
      var sock = req.socket;
      var self = this;

      sock.__express_wiretap__write__ = sock.write;

      sock.write = function (data, encoding, cb) {
        var lines = (Buffer.isBuffer(data) ? data.toString(encoding) : data).split('\n');
        _.each (lines, l => self._logger.info('%s - wiretap > %s', (req.id || '-'), l));
        return this.__express_wiretap__write__ (data, encoding, cb);
      };
    }

    req.on ('data', data => {
      const lines = (Buffer.isBuffer(data) ? data.toString() : data).split('\n');
      _.each (lines, l => this._logger.info('%s - wiretap < %s', (req.id || '-'), l));
    });

    this._logger.info('%s - wiretap < %s %s HTTP/%s', (req.id || '-'), req.method, req.url, req.httpVersion);

    for (var i = 0; i < req.rawHeaders.length; i += 2) {
      this._logger.info('%s - wiretap < %s: %s', (req.id || '-'), req.rawHeaders[i], req.rawHeaders[i + 1]);
    }

    this._logger.info('%s - wiretap < ', (req.id || '-'));

    next();
  }

  mw () {
    return (req, res, next) => this._mw (req, res, next);
  }
}

module.exports = MW;

