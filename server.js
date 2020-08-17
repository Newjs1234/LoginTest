const http = require('http');

const express = require('express'),
      session = require('express-session'),
      bodyParser = require('body-parser'),
      ejs = require('ejs');

const port = 3000;

const app = express();

app.set('view engine', 'ejs');

// Data process ENV
const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quiet,it\'asecret',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

// Users
const users = [
    { id: 1, name: 'Alex', email: 'alex@gmx.de', password: 'test' },
    { id: 2, name: 'Udo', email: 'udo@gmx.de', password: 'test' },
    { id: 3, name: 'Otto', email: 'ottox@gmx.de', password: 'test' }
]

app.use(bodyParser.urlencoded({
    extended: true
}))


// Session
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        naxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

// Middelware

const redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
};

const redirectHome = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('/home');
    } else {
        next()
    }
};

app.use((req, res, next) => {
    const { userId } = req.session
    if(userId) {
        //res.locals.user = users.find(user => user.id === userId);
        res.locals.user = users.find(user => user.id === userId)
        console.log(res.locals.user);
    }
    
    next()
})

// Login
app.get('/login', redirectHome, (req, res) => {
   const { userId } = req.session
   res.render('login', {  });
});

app.post('/login', redirectHome, (req, res) => {
    const { email, password } = req.body

    if(email && password) {
        const user = users.find(user => user.email === email && user.password === password)


        if(user) {
            req.session.userId = user.id
            return res.redirect('/home');
        }
    }
    res.redirect('/login');
});

// Home area
app.get('/home', redirectLogin, (req, res) => {
    //const { user } = req.locals
    console.log(res.locals.user.name);
    //console.log(req.session.userId);
    res.render('home', { name: res.locals.user.name, email: res.locals.user.email });
});

// Registrieren
app.get('/registrieren', (req, res) => {
    res.render('registrieren', {  });
});

app.post('/registrieren', redirectHome, (req, res) => {
    const { name, email, password } = req.body
    if(name && email && password ) {
        const exists = users.some(
            user => user.email === email
        )

        if(!exists) {
            const user = {
                id: users.length + 1,
                name,
                email,
                password
            }

            users.push(user);

            req.session.userId = user.id

            return res.redirect('/home');
        }
    }

    res.redirect('/registrieren');
});

//logout
app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if(err) {
            res.redirect('/home');
        }

        res.clearCookie(SESS_NAME)
        res.redirect('/login');
    })
});



const server = http.createServer(app);

server.listen(port, () => {
    console.log(`http://localhos:${port}`);
});
