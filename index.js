const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');

const { v4: uuid4 } = require('uuid');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Items = require('./models/item');
const flash = require('connect-flash');


mongoose.connect('mongodb://127.0.0.1:27017/Donation', {
    serverSelectionTimeoutMS: 5000, // 5 seconds
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log("connection open");
    })
    .catch(err => {
        console.log(err, "error");
    })

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}


app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '/view'))

app.use(methodOverride('_methid'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/home', (req, res) => {
    res.render('home');
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
        });
        res.render('home',);
    } catch (e) {
        console.log(e);
        res.redirect('/home');
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    //let allLists = await lists.find({});
    res.redirect('/home');
})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/home');
    });
});

app.get('/receive', isLoggedIn, async (req, res) => {
    const author = req.user.id;
    let allItems = await Items.find({});
    res.render('receive', { allItems });
})


app.get('/donate', isLoggedIn, (req, res) => {
    res.render('donate');
})

app.post('/donate', isLoggedIn, async (req, res) => {
    const { value, additionalInfo } = req.body;
    const author = req.user.id;
    try {
        const item = await Items.create({ donate: value, des: additionalInfo, author: author });
        await item.save();
        console.log('item:', item);
        res.redirect('/receive');
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/history/:id',async(req,res)=>{
    const {id}=req.params;
    const allItems=await Items.find({author:id});
    res.render('history',{allItems});
})

app.listen(3000, () => {
    console.log("connected at 3000");
})