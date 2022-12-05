const jwt = require('jsonwebtoken');
const CONSTANTS = require('../helpers/Constants');

const auth = (req, res, next) => {
  try {
    const header = req.header('Authorization');
    const token = header && header.split(' ')[1];

    if (!token) {
      return res.status(401).send({
        status: false,
        message: 'Access denied!',
      });
    }

    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = verified;

    next();
  } catch {
    res.status(400).send({
      status: false,
      message: CONSTANTS.failed,
    });
  }
};

module.exports = auth;
