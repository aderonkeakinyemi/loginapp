var express = require('express');
// set up express router
var router = express.Router();
var User = require('../models/user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//register route
router.get('/register', function(req,res){
  res.render('register');
});

//login route
router.get('/login', function(req,res){
  res.render('login');
});

//register route
router.post('/register', function(req,res){
  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var passwordtwo = req.body.passwordtwo;

  //validation
  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('username','UserName is required').notEmpty();
  req.checkBody('email','email is required').notEmpty();
  req.checkBody('email','email is not valid').isEmail();
  req.checkBody('password','password is required').notEmpty();
  req.checkBody('passwordtwo','Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {errors: errors});
  	console.log('yes');
  } else {

  	var user = new User({
  		name: name,
  		username: username,
  		email: email,
  		password: password
  	});

  	User.createUser(user, function(err,user){
  		if(err) throw err;
  		console.log(user.password)
  	});

  	req.flash('success_msg','You are registered and can now login');
  	res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err,user){
    	if(err) throw err;
    	if(!user){
    		return done(null,false, {message: 'unknown user'})
    	}

    	User.comparePassword(password,user.password,function(err,isMatch){
    		if(err) throw err;
    		if(isMatch){
    			return done(null,user);
    		} else {
    			return done(null, false, {message: 'Invalid Password'});
    		}

    	});
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


router.post('/login',
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash:true}),
  function(req, res) {
    res.redirect('/');
  });


    router.get('/logout', function(req, res){
    req.logout()
    req.flash('success_msg', 'you are logged out')
    res.redirect('/users/login');
});
module.exports = router;


