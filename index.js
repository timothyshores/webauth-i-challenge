const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const Users = require('./users/users-model.js');
const validUsernamePassword = require('./auth/middleware');

const server = express();

const sessionConfig = {
    name: 'webauth-ii',
    secret: 'using sessions and cookies project', // only our server knows this value for production store this in .env file
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 10,
        secure: false,
    },
    resave: false,
    saveUninitialized: true,
};

server.use(session(sessionConfig));
server.use(helmet());
server.use(express.json());
server.use(cors());

server.post('/api/register', (req, res) => {
    let user = req.body;

    const hash = bcrypt.hashSync(user.password, 12);
    user.password = hash;

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.username = user.username;
                res.status(200).json({ message: `Logged in as user: ${user.username}` });
            } else {
                res.status(401).json({ message: 'You shall not pass!' });
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

server.get('/api/users', validUsernamePassword, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

server.get('/api/logout', (req, res) => {
    req.session
        ? req.session.destroy(err => {
            err
                ? res.send('Error logging out')
                : res.send('Logging out')
        })
        : res.send('Already logged out')
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
