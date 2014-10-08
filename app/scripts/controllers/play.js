'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = "";
        $scope.playerList = null;

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
        });

        $scope.enterTournament = function () {
            $("#registrationKo").hide();
            $("#registrationOk").hide();
            $("#inputNick").val('');
            $http.put('/api/update-tournament/play', {signupID: $scope.tournamentInfo.signupID, nick: $scope.nick}).success(function(data){
                $("#registrationOk").fadeIn();
                $scope.playerList = data.players;
            }).error(function(error){
                $("#registrationKo").fadeIn();
                $scope.errorMessage = error.message;
            });
        };

        $scope.reportWinForm = function(){

        }
    }
);
