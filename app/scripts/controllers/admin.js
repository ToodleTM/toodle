'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];

        $http.get('api/tournament/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
        });
    }
);
