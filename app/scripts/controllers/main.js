'use strict';

angular.module('ezBracketApp')
  .controller('MainCtrl', function ($scope, QuickAdd, $location) {
    $scope.tournamentName = "";

    $scope.createTourney = function(form){
        QuickAdd.createBasicTournament({tournamentName:$scope.tournamentName, players:[]}, function(){
            $("#tourneyCreationKo").fadeOut();
            $("#tourneyCreationOk").fadeOut();
        }).then(function(res){
            $scope.adminURL = res.adminURL;
            $scope.signupURL = res.signupURL;
            $location.path('/');
            $scope.tournamentCreated = true;
            $("#tourneyCreationOk").fadeIn();
            $scope.tournamentName = "";
        }).catch(function(err){
            $scope.errorMessage = err.data.errors.tournamentName.message;
            $("#tourneyCreationKo").fadeIn();
        });
    };
  });
