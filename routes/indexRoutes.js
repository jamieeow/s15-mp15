const router = require('express').Router();
const { isPrivate, isPublic } = require('../middlewares/checkAuth');

//Home route (Login Page)
router.get('/', isPublic, function(req, res) {
    // The render function takes the template filename (no extension - that's what the config is for!)
    // and an object for what's needed in that template
    res.render('login', {
      title: 'doetal Login',
    })
  });
  
  //Register Page
  router.get('/register', isPublic, function(req,res){
  res.render('register', {
      title:  'doetal Register',
  })
  });

   //Calendar Page
   router.get('/calendar', isPrivate, function(req,res){
    res.render('calendar', {
        title:  'doetal',
    })
    });

  module.exports = router;