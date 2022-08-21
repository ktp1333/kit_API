var app = angular.module('myapp', []);

app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
app.controller('suggestionController', function ($scope, $http, $timeout) {
    $scope.group = '';
    // $scope.suggestion = '';
    $scope.listsuggestion = listsuggestion;
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
        listsuggestion($scope.group);
    });

    function listsuggestion(classgroup) {
        $scope.classgroup = classgroup;
        $http.post('php/a_get_suggestion.php', {
            "classgroup": $scope.classgroup
        }).success(function (data) {
            $scope.suggestion = data;
            // registUpdated = true;
            // getallmember(classgroup);
        });

    }
  
});
