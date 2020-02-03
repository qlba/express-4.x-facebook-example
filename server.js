require('dotenv').config();

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-google-oauth20').Strategy;


// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
    clientID: '1095237036957-qam61ccacseoupde2bj0a3ps4ou61peo.apps.googleusercontent.com',
    clientSecret: 'ER8jiIuBdA56pw2Tfk9e8uOd',
    callbackURL: '/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Google profile is supplied as the user
    // record.  In a production-quality application, the Google profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Google profile is serialized
// and deserialized.
let USER = null;

passport.serializeUser(function(user, cb) {
	USER = user;

  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
	console.log(' vvvv vvvv vvvv vvvv OUT obj vvvv vvvv vvvv vvvv');
	console.dir(obj, {colors: true, depth: null});
	console.log(' ^^^^ ^^^^ ^^^^ ^^^^ END obj ^^^^ ^^^^ ^^^^ ^^^^');

  cb(null, USER);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
	console.log(' vvvv vvvv vvvv vvvv OUT req.user vvvv vvvv vvvv vvvv');
	console.dir(req.user, {colors: true, depth: null});
	console.log(' ^^^^ ^^^^ ^^^^ ^^^^ END req.user ^^^^ ^^^^ ^^^^ ^^^^');

    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
	console.log(' vvvv vvvv vvvv vvvv OUT req.user vvvv vvvv vvvv vvvv');
	console.dir(req.user, {colors: true, depth: null});
	console.log(' ^^^^ ^^^^ ^^^^ ^^^^ END req.user ^^^^ ^^^^ ^^^^ ^^^^');

    res.render('profile', { user: req.user });
  });

app.listen(process.env['PORT'] || 9999);
