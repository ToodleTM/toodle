'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookies, $cookieStore) {
        $scope.selectedLanguage = $cookies['toodle-lang'] && $cookies['toodle-lang'] != 'undefined' ?JSON.parse($cookies['toodle-lang']):'en';
        $scope.switchLanguage = function(newLang){
            $translate.use(newLang);
            $cookieStore.put('toodle-lang', newLang);
        };
        $scope.switchLanguage($scope.selectedLanguage);
        $("#language").on('change', function(evt){ $scope.switchLanguage(evt.currentTarget.value);$scope.$apply()});
    });
