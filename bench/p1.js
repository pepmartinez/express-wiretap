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
