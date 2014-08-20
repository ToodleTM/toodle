'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament, TournamentPlay) {
        var tournamentId = $location.$$path.split('/')[2];
        $scope.nick;
        $http.get('api/tournament/' + tournamentId).success(function (data) {
            $scope.tournamentInfo = data;
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
            $scope.tournamentInfo.locked = toggleState($scope.tournamentInfo.locked);
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
            $scope.tournamentInfo.running = toggleState($scope.tournamentInfo.running);
            var urlSuffix = '';
            if($scope.tournamentInfo.running){
                urlSuffix = 'start';
            } else {
                urlSuffix = 'stop';
            }
            $http.put('/api/tournament/'+urlSuffix+'/', {"tournamentId":$scope.tournamentInfo._id})
                .success(function(data, status, headers, config) {
                    $("#tourneyRunOk").fadeIn();
                })
                .error(function(data, status, headers, config) {
                    $scope.errorMessage = data.message;
                    $("#tourneyRunKo").fadeIn();
                });
        };

        $scope.addPlayer = function(){
            $("#registrationKo").hide();
            $("#registrationOk").hide();
            if($scope.nick){
                $scope.tournamentInfo.players.push({name:$scope.nick});
                $scope.updateTourney();
                $scope.nick = '';
            }
        }
    }
);
