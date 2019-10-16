# express-wiretap
server wire logs and insights for express

This express middleware provides a wire log for any express server, which is very useful for debugging, or in servers where minute audit is needed

## Usage
Better see an example:
```js
const express = require ('express');
const wiretap = require ('../');


const cfg = {
  logger: {
    verbose: function () {console.log.apply (console, arguments)},
    info:    function () {console.log.apply (console, arguments)}
  }
};

const app = express ();
const wt = new wiretap (cfg);
app.use (wt.mw ());

app.all ('*', (req, res) => {
  req.on ('end', () => {
    res.send ({q: req.query, hdr: req.headers});
  });
});

app.listen (6677, () => {
  console.log ('ready');
});
```
The middleware is created using a `opts` object:
* logger: the logger to use. It expects a simple object with 2 methods, `verbose` and `info`, where each take the same arguments a console.log call would: a string and extra params to substitute in the `util.format` fashion. You can see a simple logger in the example above

with the server above running, you can call it:
```sh
$ curl -X POST --data-bin 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop' http://localhost:6677/a/b/c?ggg=yyyyyy
```
and you'd get the following log:
```
- - wiretap < POST /a/b/c?ggg=yyyyyy HTTP/1.1
- - wiretap < Host: localhost:6677
- - wiretap < User-Agent: curl/7.64.0
- - wiretap < Accept: */*
- - wiretap < Content-Length: 60
- - wiretap < Content-Type: application/x-www-form-urlencoded
- - wiretap <
- - wiretap < qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop
- - wiretap > HTTP/1.1 200 OK
- - wiretap > X-Powered-By: Express
- - wiretap > Content-Type: application/json; charset=utf-8
- - wiretap > Content-Length: 169
- - wiretap > ETag: W/"a9-FyQ6MRGi44gyIl3jwXCNLLwq6ng"
- - wiretap > Date: Wed, 16 Oct 2019 15:13:54 GMT
- - wiretap > Connection: keep-alive
- - wiretap >
- - wiretap >
- - wiretap > {"q":{"ggg":"yyyyyy"},"hdr":{"host":"localhost:6677","user-agent":"curl/7.64.0","accept":"*/*","content-length":"60","content-type":"application/x-www-form-urlencoded"}}
```

# Notes
* The wire log is not pitch-perfect: it is not a full log attached to the socket. For example, any `100-continue` exchange is not shown
* If the reqs are marked with an id (such as when using [express-request-id](https://www.npmjs.com/package/express-request-id)) the id is included in the log
