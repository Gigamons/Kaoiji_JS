const router = require('express').Router();
const token = require('../../objects/Token');

let lastrestarted = new Date();

router.get('/status', (req, res) => {
  const status = {
    status: 200,
    users: token.Tokens.length - 1,
    lastrestart: lastrestarted
  }
  
  res.write(JSON.stringify(status));
  res.end();
});

module.exports = router;