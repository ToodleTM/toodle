'use strict';

angular.module('toodleApp')
    .controller('PlayersRegistrationCtrl', function ($rootScope, $scope, $location, $http, $upload, $cookies, $cookieStore, $modal) {
        $scope.tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Admin Page']);
        _paq.push(['trackPageView']);

        $scope.multipleRegistrationOk = function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = $scope.tournamentInfo.players;
            $scope.alertMessage = 'admin.actions.multipleRegistrationSuccessful';
            document.getElementById('multiSeedInput').value = '';
            $scope.updateOk =true;
        };

        var multipleRegistrationFailed = function (err, status) {
            if (status === 404) {
                $scope.errorMessage = 'admin.error.noSuchTournament';
            } else {
                $scope.errorMessage = 'admin.error.'+err.message;
            }
            document.getElementById('multiSeedInput').value = '';
            $scope.alertMessage = 'play.register.fail';
            $scope.updateKo = true;
        };

        $scope.hideUpdateAlert = function(){
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
                    if(!$scope.engine){
                        $scope.engine = engines[0];
                    }
                });
                $scope.tournamentInfo = data;
                $scope.playerList = $scope.tournamentInfo.players;
                $scope.tournamentStartDate = $scope.tournamentInfo.startDate;
                $cookieStore.put('toodle-'+$scope.tournamentInfo.signupID, data._id);
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
                        .success(function () {})
                        .error(function (message) {
                            $scope.errorMessage = 'admin.actions.'+message.message;
                            $scope['notes-' + $scope.stripped(movedPlayer)] = true;
                        });
                    }
                });
                $('ul, li').disableSelection();
                if ($scope.tournamentInfo.game) {
                    $http.get('/views/resources/factions.json').success(function (data) {
                        $scope.factions = data[$scope.tournamentInfo.game];
                    });
                }
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
            $scope.tournamentInfo.engine = $scope.engine.name;
            $http.patch('/api/tournament/admin/update/?id=' + $scope.tournamentId, {_id:$scope.tournamentInfo._id, engine:$scope.tournamentInfo.engine})
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
                    $scope.errorMessage = 'admin.form.'+err.message;
                    $scope.updateKo = true;
                });
        };

        $scope.startTournament = function (configureOnly) {
            $scope.hideUpdateAlert();
            if(!configureOnly) {
                $scope.tournamentInfo.running = true;
                $http.patch('/api/tournament/start', {'tournamentId': $scope.tournamentInfo._id, engine: $scope.engine})
                    .success(function (tournamentInfo) {
                        $scope.updateOk = true;
                        $scope.alertMessage = 'admin.update.success';
                        $scope.tournamentInfo = tournamentInfo;
                        window.location = '/admin/' + $scope.tournamentInfo._id;
                    })
                    .error(function (data) {
                        $scope.tournamentInfo.running = false;
                        $scope.errorMessage = 'admin.actions.run.' + data.message;
                        $scope.alertMessage = 'admin.update.fail';
                        $scope.updateKo = true;
                    });
            } else {
                window.location = '/admin/' + $scope.tournamentInfo._id;
            }
        };

        $scope.addPlayer = function () {
            $scope.hideUpdateAlert();
            if ($scope.nick) {
                $http.post('/api/tournament/addPlayer/', {
                    'tournamentId': $scope.tournamentInfo._id,
                    nick: $scope.nick,
                    faction: $scope.faction
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
                            $scope.errorMessage = 'play.register.errors.'+data.message;
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

        $scope.removePlayer = function (playerNick) {

            $http.post('/api/tournament/admin/removePlayer', {
                tournamentId: $scope.tournamentInfo._id,
                nick: playerNick
            }).success(function (data) {
                $scope.playerList = data.players;
            }).error(function (message) {
                $scope.errorMessage = message.message;
                $scope['notes-'+ $scope.stripped(playerNick)] = true;
            });
        };

        $scope.stripped = function (nick) {
            return nick.replace(/\s/g, '');
        };

        $scope.openRunDialog = function (size) {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/startStopTemplate.html',
                controller: 'ModalToggleStartCtrl',
                size: size,
                resolve: {
                    tournamentInfo:function(){
                        return $scope.tournamentInfo;
                    },
                    allowConfigureBeforeStart:function(){
                        return true;
                    }
                }
            });

            modalInstance.result.then(function (configureOnly) {
                $scope.startTournament(configureOnly);
            }, function () {
            });
        };

        $scope.preconfigure = function(){
            window.location = '/admin/preconfigure/'+ $scope.tournamentId;
        };

        $scope.openPreconfigureDialog = function (size) {
            var modalInstance = $modal.open({
                templateUrl: '/views/partials/popinTemplates/preconfigureTemplate.html',
                controller: 'ModalPreconfigureCtrl',
                size: size,
                resolve: {
                    tournamentInfo:function(){
                        return $scope.tournamentInfo;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.preconfigure();
            }, function () {
            });
        };
    }
);
