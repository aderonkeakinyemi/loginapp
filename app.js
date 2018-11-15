var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars')
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Stategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

// setting up my database connection
mongoose.connect('mongodb://localhost/loginapp', { useNewUrlParser: true });
var db = mongoose.connection;

// setting up my route files
var routes = require('./routes/index');
var users = require('./routes/users');

// Initialize app
var app = express();


// Setup the view Engine
app.set('views',path.join(__dirname,'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


// set up the body-parser and the cookie-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// setting up my static folder
app.use(express.static(path.join(__dirname, 'public')));

// setting up session middleware
app.use(session(
  {
    secret: 'secret',
    saveUninitialized: true,
    resave: true
  }
))

//set up passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set up express validator middeleware
app.use(expressValidator(
  {
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}
));

// set up flash middleware
app.use(flash());

// set up global variables for flash messages
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// set up middleware for my route files
app.use('/',  routes);
app.use('/users', users);

// set the port
app.set('port',(process.env.port || 3000));

// listening for requests
app.listen(app.get('port'), function(){
    console.log('Server started on port ' + app.get('port'));
  });
