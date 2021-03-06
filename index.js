const _ = require ('lodash');


////////////////////////////////////////////////////
class MW {
  constructor (opts) {
    this._opts = opts || {};
    this._logger = this._opts.logger;
    
    const d = this._opts.discr;
    if (_.isBoolean (d)) {
      this.__d = () => this._opts.discr;
    }
    else if (_.isRegExp (d)) {
      this.__d = req => (req.originalUrl || req.url || '').match (this._opts.discr);
    }
    else if (_.isString (d)) {
      this.__d = req => (req.originalUrl || req.url || '').startsWith (this._opts.discr);
    }
    else if (_.isFunction (d)) {
      this.__d = d;
    }
    else {
      this.__d = () => true;
    }
  }


  /////////////////////////////////////////////////////
  _mw (req, res, next) {
    if (!this._logger) return next ();

    // return if not elligible (boolean, regex on path, funcion)
    const should_dump = this.__d (req);
    if (!should_dump) return next ();

    if (!req.socket.__express_wiretap__write__) {
      const sock = req.socket;
      const self = this;

      sock.__express_wiretap__write__ = sock.write;

      sock.write = function (data, encoding, cb) {
        const lines = (Buffer.isBuffer(data) ? data.toString(encoding || 'utf8') : data).split('\n');
        _.each (lines, l => self._logger.info('%s - wiretap > %s', (req.id || '-'), l));
        return this.__express_wiretap__write__ (data, encoding, cb);
      };
    }

    req.on ('data', data => {
      const lines = (Buffer.isBuffer(data) ? data.toString() : data).split('\n');
      _.each (lines, l => this._logger.info('%s - wiretap < %s', (req.id || '-'), l));
    });

    this._logger.info('%s - wiretap < %s %s HTTP/%s', (req.id || '-'), req.method, req.url, req.httpVersion);

    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      this._logger.info('%s - wiretap < %s: %s', (req.id || '-'), req.rawHeaders[i], req.rawHeaders[i + 1]);
    }

    this._logger.info('%s - wiretap < ', (req.id || '-'));

    next();
  }


  ///////////////////////////////////////////////////////////
  mw () {
    return (req, res, next) => this._mw (req, res, next);
  }
}

module.exports = MW;

