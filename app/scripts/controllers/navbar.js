'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookies, $cookieStore) {

        $scope.selectedLanguage = $cookies['toodle-lang']?$cookies['toodle-lang']:'en';

        $scope.switchLanguage = function(newLang){

            console.log(newLang);
            $translate.use(newLang);
            $cookieStore.put('toodle-lang', newLang);
        };
        console.log($scope.selectedLanguage);
        $scope.switchLanguage($scope.selectedLanguage);
        $("#language").on('change', function(evt){ $scope.switchLanguage(evt.currentTarget.value);$scope.$apply()});
    });
