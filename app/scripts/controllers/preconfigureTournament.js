'use strict';
angular.module('toodleApp')
    .controller('PreconfigureTournamentCtrl', function ($scope, $location, $http, $cookies) {
        var tournamentId = $location.$$path.split('/')[3];
        $scope.nick = '';
        $scope.playerList = null;
        $scope.score1 = 0;
        $scope.score2 = 0;
        $scope.renderer = null;
        _paq.push(['setDocumentTitle', 'Preconfigure page']);
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

        $http.get('api/tournament/admin/' + tournamentId).success(function (data) {
            $scope.error = false;
            resetPlayerNamesToSwap();
            $scope.tournamentInfo = data;
            $scope.playerList = data.players;
            $scope.engineTemplate = '/partials/engineTemplates/' + data.engine;
            $scope.renderer = availableRenderers[$scope.tournamentInfo.engine];
            $scope.groups = [];
            $scope.tournamentId = $cookies['toodle-' + $scope.tournamentInfo.signupID];
            $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
            updateSwapPlayersForm(data);
            if(!$scope.tournamentInfo.bracket){
                $http.post('api/tournament/genBracketForTournament', {tournamentId:tournamentId}).success(function(data){
                    $scope.tournamentInfo.bracket = data;
                    $scope.displayBracket(data);
                }).error(function(){

                });
            } else {
                $scope.displayBracket(data);
            }
        }).error(function () {
            $scope.tournamentLookupError = true;
        });

        $scope.displayBracket = function(data){
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
                swapPlayers:$scope.swapPlayers,
                getPlayersOrderedByScore: $scope.getPlayersOrderedByScore,
                groups: $scope.groups
            };
            if (!$scope.tournamentInfo.running) {
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, true);
            } else {
                $scope.running = false;
            }
        };


        $scope.renderBracket = function () {
            $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight, true);
            $scope.$apply();
        };

        $scope.checkIfReady = function () {
            return true; // we just want to ensure the correct DOM element is loaded, once it has been dynamically included, we're basically good ...
        };

        $scope.swapPlayers = function (playersToSwap) {
            $http.post('/api/tournament/swapPlayers/', {
                tournamentId: JSON.parse($scope.tournamentId),
                playerInMatch1: playersToSwap[0],
                playerInMatch2: playersToSwap[1]
            })
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $('#bracket').html('');
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight, true);
                    $scope.$apply();
                })
                .error(function (data) {
                    $scope.errorMessage = 'admin.actions.swapPlayers.'+data.message;
                    resetPlayerNamesToSwap();
                    $scope.tourneyReportingKo = true;
                });
        };
    }
);