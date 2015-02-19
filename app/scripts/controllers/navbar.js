'use strict';

angular.module('toodleApp')
    .controller('NavbarCtrl', function ($scope, $location, $translate, $cookies, $cookieStore) {
        $scope.selectedLanguage = $cookies['toodle-lang'] && $cookies['toodle-lang'] !== 'undefined' ?JSON.parse($cookies['toodle-lang']):'en';
        $scope.switchLanguage = function(newLang){
            $scope.selectedLanguage = newLang;
            $translate.use(newLang);
            $cookieStore.put('toodle-lang', newLang);
            $('#activeLanguage').attr('src', './images/flags/'+$scope.selectedLanguage+'.svg');
        };
        $scope.switchLanguage($scope.selectedLanguage);

        $('#languageSelector ul li a').click(function(e){
            e.preventDefault();
            $scope.switchLanguage($(this).attr('language'));
            $scope.$apply();
        });

        $('#languageSelector a').click(function(e){
            e.preventDefault();
        });
    });
