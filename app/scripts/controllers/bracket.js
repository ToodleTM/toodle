'use strict';
angular.module('toodleApp')
    .controller('BracketCtrl', function ($scope, $location, $http, $cookies, $modal) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        $scope.score1 = 0;
        $scope.score2 = 0;
        $scope.renderer = null;
        _paq.push(['setDocumentTitle', 'Bracket page']);
        _paq.push(['trackPageView']);
        $scope.tourneyReportingKo = false;
        $scope.getPlayersOrderedByScore = function (group) {
            if (group.players && lodashForApp.find(group.matches, function (match) {
                    return match.complete;
                })) {
                if (group.players.length === 4) {
                    var orderedList = lodashForApp.sortBy(group.players, function (player) {
                        return player.lossCount - player.winCount;
                    });
                    return orderedList;
                }
            }
            return group.players;
        };

        function updateSwapPlayersForm(data) {
            var eligibleMatches = lodashForApp.filter(data.bracket, function (match) {
                return !match.complete;
            });
            $scope.swappablePlayers = [];
            lodashForApp.each(eligibleMatches, function (match) {
                $scope.swappablePlayers.push({number:match.number, isPlayer1:true, name:match.player1? match.player1.name:'', label:match.player1? match.player1.name:'1st slot from match '+match.number});
                $scope.swappablePlayers.push({number:match.number, isPlayer1:false, name:match.player2? match.player2.name:'', label:match.player2? match.player2.name:'2nd slot from match '+match.number});
            });
        }

        function resetPlayerNamesToSwap() {
            $scope.player1ToSwap = null;
            $scope.player2ToSwap = null;
        }

        $http.get('api/play/' + tournamentId).success(function (data) {
            $scope.content = true;
            resetPlayerNamesToSwap();
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            $scope.engineTemplate = '/partials/engineTemplates/' + data.engine;
            $scope.renderer = availableRenderers[$scope.tournamentInfo.engine];
            $scope.groups = [];
            $scope.tournamentId = $cookies['toodle-' + $scope.tournamentInfo.signupID];
            $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
            updateSwapPlayersForm(data);
            $http.get('api/available-engines').success(function(engines){
                $scope.availableEngines = engines;
                engines.forEach(function(item){
                    if(item.name === data.engine){
                        $scope.engine = item;
                        $scope.canSwapPlayers = $scope.engine.compatible.indexOf('playerSwap') !== -1;
                    }
                });
            }).error(function() {
            });
            $scope.controllerReferencesForRenderer = {
                togglePlayerHighlight: $scope.togglePlayerHighlight,
                report: $scope.report,
                unreport: $scope.unreport,
                getPlayersOrderedByScore: $scope.getPlayersOrderedByScore,
                groups: $scope.groups
            };
            if ($scope.tournamentInfo.running) {
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer);
            } else {
                $scope.notRunning = true;
            }
        }).error(function () {
            $scope.content = false;
            $scope.notFound = true;
        });

        $scope.report = function (match) {
            $scope.firstGameToReport = match;
            $scope.$apply();

            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/reportTemplate.html',
                controller: 'ModalReportCtrl',
                resolve: {
                    firstGameToReport:function(){
                        return $scope.firstGameToReport;
                    }
                }
            });

            modalInstance.result.then(function (scores) {
                $scope.score1 = scores[0];
                $scope.score2 = scores[1];
                $scope.reportMatch();
            }, function () {
            });
        };

        $scope.unreport = function (match) {
            $scope.gameToUnreport = match;
            $scope.$apply();
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/unreportTemplate.html',
                controller: 'ModalUnreportCtrl',
                resolve: {
                    gameToUnreport:function() {
                        return $scope.gameToUnreport;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.unreportMatch();
            }, function () {
            });
        };

        $scope.reportMatch = function () {
            $scope.tourneyReportingKo = false;
            $http.post('/api/tournament/reportMatch/', {
                tournamentId: $scope.tournamentId? JSON.parse($scope.tournamentId) : null,
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.firstGameToReport.name,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                $scope.tournamentInfo = data;
                document.getElementById('bracket').innerHTML = '';
                $scope.score1 = 0;
                $scope.score2 = 0;
                $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                updateSwapPlayersForm(data);
                $scope.$apply();
            }).error(function (data) {
                $scope.errorMessage = 'admin.actions.reporting.errors.' + data.message;
                $scope.tourneyReportingKo = true;
            });
        };

        $scope.renderBracket = function () {
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            $scope.$apply();
        };

        $scope.checkIfReady = function () {
            return true; // we basically just want to ensure the correct DOM element is loaded, once it has been dynamically included, we're basically good ...
        };

        $scope.unreportMatch = function () {
            $scope.tourneyReportingKo = false;
            $http.post('/api/tournament/unreportMatch/', {
                tournamentId: $scope.tournamentId ? JSON.parse($scope.tournamentId) : null,
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.name
            }).success(function (data) {
                $scope.tournamentInfo = data;
                document.getElementById('bracket').innerHTML = '';
                $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                updateSwapPlayersForm(data);
                $scope.$apply();
            }).error(function (data) {
                $scope.errorMessage = data;
                $scope.tourneyReportingKo = true;
            });
        };
        $scope.hideLocalAlerts = function(){
            $scope.tourneyReportingKo = false;
            $scope.tourneyReportingOk = false;
        };

        $scope.togglePlayerHighlight = function (player) {
            if ($scope.playerToHighlight && player && $scope.playerToHighlight.name === player.name) {
                $scope.playerToHighlight = null;
            } else {
                $scope.playerToHighlight = player;
            }
            $scope.$apply();
            document.getElementById('bracket').innerHTML = '';
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            $scope.$apply();
        };
    }
);