var app = angular.module('myapp', ['ui.bootstrap']);

app.controller('groupController', function ($scope, $http, $timeout) {

    $scope.group = '';
    $scope.btn = '';
    $scope.notice = '';
    $scope.insertgroup = function (group) {
        $http.post('php/a_insert_group.php', {
            "group": group
        }).success(function (data) {
            if (data) {
                $scope.notice = "save data ready" ;
                $scope.btn = 'D';
            }
        });
    }



});
