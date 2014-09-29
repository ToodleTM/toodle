'use strict';

angular.module('toodleApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $scope.tournamentName = "";

    $scope.createTourney = function(){
        $("#tourneyCreationKo").fadeOut();
        $("#tourneyCreationOk").fadeOut();
        $http.post('/api/tournament/', {tournamentName:$scope.tournamentName, players:[]})
            .success(function(res){
                $scope.adminURL = res.adminURL;
                $scope.signupURL = res.signupURL;
                $location.path('/');
                $scope.tournamentCreated = true;
                $("#tourneyCreationOk").fadeIn();
                $scope.tournamentName = "";
            })
            .error(function(){
                $scope.errorMessage = err.data.errors.tournamentName.message;
                $("#tourneyCreationKo").fadeIn();
            });
    };
  });
