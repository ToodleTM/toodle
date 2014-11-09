'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, $upload, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;

        $("#tournamentStart").datepicker({minDate: 0, maxDate: "+12M", showButtonPanel: true});

        //using the basic example for ng-file-upload directive (https://www.npmjs.org/package/angular-file-upload),
        // works like a charm but beware of where to load the directive (if I do it just for that controller,
        // the admin view won't load anymore, had to do it in the main app script, like for I18N for example)
        $scope.onFileSelect = function ($files) {
            $("#multipleRegistrationOk").hide();
            $("#multipleRegistrationKo").hide();
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/api/tournament/admin/multipleRegistration?tournamentId=' + $scope.tournamentInfo._id,
                    data: {myObj: $scope.myModelObj},
                    file: file
                }).progress(function (evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $("#multiSeedInput").val('');
                    $scope.tournamentInfo = data;
                    $scope.playerList = $scope.tournamentInfo.players;
                    $("#multipleRegistrationOk").fadeIn();
                }).error(function (err, status, data) {
                    if (status == 404) {
                        $scope.errorMessage = 'noSuchTournament';
                    } else {
                        $scope.errorMessage = err.message;
                    }
                    $("#multiSeedInput").val('');
                    $("#multipleRegistrationKo").fadeIn();
                });
            }
        };
        $http.get('api/tournament/admin/' + tournamentId)
            .success(function (data, status, error) {
                $scope.tournamentInfo = data;
                $scope.playerList = $scope.tournamentInfo.players;
                $scope.tournamentStartDate = $scope.tournamentInfo.startDate;
                $("#sortablePlayerList").sortable({
                    revert: true,
                    stop: function (event, objectMoved) {
                        var movedPlayer = objectMoved.item[0].innerText;
                        var nextPlayerInList = objectMoved.item[0].nextElementSibling ? objectMoved.item[0].nextElementSibling.innerText : null;
                        $http.post('/api/tournament/admin/rearrangePlayers', {
                            tournamentId: $scope.tournamentInfo._id,
                            playerToMove: movedPlayer,
                            newNextPlayer: nextPlayerInList
                        })
                        .success(function (data) {

                        })
                        .error(function (message, statusCode) {
                            $scope.errorMessage = message.message;
                            $("#notes-" + $scope.stripped(movedPlayer)).show();
                        });
                    }
                });
                $("ul, li").disableSelection();
                if ($scope.tournamentInfo.game) {
                    $http.get('/views/resources/factions.json').success(function (data) {
                        $scope.factions = data[$scope.tournamentInfo.game];
                    });
                }
                updateMatchesToReport();
                updateMatchesToUnreport();
            })
            .error(function (error, status) {
                $("#content *").hide();
                if (status == 404) {
                    $scope.error = 'noSuchTournament';
                } else {
                    $scope.error = 'serverError';
                }
                $("#error").show();
            });

        $scope.updateTourney = function () {
            $("#tourneyUpdateOk").hide();
            $("#tourneyUpdateKo").hide();
            $scope.tournamentInfo.startDate = $scope.tournamentStartDate;
            $http.put('/api/tournament/admin/update/?id=' + tournamentId, $scope.tournamentInfo)
                .success(function (data) {
                    $scope.tournamentInfo = data;
                    $("#tourneyUpdateOk").fadeIn();
                    if ($scope.tournamentInfo.game) {
                        $http.get('/views/resources/factions.json').success(function (data) {
                            $scope.factions = data[$scope.tournamentInfo.game];
                        });
                    }
                })
                .error(function () {
                    scope.errorMessage = err;
                    $("#tourneyUpdateKo").fadeIn();
                });
        };

        $scope.toggleRegistrationLock = function () {
            $("#tourneyRunOk").hide();
            $("#tourneyRunKo").hide();
            var previousLockedStatus = $scope.tournamentInfo.locked;
            $scope.tournamentInfo.locked = genericUtils.toggleState($scope.tournamentInfo.locked);
            $http.put('/api/tournament/admin/' + (!$scope.tournamentInfo.locked ? 'un' : '') + 'lockTournament?tournamentId=' + tournamentId, $scope.tournamentInfo)
                .success(function (code, data) {
                    if (code == 404) {
                        $scope.tournamentInfo.locked = previousLockedStatus;
                        $scope.errorMessage = 'notFound';
                        $("#tourneyRunKo").fadeIn();
                    } else {
                        $("#tourneyRunOk").fadeIn();
                    }
                })
                .error(function (error) {
                    $scope.tournamentInfo.locked = previousLockedStatus;
                    $scope.errorMessage = error.message;
                    $("#tourneyRunKo").fadeIn();
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
                .error(function (err) {
                });
        }
        $scope.toggleStart = function () {
            $("#tourneyRunOk").hide();
            $("#tourneyRunKo").hide();
            var originalValue = $scope.tournamentInfo.running;
            $scope.tournamentInfo.running = genericUtils.toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if ($scope.tournamentInfo.running) {
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.put('/api/tournament/' + urlSuffix + '/', {"tournamentId": $scope.tournamentInfo._id})
                .success(function (tournamentInfo) {
                    $("#tourneyRunOk").fadeIn();
                    $scope.tournamentInfo = tournamentInfo;
                    updateMatchesToReport();
                    updateMatchesToUnreport();
                })
                .error(function (data) {
                    $scope.tournamentInfo.running = originalValue;
                    $scope.errorMessage = data.message;
                    $("#tourneyRunKo").fadeIn();
                });
        };

        $scope.addPlayer = function () {
            $("#registrationKo").hide();
            $("#registrationOk").hide();
            if ($scope.nick) {
                $http.post('/api/tournament/addPlayer/', {
                    "tournamentId": $scope.tournamentInfo._id,
                    nick: $scope.nick,
                    faction: $scope.faction
                })
                    .success(function (data) {
                        $scope.tournamentInfo = data;
                        $scope.playerList = $scope.tournamentInfo.players;
                        $("#registrationOk").fadeIn();
                    })
                    .error(function (data, statusCode) {
                        if (statusCode == '404') {
                            $scope.errorMessage = 'noSuchTournament';
                        } else {
                            $scope.errorMessage = data.message;
                        }
                        $("#registrationKo").fadeIn();
                    });
                $scope.nick = '';
            }
        };

        $scope.reportMatch = function () {
            $("#tourneyReportingOk").hide();
            $("#tourneyReportingKo").hide();
            $http.post('/api/tournament/reportMatch/', {
                tournamentId: $scope.tournamentInfo._id,
                number: $scope.firstGameToReport.number,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $("#tourneyReportingKo").fadeIn();
            });
        };

        $scope.unreportMatch = function () {
            $("#tourneyReportingOk").hide();
            $("#tourneyReportingKo").hide();
            $http.post('/api/tournament/unreportMatch/', {
                tournamentId: $scope.tournamentInfo._id,
                number: $scope.gameToUnreport.number
            }).success(function (data) {
                updateMatchesToReport();
                updateMatchesToUnreport();
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $("#tourneyReportingKo").fadeIn();
            });
        };

        $scope.removePlayer = function (playerNick) {

            $http.post('/api/tournament/admin/removePlayer', {
                tournamentId: $scope.tournamentInfo._id,
                nick: playerNick
            }).success(function (data) {
                $scope.playerList = data.players;
            }).error(function (message, statusCode) {
                $scope.errorMessage = message.message;
                $("#notes-" + $scope.stripped(playerNick)).show();
            });
        };

        $scope.stripped = function (nick) {
            return nick.replace(/\s/g, '');
        }
    }
);
