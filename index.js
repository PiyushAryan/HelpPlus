const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = 'pk.eyJ1IjoibXVuYWYxMDAwIiwiYSI6ImNsa2I0YnB5cDA4cHYzYm8wYW54dnU3cWMifQ.lwRg1gI5-BcLTmHPKPUmwQ';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const ejsMate = require('ejs-mate');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_methid'));
app.engine('ejs', ejsMate);
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

app.post('/register', async (req, res, next) => {
    try {
        const { email, username, password, contact } = req.body;
        const user = new User({ email, username, contact });
        await User.register(user, password);
        passport.authenticate('local')(req, res, () => {
            res.redirect('/home');
        });
    } catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/home');
    });
});

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    res.redirect('/home');
})

app.get('/receive', isLoggedIn, async (req, res) => {
    try {
        const author = req.user.id;
        const allItems = await Items.find();
        res.render('receive', { allItems });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/donate', isLoggedIn, (req, res) => {
    res.render('donate');
})

app.post('/donate', isLoggedIn, async (req, res) => {
    const { value, additionalInfo, location } = req.body;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()
    const author = req.user.id;
    try {
        const item = await Items.create({ donate: value, des: additionalInfo, author: author, geometry: geoData.body.features[0].geometry, location: location });
        await item.save();
        //console.log('item:', item);
        res.redirect('/receive');
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/:id/Status', async (req, res) => {
    try {
        const doneeId = req.user.id;
        const doneeUsername = req.user.username;
        const id = req.params.id;
        const item = await Items.findOne({ _id: id });
        if (!item) {
            return res.status(404).send('Item not found');
        }
        item.status = true;
        item.doneeId = doneeId;
        item.doneeUsername = doneeUsername;
        await item.save();
        res.redirect('/receive');
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/showDetails/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const details = await User.findById(id);
    res.render('showDetails', { details });
})

app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const id = req.user.id;
        const allItems = await Items.find({ author: id });
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { userDetails, allItems });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log("connected at 3000");
})