'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($rootScope, $scope, $location, $http, $upload, $cookies, $cookieStore, $modal) {
        $scope.tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        $scope.isCollapsed = true;
        _paq.push(['setDocumentTitle', 'Admin Page']);
        _paq.push(['trackPageView']);


        $scope.multipleRegistrationOk = function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = $scope.tournamentInfo.players;
            $scope.alertMessage = 'admin.actions.multipleRegistrationSuccessful';
            document.getElementById('multiSeedInput').value = '';
            $scope.updateOk = true;
        };

        var multipleRegistrationFailed = function (err, status) {
            if (status === 404) {
                $scope.errorMessage = 'admin.error.noSuchTournament';
            } else {
                $scope.errorMessage = 'admin.error.' + err.message;
            }
            document.getElementById('multiSeedInput').value = '';
            $scope.alertMessage = 'play.register.fail';
            $scope.updateKo = true;
        };

        $scope.hideUpdateAlert = function () {
            $scope.updateOk = false;
            $scope.updateKo = false;
            $scope.error = false;
        };

        //using the basic example for ng-file-upload directive (https://www.npmjs.org/package/angular-file-upload),
        // works like a charm but beware of where to load the directive (if I do it just for that controller,
        // the admin view won't load anymore, had to do it in the main app script, like for I18N for example)
        $scope.onFileSelect = function ($files) {
            $scope.hideUpdateAlert();

            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/tournament/admin/multipleRegistration?tournamentId=' + $scope.tournamentInfo._id,
                    data: {myObj: $scope.myModelObj},
                    file: file
                })
                    .success($scope.multipleRegistrationOk)
                    .error(multipleRegistrationFailed);
            }
        };
        $http.get('api/tournament/admin/' + $scope.tournamentId)
            .success(function (data) {
                $http.get('api/available-engines').success(function (engines) {
                    $scope.availableEngines = engines;
                    engines.forEach(function (item) {
                        if (item.name === data.engine) {
                            $scope.engine = item;
                            $scope.canSwapPlayers = $scope.engine.compatible.indexOf('playerSwap') !== -1;
                        }
                    });
                });
                $scope.tournamentInfo = data;
                $http.get('api/available-engines').success(function (engines) {
                    $scope.availableEngines = engines;
                    engines.forEach(function (item) {
                        if (item.name === data.engine) {
                            $scope.engine = item;
                        }
                    });
                }).error(function () {
                });
                $scope.playerList = $scope.tournamentInfo.players;
                $scope.tournamentStartDate = $scope.tournamentInfo.startDate;
                $cookieStore.put('toodle-' + $scope.tournamentInfo.signupID, data._id);
                $('#sortablePlayerList').sortable({
                    revert: true,
                    stop: function (event, objectMoved) {
                        var movedPlayer = objectMoved.item[0].innerText;
                        var nextPlayerInList = objectMoved.item[0].nextElementSibling ? objectMoved.item[0].nextElementSibling.innerText : null;
                        $http.post('/api/tournament/admin/rearrangePlayers', {
                            tournamentId: $scope.tournamentInfo._id,
                            playerToMove: movedPlayer,
                            newNextPlayer: nextPlayerInList
                        })
                            .success(function () {
                            })
                            .error(function (message) {
                                $scope.errorMessage = 'admin.actions.' + message.message;
                                $scope['notes-' + $scope.stripped(movedPlayer)] = true;
                            });
                    }
                });
                $('ul, li').disableSelection();
                $http.get('/views/resources/factions.json').success(function (factionsMap) {
                    var factionsArray = [];
                    for(var key in factionsMap){
                        for(var item in factionsMap[key]){
                            factionsArray.push({name:key+' - '+factionsMap[key][item], tracker: factionsMap[key][item].toLowerCase()});
                        }
                    }

                    $scope.factions = factionsArray;
                });
                updateMatchesToReport();
                updateMatchesToUnreport();
            })
            .error(function (error, status) {
                $('#content *').hide();
                if (status === 404) {
                    $scope.error = 'noSuchTournament';
                } else {
                    $scope.error = 'serverError';
                }
                $scope.error = true;
            });

        $scope.updateTourney = function () {
            $scope.hideUpdateAlert();
            $scope.tournamentInfo.startDate = $scope.tournamentStartDate;
            $scope.tournamentInfo.engine = $scope.engine.name;
            $http.patch('/api/tournament/admin/update/?id=' + $scope.tournamentId, {
                _id: $scope.tournamentInfo._id,
                game: $scope.tournamentInfo.game,
                engine: $scope.tournamentInfo.engine,
                description: $scope.tournamentInfo.description,
                startDate: $scope.tournamentStartDate,
                userPrivileges: $scope.tournamentInfo.userPrivileges
            })
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.alertMessage = 'admin.update.success';
                    $scope.updateOk = true;
                    if ($scope.tournamentInfo.game) {
                        $http.get('/views/resources/factions.json').success(function (data) {
                            $scope.factions = data[$scope.tournamentInfo.game];
                        });
                    }
                    $scope.availableEngines.forEach(function (item) {
                        if (item.name === $scope.tournamentInfo.engine) {
                            $scope.engine = item;
                            $scope.canSwapPlayers = $scope.engine.compatible.indexOf('playerSwap') !== -1;
                        }
                    });
                })
                .error(function (err) {
                    $scope.alertMessage = 'admin.update.fail';
                    $scope.errorMessage = 'admin.form.' + err.message;
                    $scope.updateKo = true;
                });
        };

        $scope.toggleRegistrationLock = function () {
            $scope.hideUpdateAlert();
            var previousLockedStatus = $scope.tournamentInfo.locked;
            $scope.tournamentInfo.locked = genericUtils.toggleState($scope.tournamentInfo.locked);
            $http.patch('/api/tournament/admin/' + (!$scope.tournamentInfo.locked ? 'un' : '') + 'lockTournament?tournamentId=' + $scope.tournamentId, $scope.tournamentInfo)
                .success(function (code) {
                    if (code === 404) {
                        $scope.tournamentInfo.locked = previousLockedStatus;
                        $scope.errorMessage = 'admin.actions.run.notFound';
                        $scope.updateKo = true;
                    } else {
                        $scope.alertMessage = 'admin.update.success';
                        $scope.updateOk = true;
                    }
                })
                .error(function (error) {
                    $scope.tournamentInfo.locked = previousLockedStatus;
                    $scope.errorMessage = 'admin.actions.run.' + error.message;
                    $scope.updateKo = true;
                });
        };

        function updateMatchesToReport() {
            $http.get('/api/tournament/matchesToReport?id=' + $scope.tournamentInfo.signupID)
                .success(function (data) {
                    $scope.gamesToReport = data;
                    if (data.length > 0) {
                        $scope.firstGameToReport = $scope.gamesToReport[0];
                        $scope.number = $scope.firstGameToReport.number;
                        $scope.score1 = 0;
                        $scope.score2 = 0;
                    }
                })
                .error(function () {
                });
        }

        function updateMatchesToUnreport() {
            $http.get('/api/tournament/matchesToUnreport?id=' + $scope.tournamentInfo.signupID)
                .success(function (data) {
                    $scope.gamesToUnreport = data;
                    if (data.length > 0) {
                        $scope.gameToUnreport = $scope.gamesToUnreport[0];
                        $scope.unreportNumber = $scope.gameToUnreport.number;
                    }
                })
                .error(function () {
                });
        }

        $scope.toggleStart = function () {
            $scope.hideUpdateAlert();
            var originalValue = $scope.tournamentInfo.running;
            $scope.tournamentInfo.running = genericUtils.toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if ($scope.tournamentInfo.running) {
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.patch('/api/tournament/' + urlSuffix, {'tournamentId': $scope.tournamentInfo._id})
                .success(function (tournamentInfo) {
                    $scope.updateOk = true;
                    $scope.alertMessage = 'admin.update.success';
                    $scope.tournamentInfo = tournamentInfo;
                    updateMatchesToReport();
                    updateMatchesToUnreport();
                    $rootScope.$emit('toggledStart', tournamentInfo);
                })
                .error(function (data) {
                    $scope.tournamentInfo.running = originalValue;
                    $scope.errorMessage = 'admin.actions.run.' + data.message;
                    $scope.alertMessage = 'admin.update.fail';
                    $scope.updateKo = true;
                });
        };

        $scope.addPlayer = function () {
            $scope.hideUpdateAlert();
            if ($scope.nick) {
                $http.post('/api/tournament/addPlayer/', {
                    'tournamentId': $scope.tournamentInfo._id,
                    nick: $scope.nick,
                    faction: $scope.faction.tracker
                })
                    .success(function (data) {
                        $scope.tournamentInfo = data;
                        $scope.playerList = $scope.tournamentInfo.players;
                        $scope.alertMessage = 'play.register.success';
                        $scope.updateOk = true;

                    })
                    .error(function (data, statusCode) {
                        if (statusCode === '404') {
                            $scope.errorMessage = 'play.register.errors.noSuchTournament';
                        } else {
                            $scope.errorMessage = 'play.register.errors.' + data.message;
                        }
                        $scope.alertMessage = 'play.register.fail';
                        $scope.updateKo = true;

                    });
                $scope.nick = '';
            } else {
                $scope.errorMessage = 'play.register.errors.noEmptyNick';
                $scope.alertMessage = 'play.register.fail';
                $scope.updateKo = true;

            }
        };

        $scope.reportMatch = function () {
            $scope.hideUpdateAlert();
            $http.post('/api/tournament/reportMatch/', {
                tournamentId: $scope.tournamentInfo._id,
                number: $scope.firstGameToReport.number,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.alertMessage = 'admin.actions.reporting.reportingOk';
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = 'admin.actions.reporting.errors.' + data.message;
                $scope.alertMessage = 'admin.actions.reporting.reportingKo';
                $scope.updateKo = true;
            });
        };

        $scope.unreportMatch = function () {
            $scope.hideUpdateAlert();
            $http.post('/api/tournament/unreportMatch/', {
                tournamentId: $scope.tournamentInfo._id,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $scope.updateKo = true;
            });
        };

        $scope.removePlayer = function (playerNick) {

            $http.post('/api/tournament/admin/removePlayer', {
                tournamentId: $scope.tournamentInfo._id,
                nick: playerNick
            }).success(function (data) {
                $scope.playerList = data.players;
            }).error(function (message) {
                $scope.errorMessage = message.message;
                $scope['notes-' + $scope.stripped(playerNick)] = true;
            });
        };

        $scope.stripped = function (nick) {
            return nick.replace(/\s/g, '');
        };

        $scope.downloadTournamentWinners = function () {
            window.open('/api/tournament/winners/csv/?tournamentId=' + $scope.tournamentInfo._id, '_blank', '');
        };

        $scope.openRunDialog = function (size) {

            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/startStopTemplate.html',
                controller: 'ModalToggleStartCtrl',
                size: size,
                resolve: {
                    tournamentInfo: function () {
                        return $scope.tournamentInfo;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.toggleStart();
            }, function () {
            });
        };

        $scope.preconfigure = function () {
            window.location = '/admin/preconfigure/' + $scope.tournamentId;
        };

        $scope.openPreconfigureDialog = function (size) {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/preconfigureTemplate.html',
                controller: 'ModalPreconfigureCtrl',
                size: size,
                resolve: {
                    tournamentInfo: function () {
                        return $scope.tournamentInfo;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.preconfigure();
            }, function () {
            });
        };

        $scope.report = function () {
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
                $scope.reportMatch();
            }, function () {
            });
        };

        $scope.unreport = function () {
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

        $scope.today = function () {
            $scope.tournamentStartDate = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.tournamentStartDate = null;
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        $scope.format = 'dd-MM-yyyy';
        $scope.toggleCollapse = function(){
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.getDayClass = function (date, mode) {
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < $scope.events.length; i++) {
                    var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return $scope.events[i].status;
                    }
                }
            }

            return '';
        };

        $rootScope.$on('updatedMatch', function(){
            updateMatchesToReport();
        });
    }
);
