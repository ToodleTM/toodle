'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];

        $http.get('api/play/' + tournamentId).success(function (data) {
            console.log(data);
            $scope.tournamentInfo = data;
        });
    }
);
