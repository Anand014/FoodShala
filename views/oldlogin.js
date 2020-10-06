// .........Strategy................
passport.use('user-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password' // this is the virtual field on the model
  },
  function(username, password, done) {
    User.findOne({
      username: username
    }, function(err, user) {
      if (err) return done(err);

      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        });
      }
      if (user.authenticate(password)) {
        return done(null, user);
      }
      res.redirect("/")
    });
  }
));

  // add other strategies for more authentication flexibility
  passport.use('restaurant-local', new LocalStrategy({
          usernameField: 'username',
          passwordField: 'password' // this is the virtual field on the model
      },
      function(username, password, done) {
          Restaurant.findOne({
              username: username
          }, function(err, restaurant) {
              if (err) return done(err);

              if (!restaurant) {
                  return done(null, false, {
                      message: 'This email/username is not registered.'
                  });
              }
              if (!restaurant.authenticate(password)) {
                  return done(null, false, {
                      message: 'This password is not correct.'
                  });
              }
              return done(null, restaurant);
          });
      }
  ));
// ---------------------------

//----------Serialize && deSerialize--------------------- 

passport.serializeUser((obj, done) => {
  // console.log("serialrun", obj.id)
  if (obj.partner == true) {
    done(null, obj);
  //   console.log("done serialize obj",obj)
  } else {
      console.log("runfalse")
    done(null, obj);
  }
});

passport.deserializeUser((obj, done) => {
  if (obj.partner == true) {
      // console.log("using des: true", obj)
      Restaurant.findById(obj, function(err, restaurant) {
          if (err)
          return done(err);
          if (restaurant)
          return done(null, restaurant);
      });
  } else {
      // console.log("using des: false", obj)
      User.findById(obj, function(err, user) {
          if (err)
          return done(err);
          if (user)
          return done(null, user);
      });
  }
});
