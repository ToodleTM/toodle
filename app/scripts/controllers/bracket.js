'use strict';

angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Bracket page']);
        _paq.push(['trackPageView']);
        $('#tourneyReportingKo').hide();
        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            console.log(data);
            $scope.playerList = data.players;
            if($scope.tournamentInfo.running && $scope.tournamentInfo.engine === 'singleElim'){
                binaryBracketRenderer.drawBracket(data, d3, $scope);
                console.log('pouet');
            } else {
                $('#notRunning').show();
            }
        }).error(function(){
            $('#content').hide();
            $('#notFound').show();
        });

        $scope.report = function(match){
            $scope.firstGameToReport = match;
            $scope.$apply();
            $('#reportModal').modal();
        };

        $scope.unreport = function(match){
            $scope.gameToUnreport = match;
            $scope.$apply();
            $('#unreportModal').modal();
        };

        $scope.reportMatch = function () {
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/reportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.firstGameToReport.name,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                $scope.tournamentInfo = data;
                $('#bracket').html('');
                if($scope.tournamentInfo.engine === 'singleElim') {
                    binaryBracketRenderer.drawBracket(data, d3, $scope, $scope.playerToHighlight);
                }
            }).error(function (data) {
                $scope.errorMessage = data;
                $('#tourneyReportingKo').fadeIn();
            });
        };

        $scope.unreportMatch = function () {
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/unreportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.name
            }).success(function (data) {
                $scope.tournamentInfo = data;
                $('#bracket').html('');
                if($scope.tournamentInfo.engine === 'singleElim') {
                    binaryBracketRenderer.drawBracket(data, d3, $scope, $scope.playerToHighlight);
                }
            }).error(function (data) {
                $scope.errorMessage = data;
                $('#tourneyReportingKo').fadeIn();
            });
        };

        $scope.togglePlayerHighlight = function(player){
            if($scope.playerToHighlight && player && $scope.playerToHighlight.name === player.name){
                $scope.playerToHighlight = null;
            } else {
                $scope.playerToHighlight = player;
            }
            $scope.$apply();
            $('#bracket').html('');
            if($scope.tournamentInfo.engine === 'singleElim') {
                binaryBracketRenderer.drawBracket($scope.tournamentInfo, d3, $scope, $scope.playerToHighlight);
            }
        };
    }
);
