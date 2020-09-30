const USER = [{
    id: 1,
    username: 'test1',
    password: 'test1@123'
}, {
    id: 2,
    username: 'test2',
    password: 'test2@123'
}, {
    id: 3,
    username: 'test3',
    password: 'test3@123'
}]
const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bodyParse = require('body-parser')
const session = require('express-session')
const app = express()
app.use(bodyParse.json())
app.use(bodyParse.urlencoded({extended: true}))

app.use(session({secret: "Shh, its a secret!", resave: true, saveUninitialized: true}))
app.use(passport.initialize()) 
console.log('1')
app.use(passport.session())
console.log('2')
passport.serializeUser((user, done) => {
    console.log('5')
    if(!user) {
        return done('USER IS EMPTY')
    }
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    if(!id) {
        return done('ID IS EMPTY')
    }
    let userDb = USER.find(u => {
        return id == u.id
    }) 
    if(!userDb) {
        return done('CANNOT FIND USER')
    }
    done(null, userDb)
})

passport.use('local', new LocalStrategy({ // first param is name of strategy, default is 'local'
    usernameField: 'username',
    passwordField: 'password'
}, function(username, password, done) {
    console.log('3')
    let user = USER.find(u => {
        return username == u.username && password == u.password
    })
    if(!user) {
        return done('CANNOT FIND USER')
    }
    done(null, user, {description: 'pass user'})
}))
app.get('/login-default', function(req, res) {
    let page = `<form method="POST">
                    <input type="text" name="username" placeholder="username">
                    <input type="password" name="password" placeholder="password">
                    <input type="submit" value="submit">
                </form>`
    res.send(page)
})

app.post('/login-default', passport.authenticate('local'), function(req, res) {
    console.log(req.user, req.session)
    res.send('logined!')
})

app.get('/login', function(req, res) {
    let page = `<form method="POST">
                    <input type="text" name="username" placeholder="username">
                    <input type="password" name="password" placeholder="password">
                    <input type="submit" value="submit">
                </form>`
    res.send(page)
})

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        console.log('4')
        if(err) {
            return next(err)
        } 
        if(!user) {
            return next('USER IS EMPTY')
        }
        console.log(err, user, info)
        req.login(user, req, function(err) {
            console.log('6')
            if(err) {
                return next(err)
            }
            next()
        })
    })(req, res, next)
}, function(req, res) {
    console.log('7')
    res.send('logined!')
})


app.get('/restrict', function(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    next('NO RESTRICT')
}, function(req, res) {
    res.send('restrict!')
})

app.listen(3001, function() {
    console.log('Listen 3001')
})