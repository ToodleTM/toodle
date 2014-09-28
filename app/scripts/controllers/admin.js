'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick = '';
        $scope.playerList = null;
        $http.get('api/tournament/admin/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
            $scope.playerList = $scope.tournamentInfo.players;
            $http.get('/api/tournament/matchesToReport?tournamentId='+$scope.tournamentInfo._id)
                .success(function(data){
                    $scope.gamesToReport = data;
                    if(data.length > 0 ){
                        $scope.firstGameToReport = $scope.gamesToReport[0];
                        $scope.number = $scope.firstGameToReport.number;
                        $scope.score1=0;
                        $scope.score2=0;
                    }
                })
                .error(function(){
                });
        });

        $scope.updateTourney = function () {
            $("#tourneyUpdateOk").hide();
            $("#tourneyUpdateKo").hide();
            Tournament.update({id: tournamentId}, $scope.tournamentInfo, function () {
                $("#tourneyUpdateOk").fadeIn();
            }, function (err) {
                $scope.errorMessage = err;
                $("#tourneyUpdateKo").fadeIn();
            })
        };

        $scope.toggleRegistrationLock = function () {
            $("#tourneyLockOk").hide();
            $("#tourneyLockKo").hide();
            $scope.tournamentInfo.locked = genericUtils.toggleState($scope.tournamentInfo.locked);
            Tournament.update({id: tournamentId}, $scope.tournamentInfo, function () {
                $("#tourneyLockOk").fadeIn();
            }, function (err) {
                $scope.errorMessage = err;
                $("#tourneyLockKo").fadeIn();
            })
        };

        $scope.toggleStart = function () {
            $("#tourneyRunOk").hide();
            $("#tourneyRunKo").hide();
            $scope.tournamentInfo.running = genericUtils.toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if ($scope.tournamentInfo.running) {
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.put('/api/tournament/' + urlSuffix + '/', {"tournamentId": $scope.tournamentInfo._id})
                .success(function () {
                    $("#tourneyRunOk").fadeIn();
                })
                .error(function (data) {
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

        $scope.reportMatch = function(){
            $("#tourneyUpdateOk").hide();
            $("#tourneyUpdateKo").hide();
            $http.post('/api/tournament/reportMatch/', {tournamentId:$scope.tournamentInfo._id, number:$scope.number, score1:$scope.score1, score2:$scope.score2}).success(function(data){
                $("#tourneyUpdateOk").fadeIn();
                $http.get('/api/tournament/matchesToReport?tournamentId='+$scope.tournamentInfo._id)
                    .success(function(data){
                        $scope.gamesToReport = data;
                        if(data.length > 0 ){
                            $scope.firstGameToReport = $scope.gamesToReport[0];
                            $scope.number = $scope.firstGameToReport.number;
                            $scope.score1=0;
                            $scope.score2=0;
                        }
                    })
                    .error(function(){
                    });
                $scope.tournamentInfo = data;
                console.log($scope.gamesToReport, $scope.firstGameToReport, $scope.tournamentInfo);
            }).error(function(data){
                $("#tourneyUpdateKo").fadeIn();
            });
            //console.log($scope.score1, $scope.score2);
        };
    }
);
