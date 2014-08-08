'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];

        $http.get('api/tournament/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
        });

        $scope.updateTourney = function(){
            $("#tourneyUpdateOk").hide();
            $("#tourneyUpdateKo").hide();
            Tournament.update({id:tournamentId}, $scope.tournamentInfo, function(){
                $("#tourneyUpdateOk").fadeIn();
            }, function(err){
                $scope.errorMessage = err;
                $("#tourneyUpdateKo").fadeIn();
            })
        };
    }
);
