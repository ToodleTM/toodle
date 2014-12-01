'use strict';

angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Bracket page']);
        _paq.push(['trackPageView']);
        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            if($scope.tournamentInfo.running){
                renderer.drawBracket(data.bracket, d3);
            } else {
                $('#notRunning').show();
            }
        });
    }
);
