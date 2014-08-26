'use strict';

angular.module('toodleApp')
    .controller('PlayCtrl', function ($scope, $location, $http, TournamentPlay) {
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
            TournamentPlay.update({tournamentId: $scope.tournamentInfo._id, nick: $scope.nick}, function (data) {
                $("#registrationOk").fadeIn();
                $scope.playerList = data.players;
            }, function (message) {
                $("#registrationKo").fadeIn();
                $scope.errorMessage = message.data.message;
            });
        };

        $scope.reportWinForm = function(){

        }
    }
);
