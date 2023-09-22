const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
//const lists = require('./models/list');
const { v4: uuid4 } = require('uuid');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Item = require('./models/item');
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
            res.redirect('/home');
        });
        //const author = req.user.id;
        // let allitems = await Items.find({});
        // res.render('show', { allitems });
    } catch (e) {
        console.log(e);
        res.redirect('/register');
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    //  let allLists = await lists.find({});
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



// app.post('/list/create', isLoggedIn, async (req, res) => {
//     const { title, text, dueDate } = req.body;
//     const author = req.user.id;
//     try {
//         const list = await lists.create({ title, task: text, author: author, dueDate: dueDate });
//         console.log('List created:', list);
//         res.redirect('/list/show');
//     } catch (error) {
//         console.error('Error creating list:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


app.get('/receive', async (req, res) => {
    let allItems = await Item.find({});
    res.render('receive', { allItems });
})

app.get('/history', async (req, res) => {

})
// app.post('/list/:id/Status', async (req, res) => {
//     const id = req.params.id;
//     const Status = req.body.dueDate;
//     if (Status) {
//         const list = await lists.findOne({ _id: id });
//         list.status = true;
//         console.log(list);
//         list.save();
//     }
//     res.redirect('/list/show');
// })

// app.get('/list/create', isLoggedIn, (req, res) => {
//     res.render('create');
// })

// app.post('/list/create', isLoggedIn, async (req, res) => {
//     const { title, text, dueDate } = req.body;
//     const author = req.user.id;
//     try {
//         const list = await lists.create({ title, task: text, author: author, dueDate: dueDate });
//         console.log('List created:', list);
//         res.redirect('/list/show');
//     } catch (error) {
//         console.error('Error creating list:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// app.get('/list/edit/:id', isLoggedIn, async (req, res) => {
//     try {
//         const list = await lists.findById(req.params.id);
//         if (list) {
//             // console.log('List found:', list);
//             res.render('update', { list });
//         } else {
//             console.log('List not found');
//             res.sendStatus(404);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.sendStatus(500);
//     }
// });
// app.patch('/list/edit/:id', isLoggedIn, async (req, res) => {
//     const { id } = req.params;
//     const newText = req.body.text;
//     try {
//         const updatedList = await lists.findByIdAndUpdate(id, { task: newText }, { new: true });
//         if (updatedList) {
//             //console.log('List updated:', updatedList);
//             res.redirect('/list/show');
//         } else {
//             console.log('List not found');
//             res.sendStatus(404);
//         }
//     } catch (error) {
//         console.error('Error updating list:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.listen(3000, () => {
    console.log("connected at 3000");
})