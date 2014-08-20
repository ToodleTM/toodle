'use strict';

angular.module('toodleApp')
    .controller('AdminCtrl', function ($scope, $location, $http, Tournament) {
        var tournamentId = $location.$$path.split('/')[2];

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
            $http.put("/api/tournament/start/", {"tournamentId":$scope.tournamentInfo._id})
                .success(function(data, status, headers, config) {
                    $("#tourneyRunOk").fadeIn();
                })
                .error(function(data, status, headers, config) {
                    $scope.errorMessage = err;
                    $("#tourneyRunKo").fadeIn();
                });
        };
    }
);
