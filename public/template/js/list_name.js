var app = angular.module('myapp', ['ui.bootstrap']);

app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
app.controller('listController', function ($scope, $http, $timeout) {
    $scope.group = '';
    $scope.listname = '';
    $scope.flistname = flistname;
    // $scope.findgroup = findgroup;
    // $scope.classgroup = '';
  
    // findgroup();

    // function findgroup() {
    //     $http.get('php/a_get_class.php').success(function (data) {
    //         $scope.classgroup = data[0].group_no;
    //     });
    // }

    $http.get('php/a_get_listgroup.php').success(function (data) {
        $scope.group = data;
    });

    function flistname(classgroup) {
        $scope.classgroup = classgroup;
        $http.post('php/a_get_listname.php', {
            "classgroup": $scope.classgroup
        }).success(function (data) {
            $scope.listname = data;
            // registUpdated = true;
            // getallmember(classgroup);
        });

    }
  
});
