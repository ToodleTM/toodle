'use strict';
angular.module('toodleApp')
    .controller('PreconfigureTournamentCtrl', function ($scope, $location, $http, $window, $translatePartialLoader, $translate) {
        $translatePartialLoader.addPart('app/preconfigure');
        $translate.refresh();
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
                        $scope.engineTemplate = '/partials/engineTemplates/' + data.engine+'Preconfigure';
                        $scope.renderer = availableRenderers[$scope.tournamentInfo.engine];
                        $scope.groups = [];
                        $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                        $http.post('api/tournament/genBracketForTournament', {tournamentId: $scope.tournamentId}).success(function (data) {
                            $scope.tournamentInfo = data;
                            $scope.displayBracket(data);
                        }).error(function (err) {
                            $scope.error = true;
                            $scope.errorMessage = err.message;
                        });
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

        $scope.getPlayersOrderedByScore = function (group) {
            if (group.players && lodashForApp.find(group.matches, function (match) {
                    return match.complete;
                })) {
                if (group.players.length === 4) {
                    var orderedList = lodashForApp.sortBy(group.players, function (player) {
                        if (!player.win) {
                            player.win = 0;
                        }
                        if (!player.loss) {
                            player.loss = 0;
                        }
                        return player.loss - player.win;
                    });
                    return orderedList;
                }
            } else {
                return group.players;
            }
        };

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
                    groups: $scope.groups,
                    getPlayersOrderedByScore:$scope.getPlayersOrderedByScore
                };
                if (!$scope.tournamentInfo.running) {
                    $scope.renderBracket();
                } else {
                    $scope.running = false;
                }
            }).error(function () {

            });
        };

        $scope.resetBracket = function () {
            $http.post('api/tournament/genBracketForTournament', {tournamentId: $scope.tournamentId}).success(function (data) {
                $scope.tournamentInfo = data;
                $scope.firstPlayerToSwapPosition = null;
                $scope.renderBracket();
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

        $scope.getPlayerSlotInGroup = function (groupNumber, playerName){
            var groupPlayers = $scope.tournamentInfo.bracket[groupNumber].players;
            var slot = null;
            groupPlayers.forEach(function(player, key){
                if(player.name === playerName){
                    slot = key;
                }
            });
            return slot;
        };

        $scope.stripPlayerName = function(playerName){
            return playerName.replace(' ', '');
        };

        $scope.selectPlayerToSwap = function (groupNumber, playerName) {
            var playerSlot = $scope.getPlayerSlotInGroup(groupNumber, playerName);
            var currentPlayer = $scope.tournamentInfo.bracket[groupNumber].players[playerSlot];
            var swapIcon = 'swapPlayers-16';
            var selectedIcon = 'selectedPlayer-16';
            var clickable = 'clickable-250-20';
            var clicked = 'clicked-250-20';
            var strippedPlayerName = playerName.replace(' ', '');
            if (!$scope.firstPlayerToSwapPosition) {
                $scope.firstPlayerToSwapPosition = {
                    number: groupNumber,
                    playerNumber: playerSlot,
                    isPlayer1: playerName,
                    name: currentPlayer ? currentPlayer.name : null
                };
                document.getElementById('slot-'+groupNumber+'-'+strippedPlayerName).setAttribute('class', 'preconf-swapIcon '+selectedIcon);
                document.getElementById('clickable-' + groupNumber + '-' + strippedPlayerName).setAttribute('class', 'group-player-tag preconf '+clicked);
            } else {
                if ($scope.firstPlayerToSwapPosition.number === groupNumber && $scope.firstPlayerToSwapPosition.isPlayer1 === playerName) {
                    $scope.firstPlayerToSwapPosition = null;
                    document.getElementById('slot-' + groupNumber + '-' + strippedPlayerName).setAttribute('class', 'preconf-swapIcon ' +swapIcon);
                    document.getElementById('clickable-' + groupNumber + '-' + strippedPlayerName).setAttribute('class', 'group-player-tag preconf ' +clickable);
                } else {
                    var secondPlayerToSwapPosition = {
                        number: groupNumber,
                        playerNumber: playerSlot,
                        isPlayer1: playerName,
                        name: currentPlayer ? currentPlayer.name : null
                    };
                    $scope.swapPlayers([$scope.firstPlayerToSwapPosition, secondPlayerToSwapPosition]);
                    $scope.firstPlayerToSwapPosition = null;
                }
            }
        };
    }
);