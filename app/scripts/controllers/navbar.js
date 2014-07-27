'use strict';

angular.module('ezBracketApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'Settings',
      'link': '/settings'
    }];
    
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
