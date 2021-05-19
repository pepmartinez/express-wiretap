const should =  require ('should');
const _ =       require ('lodash');
const request = require ('supertest');
const express = require ('express');
const util =    require ('util');
const wiretap = require ('../');

const lorem_ipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eu aliquam nulla. Nam consectetur malesuada tortor eu fringilla. Duis eleifend mollis mi, vel pharetra lacus placerat nec. Quisque ipsum nisl, ultrices sed ex nec, suscipit malesuada leo. Nunc venenatis malesuada leo, laoreet feugiat mauris consequat vel. Vivamus at congue arcu.';

class Logger {
  constructor () {
    this._buffer = '';
  }

  verbose (str, ...args) {
    const line = util.format (str, ...args);
    this._buffer = this._buffer + (line + '\n');
  }

  info (str, ...args) {
    this.verbose (str, ...args);
  }

  buffer () {
    return this._buffer;
  }

  clear () {
    this._buffer = '';
  }
}

function _get_me_an_app (discr) {
  const logger = new Logger();
  const wt = new wiretap ({logger, discr});
  const app = express ();
  app.use ((req, res, next) => {req.id = 'zxcvbnm'; next ();})
  app.use (wt.mw ());
  app.all ('*', (req, res) => {
    res.send ({q: req.query, hdr: req.headers.hdr});
  });

  return {app, logger, wt};
}


describe('wiretap', () => {
  before(done => {
    done ();
  });

  after(done => {
    done ();
  });

  it('logs GETs ok', done => {
    const {app, logger, mw} = _get_me_an_app ();

    request(app)
    .get('/aaaa/bbbb')
    .query ({asdfghjkl: 'qwertyuiop'})
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb\?asdfghjkl=qwertyuiop HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 51/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{"asdfghjkl":"qwertyuiop"},"hdr":"1234567890"}\n/);

      done ();
    });
  });

  it('logs POSTs with body ok', done => {
    const {app, logger, mw} = _get_me_an_app ();

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Type: text\/plain/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Length: 342/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 27/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{},"hdr":"1234567890"}\n/);

      done ();
    });
  });


  it('logs ok with boolean-true discr', done => {
    const {app, logger, mw} = _get_me_an_app (true);

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Type: text\/plain/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Length: 342/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 27/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{},"hdr":"1234567890"}\n/);

      done ();
    });
  });

  it('logs ok with regexp-match discr', done => {
    const {app, logger, mw} = _get_me_an_app (/^\/aaaa\//);

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Type: text\/plain/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Length: 342/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 27/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{},"hdr":"1234567890"}\n/);

      done ();
    });
  });

  it('logs ok with prfix-match discr', done => {
    const {app, logger, mw} = _get_me_an_app ('/aaaa/');

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Type: text\/plain/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Length: 342/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 27/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{},"hdr":"1234567890"}\n/);

      done ();
    });
  });


  it('logs ok with function-rettrue discr', done => {
    const {app, logger, mw} = _get_me_an_app (req => req.headers.hdr == '1234567890');

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.match (/^zxcvbnm - wiretap < GET \/aaaa\/bbbb HTTP\/1\.1/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < hdr: 1234567890/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < User-Agent: node-superagent/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Type: text\/plain/);
      logger.buffer ().should.match (/zxcvbnm - wiretap < Content-Length: 342/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > HTTP\/1\.1 200 OK/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > X-Powered-By: Express/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Type: application\/json; charset=utf-8/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > Content-Length: 27/);
      logger.buffer ().should.match (/zxcvbnm - wiretap > {"q":{},"hdr":"1234567890"}\n/);

      done ();
    });
  });


  it('does not log with boolean-false discr', done => {
    const {app, logger, mw} = _get_me_an_app (false);

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.eql ('');
      done ();
    });
  });

  it('does not log with regexp-nonmatch discr', done => {
    const {app, logger, mw} = _get_me_an_app (/^\/bbb/);

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.eql ('');
      done ();
    });
  });

  it('does not log with prefix-nonmatch discr', done => {
    const {app, logger, mw} = _get_me_an_app ('/b');

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.eql ('');
      done ();
    });
  });

  it('does not log with function-retfalse discr', done => {
    const {app, logger, mw} = _get_me_an_app (req => req.headers.hdr == '666');

    request(app)
    .get('/aaaa/bbbb')
    .send (lorem_ipsum)
    .type ('text')
    .set ({hdr: 1234567890})
    .end((err, res) => {
      logger.buffer ().should.eql ('');
      done ();
    });
  });


});


