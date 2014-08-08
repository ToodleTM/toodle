'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];

        $http.get('api/tournament/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
        });

        $scope.updateTourney = function(){
            console.log($scope.tournamentInfo);
            console.log(Tournament.update);
            Tournament.update({id:tournamentId}, $scope.tournamentInfo, function(){
                console.log('Success!');
            }, function(){
                console.log("Error /o\\!");
            })
        };
    }
);
