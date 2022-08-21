var app = angular.module('myapp', []);

app.controller('adminController', function ($scope, $http, $timeout) {

    $scope.group = '';
    $scope.list = {};

    $http.post('php/a_get_group.php', {
    }).success(function (data) {
        if (data) {
            $scope.list = data[0];

        }
    });

    // $scope.insertgroup = function (group) {
    //         $http.post('php/a_insert_group.php', {
    //             "group": group
    //         }).success(function (data) {
    //             if (data) {
    //                 $scope.notice = "save data ready" ;
    //                 $scope.btn = 'D';
    //             }
    //         });
    //     }


});
