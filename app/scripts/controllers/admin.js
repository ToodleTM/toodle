'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($rootScope, $scope, $location, $http, $upload, $modal, $translatePartialLoader, $translate) {
        $translatePartialLoader.addPart('app/admin');
        $translate.refresh();
        $scope.tournamentId = $location.$$path.split('/')[2];
        $scope.inputs = {nick: '', faction: null};
        $scope.playerList = null;
        $scope.isCollapsed = true;
        _paq.push(['setDocumentTitle', 'Admin Page']);
        _paq.push(['trackPageView']);

        $scope.multipleRegistrationOk = function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = $scope.tournamentInfo.players;
            $scope.alertMessage = 'admin.actions.multipleRegistrationSuccessful';
            document.getElementById('multiSeedInput').value = '';
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
            $scope.updateKo = false;
            $scope.error = false;
            $scope.alertMessage = null;
            $scope.errorMessage = null;
            $scope.infoMessage = null;
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
                            $scope.tournamentInfo.engineObject = item;
                            $scope.canSwapPlayers = $scope.tournamentInfo.engineObject.compatible.indexOf('playerSwap') !== -1;
                        }
                    });
                    if (!$scope.tournamentInfo.engineObject) {
                        $scope.tournamentInfo.engineObject = $scope.availableEngines[0];
                    }
                });
                $scope.tournamentInfo = data;
                $scope.playerList = $scope.tournamentInfo.players;
                $scope.tournamentInfo.formStartDate = $scope.tournamentInfo.startDate;

                $http.get('/views/resources/factions.json').success(function (factionsMap) {
                    var factionsArray = [];
                    for (var key in factionsMap) {
                        for (var item in factionsMap[key]) {
                            factionsArray.push({
                                name: key + ' - ' + factionsMap[key][item],
                                tracker: factionsMap[key][item].toLowerCase()
                            });
                        }
                    }

                    $scope.factions = factionsArray;
                });
                updateMatchesToReport();
                if($location.search().followUpError){
                    $scope.alertMessage = 'admin.actions.followup.errors.couldNotStartRightAway';
                    $scope.infoMessage = 'admin.actions.run.errors.'+ $location.search().followUpError;
                }
            })
            .error(function (error, status) {
                if (status === 404) {
                    $scope.error = 'noSuchTournament';
                } else {
                    $scope.error = 'serverError';
                }
                $scope.error = true;
            });

        $scope.updateTourney = function () {
            $scope.hideUpdateAlert();
            $scope.tournamentInfo.engine = $scope.tournamentInfo.engineObject.name;
            $http.patch('/api/tournament/admin/update/?id=' + $scope.tournamentId, {
                _id: $scope.tournamentInfo._id,
                game: $scope.tournamentInfo.game,
                engine: $scope.tournamentInfo.engine,
                description: $scope.tournamentInfo.description,
                startDate: $scope.tournamentInfo.formStartDate,
                userPrivileges: $scope.tournamentInfo.userPrivileges
            })
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.alertMessage = 'admin.update.success';
                    $scope.tournamentInfo.formStartDate = $scope.tournamentInfo.startDate;
                    $scope.availableEngines.forEach(function (item) {
                        if (item.name === $scope.tournamentInfo.engine) {
                            $scope.tournamentInfo.engineObject = item;
                            $scope.canSwapPlayers = $scope.tournamentInfo.engineObject.compatible.indexOf('playerSwap') !== -1;
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
            $scope.tournamentInfo.locked = utils_genericUtils.toggleState($scope.tournamentInfo.locked);
            $http.patch('/api/tournament/admin/' + (!$scope.tournamentInfo.locked ? 'un' : '') + 'lockTournament?tournamentId=' + $scope.tournamentId, $scope.tournamentInfo)
                .success(function (code) {
                    if (code === 404) {
                        $scope.tournamentInfo.locked = previousLockedStatus;
                        $scope.errorMessage = 'admin.actions.run.notFound';
                        $scope.updateKo = true;
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

        $scope.toggleStart = function () {
            $scope.hideUpdateAlert();
            var originalValue = $scope.tournamentInfo.running;
            $scope.tournamentInfo.running = utils_genericUtils.toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if ($scope.tournamentInfo.running) {
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.patch('/api/tournament/' + urlSuffix, {'tournamentId': $scope.tournamentInfo._id})
                .success(function (tournamentInfo) {
                    $scope.alertMessage = 'admin.update.success';
                    $scope.tournamentInfo = tournamentInfo;
                    $scope.tournamentInfo.formStartDate = $scope.tournamentInfo.startDate;
                    $scope.availableEngines.forEach(function (item) {
                        if (item.name === $scope.tournamentInfo.engine) {
                            $scope.tournamentInfo.engineObject = item;
                            $scope.canSwapPlayers = $scope.tournamentInfo.engineObject.compatible.indexOf('playerSwap') !== -1;
                        }
                    });
                    updateMatchesToReport();
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
            if ($scope.inputs.nick) {
                $http.post('/api/tournament/addPlayer/', {
                    'tournamentId': $scope.tournamentInfo._id,
                    nick: $scope.inputs.nick,
                    faction: $scope.inputs.faction ? $scope.inputs.faction.tracker : null
                })
                    .success(function (data) {
                        $scope.tournamentInfo = data;
                        $scope.playerList = $scope.tournamentInfo.players;
                        $scope.alertMessage = 'play.register.success';
                        document.getElementById('inputNick').focus();
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
                $scope.inputs.nick = '';
            } else {
                $scope.errorMessage = 'play.register.errors.noEmptyNick';
                $scope.alertMessage = 'play.register.fail';
                $scope.updateKo = true;
            }
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
                    },
                    allowConfigureBeforeStart: function () {
                        return false;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.toggleStart();
            }, function () {
            });
        };

        $scope.openCreateFollowingTournamentDialog = function (size) {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/createFollowingTournamentTemplate.html',
                controller: 'ModalCreateFollowingTournamentCtrl',
                size: size,
                resolve: {
                    availableEngines: function () {
                        return $scope.availableEngines;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $scope.hideUpdateAlert();
                var configureOnly = data[0];
                var name = data[1];
                var engine = data[2];
                var description = data[3];
                var startDate = data[4];


                $http.post('/api/tournament', {
                    tournamentName: name,
                    engine: engine.name,
                    description: description,
                    startDate: startDate,
                    parentTournament: $scope.tournamentInfo._id,
                    parentTournamentPublicId: $scope.tournamentInfo.signupID
                })
                    .success(function (newTournamentData) {
                        if (!configureOnly) {
                            $http.patch('/api/tournament/start', {tournamentId: newTournamentData._id})
                                .success(function () {
                                    $location.path('/admin/' + newTournamentData._id);
                                })
                                .error(function (err) {
                                    console.info('Cannot start tournament, redirecting to admin page without starting');
                                    $location.url('/admin/' + newTournamentData._id + '?followUpError=' + err.message);
                                });
                        } else {
                            $location.path('/admin/' + newTournamentData._id);
                        }
                    }).error(function (err) {
                        $scope.alertMessage = 'admin.actions.followup.errors.couldNotCreate';
                        $scope.errorMessage = 'admin.actions.followup.errors.'+err.message;
                    });

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

        $scope.today = function () {
            $scope.tournamentInfo.formStartDate = new Date();
        };

        $scope.clear = function () {
            $scope.tournamentInfo.formStartDate = null;
        };

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };

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
        $scope.toggleCollapse = function () {
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

        $rootScope.$on('updatedMatch', function () {
            updateMatchesToReport();
        });
    }
);
