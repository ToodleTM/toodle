'use strict';
angular.module('toodleApp')
    .controller('PreconfigureTournamentCtrl', function ($scope, $location, $http, $cookies, $window) {
        $scope.tournamentId = $location.$$path.split('/')[3];
        $scope.nick = '';
        $scope.playerList = null;
        $scope.score1 = 0;
        $scope.score2 = 0;
        $scope.renderer = null;
        _paq.push(['setDocumentTitle', 'Preconfigure page']);
        _paq.push(['trackPageView']);
        $scope.tourneyReportingKo = false;

        function resetPlayerNamesToSwap() {
            $scope.player1ToSwap = null;
            $scope.player2ToSwap = null;
        }

        $http.get('api/tournament/admin/' + $scope.tournamentId).success(function (data) {
            $scope.error = false;
            $scope.incompatibleEngine = false;
            $scope.tournamentLookupError = false;
            $scope.tournamentInfo = data;
            if (data && !data.running) {
                $http.get('api/available-engines').success(function (engines) {
                    engines.forEach(function (item) {
                        if (item.name === data.engine) {
                            $scope.engine = item;
                            $scope.canSwapPlayers = $scope.engine.compatible.indexOf('playerSwap') !== -1;
                        }
                    });
                    if ($scope.canSwapPlayers) {
                        resetPlayerNamesToSwap();
                        $scope.playerList = data.players;
                        $scope.engineTemplate = '/partials/engineTemplates/' + data.engine;
                        $scope.renderer = availableRenderers[$scope.tournamentInfo.engine];
                        $scope.groups = [];
                        $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                        if (!$scope.tournamentInfo.bracket) {
                            $http.post('api/tournament/genBracketForTournament', {tournamentId: $scope.tournamentId}).success(function (data) {
                                $scope.tournamentInfo = data;
                                $scope.displayBracket(data);
                            }).error(function () {

                            });
                        } else {
                            $scope.displayBracket(data);
                        }
                    } else {
                        $scope.incompatibleEngine = true;
                    }
                }).error(function () {
                });
            }
            $scope.tournamentRunning = data ? data.running : false;
        }).error(function () {
            $scope.tournamentLookupError = true;
        });

        $scope.displayBracket = function (data) {
            $http.get('api/available-engines').success(function (engines) {
                $scope.availableEngines = engines;
                engines.forEach(function (item) {
                    if (item.name === data.engine) {
                        $scope.engine = item;
                        $scope.canSwapPlayers = $scope.engine.compatible.indexOf('playerSwap') !== -1;
                    }
                });
                $scope.controllerReferencesForRenderer = {
                    swapPlayers: $scope.swapPlayers,
                    groups: $scope.groups
                };
                if (!$scope.tournamentInfo.running) {
                    $scope.renderBracket();
                } else {
                    $scope.running = false;
                }
            }).error(function () {
            });
        };

        $scope.createDefaultBracketAndGoBack = function () {
            $http.post('api/tournament/genBracketForTournament', {tournamentId: $scope.tournamentId}).success(function (data) {
                $scope.tournamentInfo.bracket = data;
                $window.location = $location.$$path.replace('/preconfigure', '');
            }).error(function () {

            });
        };

        $scope.updateBracketDataAndStart = function () {
            $http.post('api/tournament/updateBracketDataAndStart', {tournamentId: $scope.tournamentId}).success(function (data) {
                $scope.tournamentInfo = data;
                $window.location = $location.$$path.replace('/preconfigure', '');
            }).error(function () {

            });
        };

        $scope.renderBracket = function () {
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight, true);
        };

        $scope.checkIfReady = function () {
            return true; // we just want to ensure the correct DOM element is loaded, once it has been dynamically included, we're basically good ...
        };

        $scope.swapPlayers = function (playersToSwap) {
            $http.post('/api/tournament/swapPlayers/', {
                tournamentId: $scope.tournamentId,
                playerInMatch1: playersToSwap[0],
                playerInMatch2: playersToSwap[1]
            })
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.renderBracket();
                })
                .error(function (data) {
                    $scope.errorMessage = 'admin.actions.swapPlayers.' + data.message;
                    resetPlayerNamesToSwap();
                    $scope.tourneyReportingKo = true;
                });
        };
    }
);