'use strict';
angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        $scope.score1 = 0;
        $scope.score2 = 0;
        $scope.renderer = null;
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

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            $scope.engineTemplate = '/partials/engineTemplates/'+data.engine;
            $scope.renderer = availableRenderers[$scope.tournamentInfo.engine];
            $scope.groups = [];
            $scope.controllerReferencesForRenderer = {
                togglePlayerHighlight:$scope.togglePlayerHighlight,
                report:$scope.report,
                unreport:$scope.unreport,
                getPlayersOrderedByScore:$scope.getPlayersOrderedByScore,
                groups:$scope.groups
            };
            if($scope.tournamentInfo.running){
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer);
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
                $scope.score1 = 0;
                $scope.score2 = 0;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                $scope.$apply();

            }).error(function (data) {
                $scope.errorMessage = 'admin.actions.reporting.errors.'+data.message;
                $('#tourneyReportingKo').fadeIn();
            });
        };

        $scope.renderBracket = function(){
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            $scope.$apply();
        };

        $scope.checkIfReady = function(){
            return true; // we basically just want to ensure the correct DOM element is loaded, once it has been dynamically included, we're basically good ...
        };

        $scope.unreportMatch = function () {
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/unreportMatch/', {
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.name
            }).success(function (data) {
                $scope.tournamentInfo = data;
                $('#bracket').html('');
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                $scope.$apply();
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
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            $scope.$apply();
        };
    }
);