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
        $('#tourneyReportingKo').hide();
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
                return match.player1 && match.player2 && !match.complete;
            });
            $scope.swappablePlayers = [];
            lodashForApp.each(eligibleMatches, function (match) {
                $scope.swappablePlayers.push(match.player1);
                $scope.swappablePlayers.push(match.player2);
            });
        }

        function resetPlayerNamesToSwap() {
            $scope.player1ToSwap = '';
            $scope.player2ToSwap = '';
        }

        $http.get('api/play/' + tournamentId).success(function (data) {
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
                $('#notRunning').show();
            }
        }).error(function () {
            $('#content').hide();
            $('#notFound').show();
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
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/reportMatch/', {
                tournamentId: JSON.parse($scope.tournamentId),
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.firstGameToReport.name,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                $scope.tournamentInfo = data;
                $('#bracket').html('');
                $scope.score1 = 0;
                $scope.score2 = 0;
                $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                updateSwapPlayersForm(data);
                $scope.$apply();
            }).error(function (data) {
                $scope.errorMessage = 'admin.actions.reporting.errors.' + data.message;
                $('#tourneyReportingKo').fadeIn();
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
            $('#tourneyReportingKo').hide();
            $http.post('/api/tournament/unreportMatch/', {
                tournamentId: JSON.parse($scope.tournamentId),
                signupID: $scope.tournamentInfo.signupID,
                number: $scope.gameToUnreport.name
            }).success(function (data) {
                $scope.tournamentInfo = data;
                $('#bracket').html('');
                $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                updateSwapPlayersForm(data);
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

        $scope.swapPlayers = function () {
            $http.post('/api/tournament/swapPlayers/', {
                tournamentId: JSON.parse($scope.tournamentId),
                playerInMatch1: $scope.player1ToSwap,
                playerInMatch2: $scope.player2ToSwap
            })
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $('#bracket').html('');
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                    resetPlayerNamesToSwap();
                    $scope.$apply();
                })
                .error(function (data) {
                    $scope.errorMessage = 'admin.actions.swapPlayers.'+data.message;
                    resetPlayerNamesToSwap();
                    $('#tourneyReportingKo').fadeIn();
                });
        };
    }
);