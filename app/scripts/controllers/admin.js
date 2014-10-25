'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        $http.get('api/tournament/admin/' + tournamentId)
            .success(function (data, status, error) {
                $scope.tournamentInfo = data;
                $scope.playerList = $scope.tournamentInfo.players;
                $http.get('/api/tournament/matchesToReport?tournamentId=' + $scope.tournamentInfo._id)
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

                $http.get('/api/tournament/matchesToUnreport?tournamentId=' + $scope.tournamentInfo._id)
                    .success(function (data) {
                        $scope.gamesToUnreport = data;
                        if (data.length > 0) {
                            $scope.gameToUnreport = $scope.gamesToUnreport[0];
                            $scope.unreportNumber = $scope.gameToUnreport.number;
                        }
                    })
                    .error(function (err) {
                    });
            })
            .error(function(error, status){
                $("#content *").hide();
                if(status == 404){
                    $scope.error = 'noSuchTournament';
                } else {
                    $scope.error = 'serverError';
                }
                $("#error").show();
            });

        $scope.updateTourney = function () {
            $("#tourneyUpdateOk").hide();
            $("#tourneyUpdateKo").hide();
            $http.put('/api/tournament/admin/update/?id=' + tournamentId, $scope.tournamentInfo)
                .success(function () {
                    $("#tourneyUpdateOk").fadeIn();
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
                $http.post('/api/tournament/addPlayer/', {"tournamentId": $scope.tournamentInfo._id, nick: $scope.nick})
                    .success(function (data) {
                        $scope.tournamentInfo = data;
                        $scope.playerList = $scope.tournamentInfo.players;
                        $("#registrationOk").fadeIn();
                    })
                    .error(function (data) {
                        $scope.errorMessage = data.message;
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
                number: $scope.number,
                score1: $scope.score1,
                score2: $scope.score2
            }).success(function (data) {
                $http.get('/api/tournament/matchesToReport?tournamentId=' + $scope.tournamentInfo._id)
                    .success(function (data) {
                        $("#tourneyReportingOk").fadeIn();
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
                $http.get('/api/tournament/matchesToUnreport?tournamentId=' + $scope.tournamentInfo._id)
                    .success(function (data) {
                        $("#tourneyReportingOk").fadeIn();
                        $scope.gamesToUnreport = data;
                        if (data.length > 0) {
                            $scope.gameToUnreport = $scope.gamesToUnreport[0];
                            $scope.unreportNumber = $scope.gameToUnreport.number;
                        }
                    })
                    .error(function (err) {
                        console.log(err);
                    });
                $scope.tournamentInfo = data;
            }).error(function (data) {
                $scope.errorMessage = data;
                $("#tourneyReportingKo").fadeIn();
            });
        };
    }
);
