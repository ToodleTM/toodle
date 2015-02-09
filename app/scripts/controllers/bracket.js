'use strict';
//
angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Bracket page']);
        _paq.push(['trackPageView']);
        $('#tourneyReportingKo').hide();

        $scope.getPlayersOrderedByScore = function(group){
            if(group.players && lodashForApp.find(group.matches, function(match){return match.complete;})){
                if(group.players.length === 4){
                    var orderedList = lodashForApp.sortBy(group.players, function(player){
                        return player.lossCount - player.winCount;
                    });
                    return orderedList;
                }
            }
            return group.players;
        };

        function noFollowingMatchComplete(group, matchToCheck){
            var laterCompleteMatches = lodashForApp.find(group.matches, function(match){
                return match.complete && match.round > matchToCheck.round;
            });
            return !laterCompleteMatches;
        }

        function updateGroupsForGSLGroups() {
            lodashForApp.forEach($scope.tournamentInfo.bracket, function (group) {
                var matches = [];
                lodashForApp.forEach(group.matches, function (match) {
                    console.log($scope.playerRights);
                    match.canBeReported = !match.complete && match.player1 && match.player2 && $scope.playerRights >= 2;
                    match.canBeUnreported = match.complete && noFollowingMatchComplete(group, match) && $scope.playerRights === 3;
                    match.name = match.number;
                    matches.push(match);
                });
                group.players = $scope.getPlayersOrderedByScore(group);
                group.matches = matches;
                $scope.groups.push(group);
            });
        }

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            if ($scope.tournamentInfo.running && $scope.tournamentInfo.engine === 'singleElim') {
                binaryBracketRenderer.drawBracket(data, d3, $scope);
            } else if ($scope.tournamentInfo.running && $scope.tournamentInfo.engine === 'simpleGSLGroups') {
                $scope.groups = [];
                console.log(data);
                $scope.playerRights = data.userPrivileges;
                updateGroupsForGSLGroups();
            } else {
                $('#notRunning').show();
            }
        }).error(function () {
            $('#content').hide();
            $('#notFound').show();
        });

        $scope.report = function (match) {
            $scope.firstGameToReport = match;
            $scope.$apply();
            $('#reportModal').modal();
        };

        $scope.unreport = function (match) {
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
                if ($scope.tournamentInfo.engine === 'singleElim') {
                    binaryBracketRenderer.drawBracket(data, d3, $scope, $scope.playerToHighlight);
                } else if ($scope.tournamentInfo.engine === 'simpleGSLGroups'){
                    $scope.groups = [];
                    updateGroupsForGSLGroups();
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
                if ($scope.tournamentInfo.engine === 'singleElim') {
                    binaryBracketRenderer.drawBracket(data, d3, $scope, $scope.playerToHighlight);
                } else if ($scope.tournamentInfo.engine === 'simpleGSLGroups'){
                    $scope.groups = [];
                    updateGroupsForGSLGroups();
                }
            }).error(function (data) {
                $scope.errorMessage = data;
                $('#tourneyReportingKo').fadeIn();
            });
        };

        $scope.togglePlayerHighlight = function (player) {
            if ($scope.playerToHighlight && player && $scope.playerToHighlight.name === player.name) {
                $scope.playerToHighlight = null;
            } else {
                $scope.playerToHighlight = player;
            }
            $scope.$apply();
            $('#bracket').html('');
            if ($scope.tournamentInfo.engine === 'singleElim') {
                binaryBracketRenderer.drawBracket($scope.tournamentInfo, d3, $scope, $scope.playerToHighlight);
            }
        };
    }
);
