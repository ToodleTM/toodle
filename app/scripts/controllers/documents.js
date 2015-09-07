'use strict';

angular.module('toodleApp')
    .controller('DocumentsCtrl', function ($scope, $window, $translate, $translatePartialLoader) {
        var document = $window.location.href.split('/').pop();
        $translatePartialLoader.addPart('doc/'+document);
        $translate.refresh();

        $scope.documentTemplate = 'partials/pages/'+document+'.html';
    });
