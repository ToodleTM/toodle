'use strict';

angular.module('toodleApp')
  .factory('QuickAdd', function QuickAdd($location, $rootScope, Tournament) {

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
    };
  });