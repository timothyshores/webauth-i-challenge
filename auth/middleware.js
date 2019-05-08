const bcrypt = require('bcryptjs');
const Users = require('../users/users-model.js');

function validUsernamePassword(req, res, next) {
    (req.session && req.session.username)
        ? next()
        : res.status(401).json({ message: 'Please login to continue' });
}

module.exports = validUsernamePassword;