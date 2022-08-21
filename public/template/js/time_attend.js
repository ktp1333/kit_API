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
app.controller('timeController', function ($scope, $http, $timeout) {
    $scope.group = '';
    $scope.timename = '';
    $scope.ftimename = ftimename;
    $scope.totalhour = 0;
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

    $http.get('php/a_get_totalhour.php').success(function (data) {
        $scope.totalhour = data[0].hr;
    });

    function ftimename(classgroup) {
        $scope.classgroup = classgroup;
        $http.post('php/a_get_timeattend.php', {
            "classgroup": $scope.classgroup,
            "totalhour" : $scope.totalhour
        }).success(function (data) {
            $scope.timename = data;
            // registUpdated = true;
            // getallmember(classgroup);
        });

    }

});
