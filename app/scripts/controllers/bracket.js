'use strict';

angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http, TournamentPlay) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = "";
        $scope.playerList = null;

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            renderer.drawBracket(Raphael('bracket', '100%', '100%'), data.bracket);
        });
    }
);
