'use strict';
angular.module('toodleApp')
    .controller('BracketCtrl', function ($rootScope, $scope, $location, $http, $modal, $translatePartialLoader, $translate) {
            $translatePartialLoader.addPart('app/create');
            $translate.refresh();
            var tournamentId = $location.$$path.split('/')[2];
            var displayMode = $location.$$path.split('/')[1];
            var endpoint = ['play', 'embed'].indexOf(displayMode) > -1 ? 'api/play' : 'api/tournament/admin';
            $scope.nick = '';
            $scope.playerList = null;
            $scope.score1 = 0;
            $scope.score2 = 0;
            $scope.renderer = null;
            $scope.relatedTournaments = [];
            $scope.lastLoadedTournament = 0;
            _paq.push(['setDocumentTitle', 'Bracket page']);
            _paq.push(['trackPageView']);
            $scope.tourneyReportingKo = false;
            $scope.getPlayersOrderedByScore = function (group) {
                if (group.players && utils_lodashForApp.find(group.matches, function (match) {
                        return match.complete;
                    })) {
                    if (group.players.length === 4) {
                        var orderedList = utils_lodashForApp.sortBy(group.players, function (player) {
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

            function definedUserPrivilegesForDisplay() {
                if (displayMode === 'embed') {
                    $scope.tournamentInfo.userPrivileges = 0;
                } else {
                    $scope.tournamentInfo.userPrivileges = $scope.tournamentId ? 3 : $scope.tournamentInfo.userPrivileges;
                }
            }

            $http.get(endpoint + '/' + tournamentId).success(function (data) {
                $scope.content = true;
                $scope.tournamentInfo = data;
                $scope.playerList = data.players;
                $scope.engineTemplate = '/partials/engineTemplates/' + data.engine;
                $scope.renderer = utils_availableRenderers[$scope.tournamentInfo.engine];
                $scope.groups = [];
                $scope.tournamentId = $location.$$path.split('/')[1] === 'admin' ? $location.$$path.split('/')[2] : null;

                $scope.relatedTournaments.push({
                    tournamentData:data
                });

                $scope.lastLoadedTournament = data;

                $scope.hasNext = data.parentTournamentPublicId;
                definedUserPrivilegesForDisplay();
                $scope.controllerReferencesForRenderer = {
                    togglePlayerHighlight: $scope.togglePlayerHighlight,
                    report: $scope.report,
                    unreport: $scope.unreport,
                    getPlayersOrderedByScore: $scope.getPlayersOrderedByScore,
                    groups: $scope.groups
                };
                if ($scope.tournamentInfo.running) {
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer);
                }
            }).error(function () {
                $scope.content = false;
                $scope.notFound = true;
            });

            $scope.report = function (match) {
                $scope.firstGameToReport = match;

                var modalInstance = $modal.open({
                    templateUrl: '/views/partials/popinTemplates/reportTemplate.html',
                    controller: 'ModalReportCtrl',
                    resolve: {
                        firstGameToReport: function () {
                            return $scope.firstGameToReport;
                        }
                    }
                });

                modalInstance.result.then(function (scores) {
                    $scope.score1 = scores[0];
                    $scope.score2 = scores[1];
                    $scope.matchComplete = scores[2];
                    $scope.forfeitSlot = scores[3];
                    if ($scope.forfeitSlot) {
                        $scope.forfeit();
                    } else {
                        $scope.reportMatch();
                    }
                }, function () {
                });
            };

            $scope.unreport = function (match) {
                $scope.gameToUnreport = match;
                var modalInstance = $modal.open({
                    templateUrl: '/views/partials/popinTemplates/unreportTemplate.html',
                    controller: 'ModalUnreportCtrl',
                    resolve: {
                        gameToUnreport: function () {
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
                    tournamentId: $scope.tournamentId,
                    signupID: $scope.tournamentInfo.signupID,
                    number: $scope.firstGameToReport.name,
                    score1: $scope.score1,
                    score2: $scope.score2,
                    matchComplete: $scope.matchComplete
                }).success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.score1 = 0;
                    $scope.score2 = 0;
                    definedUserPrivilegesForDisplay();
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                    $rootScope.$emit('updatedMatch', data);
                }).error(function (data) {
                    $scope.errorMessage = 'admin.actions.reporting.errors.' + data.message;
                    $scope.tourneyReportingKo = true;
                });
            };

            $scope.forfeit = function () {
                $scope.tourneyReportingKo = false;
                $http.post('/api/tournament/forfeitMatch/', {
                    tournamentId: $scope.tournamentId,
                    signupID: $scope.tournamentInfo.signupID,
                    number: $scope.firstGameToReport.name,
                    score1: $scope.score1,
                    score2: $scope.score2,
                    forfeitSlot: $scope.forfeitSlot
                }).success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.score1 = 0;
                    $scope.score2 = 0;
                    definedUserPrivilegesForDisplay();
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                    $rootScope.$emit('updatedMatch', data);
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
                    tournamentId: $scope.tournamentId,
                    signupID: $scope.tournamentInfo.signupID,
                    number: $scope.gameToUnreport.name
                }).success(function (data) {
                    $scope.tournamentInfo = data;
                    definedUserPrivilegesForDisplay();
                    $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
                    $rootScope.$emit('updatedMatch', data);
                }).error(function (data) {
                    $scope.errorMessage = data;
                    $scope.tourneyReportingKo = true;
                });
            };
            $scope.hideLocalAlerts = function () {
                $scope.tourneyReportingKo = false;
                $scope.tourneyReportingOk = false;
            };

            $scope.togglePlayerHighlight = function (player) {
                if ($scope.playerToHighlight && player && $scope.playerToHighlight.name === player.name) {
                    $scope.playerToHighlight = null;
                } else {
                    $scope.playerToHighlight = player;
                }
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            };

            $scope.showPreviousTournament = function () {
                $http.get('/api/play/' + $scope.relatedTournaments[$scope.relatedTournaments.length - 1].tournamentData.parentTournamentPublicId).success(function (tournamentData) {

                    if(tournamentData){
                        var rendererToUse = utils_availableRenderers[tournamentData.engine];
                        $scope.relatedTournaments.push({
                            tournamentData: tournamentData,
                            renderer: rendererToUse,
                            engineTemplate: '/partials/engineTemplates/' + tournamentData.engine
                        });

                        var relatedTournaments = document.getElementById('relatedTournaments');
                        var newTournamentContainer = document.createElement('div');
                        var tournamentTitle = document.createElement('h2');
                        tournamentTitle.innerText = tournamentData.tournamentName;
                        var newTournament = null;
                        if(tournamentData.engine === 'singleElim'){
                            //D3 stuff
                            newTournament = document.createElement('div');
                            newTournament.setAttribute('id', tournamentData.signupID);

                        } else {
                            newTournament = document.createElement('iframe');
                            newTournament.setAttribute('id', tournamentData.signupID);
                            newTournament.setAttribute('class', 'parentTournament');
                            newTournament.setAttribute('src', '/embed/'+tournamentData.signupID);
                        }
                        newTournamentContainer.appendChild(tournamentTitle);
                        newTournamentContainer.appendChild(newTournament);
                        relatedTournaments.appendChild(newTournamentContainer);
                        if (tournamentData.running) {
                            rendererToUse.render(tournamentData, d3, $scope.controllerReferencesForRenderer, null, false, tournamentData.signupID);
                        }
                    }
                    $scope.hasNext = tournamentData.parentTournamentPublicId;

                });
            };

            $rootScope.$on('toggledStart', function (event, tournamentInfo) {
                $scope.tournamentInfo = tournamentInfo;
                $scope.renderer = utils_availableRenderers[tournamentInfo.engine];
                $scope.engineTemplate = '/partials/engineTemplates/' + tournamentInfo.engine;
                $scope.relatedTournaments[0].tournamentData.running = tournamentInfo.running;
                $scope.renderer.render($scope.tournamentInfo, d3, $scope.controllerReferencesForRenderer, $scope.playerToHighlight);
            });
        }
    );