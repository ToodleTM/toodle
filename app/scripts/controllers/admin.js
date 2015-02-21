'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($rootScope, $scope, $location, $http, $upload) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        _paq.push(['setDocumentTitle', 'Admin Page']);
        _paq.push(['trackPageView']);
        $('#tournamentStart').datepicker({minDate: 0, maxDate: '+12M', showButtonPanel: true});


        var multipleRegistrationOk = function (data) {
            $('#multiSeedInput').val('');
            $scope.tournamentInfo = data;
            $scope.playerList = $scope.tournamentInfo.players;
            $scope.alertMessage = 'admin.actions.multipleRegistrationSuccessful';
            $('#updateOk').fadeIn();
        };

        var multipleRegistrationFailed = function (err, status) {
            if (status === 404) {
                $scope.errorMessage = 'admin.error.noSuchTournament';
            } else {
                $scope.errorMessage = 'admin.error.'+err.message;
            }
            $('#multiSeedInput').val('');
            $scope.alertMessage = 'play.register.fail';
            $('#updateKo').fadeIn();
        };

        var displayProgress = function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        };

        //using the basic example for ng-file-upload directive (https://www.npmjs.org/package/angular-file-upload),
        // works like a charm but beware of where to load the directive (if I do it just for that controller,
        // the admin view won't load anymore, had to do it in the main app script, like for I18N for example)
        $scope.onFileSelect = function ($files) {
            $('#updateOk').hide();
            $('#updateKo').hide();
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/tournament/admin/multipleRegistration?tournamentId=' + $scope.tournamentInfo._id,
                    data: {myObj: $scope.myModelObj},
                    file: file
                })
                    .progress(displayProgress)
                    .success(multipleRegistrationOk)
                    .error(multipleRegistrationFailed);
            }
        };
        $http.get('api/tournament/admin/' + tournamentId)
            .success(function (data) {
                $scope.tournamentInfo = data;
                $scope.playerList = $scope.tournamentInfo.players;
                $scope.tournamentStartDate = $scope.tournamentInfo.startDate;
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
                            $('#notes-' + $scope.stripped(movedPlayer)).show();
                        });
                    }
                });
                $('ul, li').disableSelection();
                if ($scope.tournamentInfo.game) {
                    $http.get('/views/resources/factions.json').success(function (data) {
                        $scope.factions = data[$scope.tournamentInfo.game];
                    });
                }
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
                $('#error').show();
            });

        $scope.updateTourney = function () {
            $rootScope.hideAlerts();
            $scope.tournamentInfo.startDate = $scope.tournamentStartDate;
            $http.put('/api/tournament/admin/update/?id=' + tournamentId, {_id:$scope.tournamentInfo._id, game:$scope.tournamentInfo.game, engine:$scope.tournamentInfo.engine, description:$scope.tournamentInfo.description, startDate:$scope.tournamentStartDate, userPrivileges:$scope.tournamentInfo.userPrivileges})
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $scope.alertMessage = 'admin.update.success';
                    $('#updateOk').fadeIn();
                    if ($scope.tournamentInfo.game) {
                        $http.get('/views/resources/factions.json').success(function (data) {
                            $scope.factions = data[$scope.tournamentInfo.game];
                        });
                    }
                })
                .error(function (err) {
                    $scope.alertMessage = 'admin.update.fail';
                    $scope.errorMessage = 'admin.form.'+err.message;
                    $('#updateKo').fadeIn();
                });
        };

        $scope.toggleRegistrationLock = function () {
            $rootScope.hideAlerts();
            var previousLockedStatus = $scope.tournamentInfo.locked;
            $scope.tournamentInfo.locked = genericUtils.toggleState($scope.tournamentInfo.locked);
            $http.put('/api/tournament/admin/' + (!$scope.tournamentInfo.locked ? 'un' : '') + 'lockTournament?tournamentId=' + tournamentId, $scope.tournamentInfo)
                .success(function (code) {
                    if (code === 404) {
                        $scope.tournamentInfo.locked = previousLockedStatus;
                        $scope.errorMessage = 'admin.actions.run.notFound';
                        $('#updateKo').fadeIn();
                    } else {
                        $('#updateOk').fadeIn();
                    }
                })
                .error(function (error) {
                    $scope.tournamentInfo.locked = previousLockedStatus;
                    $scope.errorMessage = 'admin.actions.run.'+error.message;
                    $('#updateKo').fadeIn();
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
                .error(function () {});
        }
        $scope.toggleStart = function () {
            $rootScope.hideAlerts();
            var originalValue = $scope.tournamentInfo.running;
            $scope.tournamentInfo.running = genericUtils.toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if ($scope.tournamentInfo.running) {
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.put('/api/tournament/' + urlSuffix + '/', {'tournamentId': $scope.tournamentInfo._id})
                .success(function (tournamentInfo) {
                    $('#updateOk').fadeIn();
                    $scope.alertMessage = 'admin.update.success';
                    $scope.tournamentInfo = tournamentInfo;
                    updateMatchesToReport();
                    updateMatchesToUnreport();
                })
                .error(function (data) {
                    $scope.tournamentInfo.running = originalValue;
                    $scope.errorMessage = 'admin.actions.run.'+data.message;
                    $scope.alertMessage = 'admin.update.fail';
                    $('#updateKo').fadeIn();
                });
        };

        $scope.addPlayer = function () {
            $rootScope.hideAlerts();
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
                        $('#updateOk').fadeIn();
                    })
                    .error(function (data, statusCode) {
                        if (statusCode === '404') {
                            $scope.errorMessage = 'play.register.errors.noSuchTournament';
                        } else {
                            $scope.errorMessage = 'play.register.errors.'+data.message;
                        }
                        $scope.alertMessage = 'play.register.fail';
                        $('#updateKo').fadeIn();
                    });
                $scope.nick = '';
            } else {
                $scope.errorMessage = 'play.register.errors.noEmptyNick';
                $scope.alertMessage = 'play.register.fail';
                $('#updateKo').fadeIn();
            }
        };

        $scope.reportMatch = function () {
            $rootScope.hideAlerts();
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
                $scope.errorMessage = 'admin.actions.reporting.errors.'+data.message;
                $scope.alertMessage = 'admin.actions.reporting.reportingKo';
                $('#updateKo').fadeIn();
            });
        };

        $scope.unreportMatch = function () {
            $rootScope.hideAlerts();
            $http.post('/api/tournament/unreportMatch/', {
                tournamentId: $scope.tournamentInfo._id,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $('#updateKo').fadeIn();
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
                $('#notes-' + $scope.stripped(playerNick)).show();
            });
        };

        $scope.stripped = function (nick) {
            return nick.replace(/\s/g, '');
        };

        $scope.downloadTournamentWinners = function(){
            window.open('/api/tournament/winners/csv/?tournamentId='+$scope.tournamentInfo._id, '_blank', '');
        };
    }
);
