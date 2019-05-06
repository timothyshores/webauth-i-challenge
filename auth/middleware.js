const bcrypt = require('bcryptjs');
const Users = require('../users/users-model.js');

function validUsernamePassword(req, res, next) {
    const { username, password } = req.headers;

    if (username && password) {
        Users.findBy({ username })
            .first()
            .then(user => {
                (user && bcrypt.compareSync(password, user.password))
                    ? next()
                    : res.status(401).json({ message: 'You shall not pass!' });
            })
            .catch(error => {
                res.status(500).json(error);
            });
    }
    else {
        res.status(400).json({ message: 'You shall not pass!' })
    }
}

module.exports = validUsernamePassword;