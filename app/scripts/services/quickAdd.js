'use strict';

angular.module('ezBracketApp')
  .factory('QuickAdd', function QuickAdd($location, $rootScope, Session, Tournament) {

    return {

      createBasicTournament: function(tournamentName, callback) {
        var cb = callback || angular.noop;

        return Tournament.save(tournamentName,
          function() {

            return cb(tournamentName);
          },
          function(err) {
            return cb(err);
          }).$promise;
      }
//    changePassword: function(oldPassword, newPassword, callback) {
//            var cb = callback || angular.noop;
//
//            return User.update({
//                oldPassword: oldPassword,
//                newPassword: newPassword
//            }, function(user) {
//                return cb(user);
//            }, function(err) {
//                return cb(err);
//            }).$promise;
//        },


    };
  });