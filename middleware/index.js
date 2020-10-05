const middleware = {};
const middlewareRestaurant = {};

middleware.isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect("/");
      };

middleware.isLoggedOut = function(req, res, next) {

        if (!req.isAuthenticated()) {
          return next();
        }
        res.redirect("/");
      };

middlewareRestaurant.isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) {
          if(req.user.partner == true){
            return next();
          }
        }
        res.redirect("/");
      };

module.exports = {middleware, middlewareRestaurant};