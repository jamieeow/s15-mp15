// All imports needed here
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');

//Models
const User = require('./models/user');
const Schedule = require('./models/schedules');
const Calendar = require('./models/calendar');

// Creates the express application
const app = express();
const port = 9090;

//database connection constants
const databaseURL = "mongodb://G15:1234@calendar-shard-00-00-xd9qk.gcp.mongodb.net:27017,calendar-shard-00-01-xd9qk.gcp.mongodb.net:27017,calendar-shard-00-02-xd9qk.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Calendar-shard-0&authSource=admin&retryWrites=true&w=majority";
const options = { useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false };
mongoose.connect(databaseURL, options);

/**
  Creates an engine called "hbs" using the express-handlebars package.
**/
app.engine( 'hbs', exphbs({
    extname: 'hbs', // configures the extension name to be .hbs instead of .handlebars
    defaultView: 'main', // this is the default value but you may change it to whatever you'd like
    layoutsDir: path.join(__dirname, '/views/layouts'), // Layouts folder
    partialsDir: path.join(__dirname, '/views/partials'), // Partials folder
  }));
  
  // Setting the view engine to the express-handlebars engine we created
  app.set('view engine', 'hbs');
  
  // Configuration for handling API endpoint data
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

  app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

  // Home route
app.get('/', function(req, res) {
    // The render function takes the template filename (no extension - that's what the config is for!)
    // and an object for what's needed in that template
    res.render('login', {
      title: 'login',
    })
});

app.post('/calendar', function(req,res){
  User.find({email: req.body.username})
    .exec()
    .then(user => {
        if(user.length < 1){
          return res.status(401).json({
              message: 'Auth failed'
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) =>{
          if(err){
            return res.status(401).json({
                message: 'Auth failed'
            });
          }
            if(result){
              return res.status(200).render('calendar', {
                title:  'My Calendar',
                email: user[0].email,
            })
            }
            else{
                return res.status(401).json({
                  message: 'Auth failed'
              });
            }
        });
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

app.get('/register', function(req,res){
    res.render('register', {
        title:  'Register',
    })
});

//USER SIGN UP
app.post('/addUser', function(req, res) {
  if(req.body.password === req.body.passwordConfirm){
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if(err){
        return res.status(500).json({
            error: err
        });
      } else{
        var user = new User({
          email: req.body.username,
          password: hash
         });

         user.save()
         .then(result => {
            res.status(201).redirect('/');
         })
         .catch(err=>{
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
      }
    });
  }
  else{
    return res.status(500).json({
      message: "Passwords do not match"
    });
  }
});


//add Sched
app.post('/addSched',  function(req, res) {
  var schedule = new Schedule({
    calendarId: req.body.calendarId,
    email: req.body.email,
    title: req.body.title,
    location: req.body.location, 
    raw: {class: req.body.raw.class},
    start: req.body.start,
    end: req.body.end,
    isAllDay: req.body.isAllDay,
    state: req.body.state,
   });
   
  schedule.save()
   .then(result => {
      res.status(201);
   })
   .catch(err=>{
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

//Load Scheds
app.get('/loadScheds', function(req, res) {
  Schedule.find({email: req.query.email}).exec(function(err, result) {
    var scheduleObjects = [];

    result.forEach(function(doc) {
      scheduleObjects.push(doc.toObject());
    });
    
    res.json({schedules: scheduleObjects });
  });
});

//update scheds
app.post('/updateSched', function(req, res) {
  
  var query = {
    calendarId: req.body.calendarId,
    email: req.body.email,
    title: req.body.title,
    location: req.body.location, 
    raw: {class: req.body.raw.class},
    start: req.body.start,
    end: req.body.end,
    isAllDay: req.body.isAllDay,
    state: req.body.state,
  };
  
  var update = {
    $set: req.body.new
  };

  Schedule.findOneAndUpdate(query, update, { new: true }, function(err, user) {
    if (err) throw err;
    console.log(user);
    res.send(user);
  });
});

//Delete Scheds
app.delete('/deleteSched', function(req,res){
  
  var query = {
    calendarId: req.body.calendarId,
    email: req.body.email,
    title: req.body.title,
    location: req.body.location, 
    raw: {class: req.body.raw.class},
    start: req.body.start,
    end: req.body.end,
    isAllDay: req.body.isAllDay,
    state: req.body.state,
  };

  Schedule.deleteOne(query, function (err, sched) {
    if (err) throw err
    console.log(sched);
    res.status(200).send();
  });

});


//Get calendars
app.get('/getCalendars', function(req,res){
  User.findOne({email: req.body.user}, function(err, user){
    const userId = user._id;


  });
});

//add calendar
app.post('/addCalendar', async(req, res) =>{
 
      var calendar = new Calendar({
        id: req.body.id,
        name: req.body.tag,
        checked: true, 
        color: req.body.colorpicker,
        bgColor: req.body.colorpicker,
        borderColor: req.body.colorpicker,
        dragBgColor: req.body.colorpicker,
        user: req.body.user,
      });
      
      try {
        await calendar.save();
        res.status(201).send(calendar);
      } catch (err) {
        res.status(500).send(err);
      }
});

//Load Calendars
app.get('/loadCalendars/:user', function(req, res) {  
    Calendar.find({user: req.params.user}).exec(function(err, result) {
      var calendarObjects = [];

      result.forEach(function(doc) {
        calendarObjects.push(doc.toObject());
      });
      
      res.json({calendars: calendarObjects });
    });
});
  /**
  To be able to render images, css and JavaScript files, it's best to host the static files
  and use the expected path in the data and the imports.

  This takes the contents of the public folder and makes it accessible through the URL.
  i.e. public/css/styles.css (in project) will be accessible through http://localhost:9090/css/styles.css
**/
app.use(express.static('public'));
// app.use(express.static(__dirname + '/public'));

// Listening to the port provided
app.listen(port, function() {
  console.log('App listening at port '  + port)
});

