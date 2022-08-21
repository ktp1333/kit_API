var app = angular.module('myapp', ['ui.bootstrap']);

app.controller('page2Controller', function ($scope, $http, $timeout, $location) {
    init();

    function init() {
        $scope.btn = '';
        $scope.list = {};
        $scope.choice = '';
        $scope.result = '';
        $scope.notice = "";
        var url = $location.path();
        var newString = url.replace("/", "");
        // $http.get("index.html?id=" + newString + "")
        //     .success(function (response) { $scope.information = response.driver; });
        $scope.user = newString;
        $http.get('php/a_get_question.php').success(function (data) {
            $scope.list = data[0];
        });
        showform1();
    }

    $scope.inputvote = function (ID, choice, user) {
        $http.post('php/a_save_vote.php', {
            "ID": ID,
            "user": user,
            "choice": choice
        }).success(function (data) {
            if (data == true) {

                $scope.notice = "your answer has been send !!";
                showform1();
                $scope.btn = 'D';
            }
        });
    }

    function show1() {
        var promise = new Promise(function (resolve, reject) {
            $http.get('php/bi1.php').success(function (data, status, headers, config) {
                $scope.values = data;
                var result = {};
                result.answer = [];
                result._case = [];
                data.forEach(function (element) {
                    result.answer.push(element.answer);
                    result._case.push(element._case);
                }, this);

                //  var result = {};
                // result.answer = [];
                // result._case = [];
                // data.forEach(function (element) {
                //     result.answer.push(element.answer);
                //     result._case.push(element._case);
                // }, this);
                resolve(result);


            }).error(function (data, status, headers, config) {
                reject('Error while searching');
                alert('Error while searching');
            });
        });

        return promise;
    };

    function showform1() {

        show1().then(function (result) {
            console.log(result);
            var chart = c3.generate({
                bindto: '#chart1',
                //  size: {
                //     height: 240,
                //     width: 480
                // },

                data: {
                    json: result,

                    labels: true,

                    type: 'bar',
                },
                color: {

                    pattern: ['#F4FBA7', '#F4FBA7', '#F4FBA7', '#F4FBA7']
                },
                title: {
                    text: 'vote'
                },
                legend: {
                    show: false
                },

                axis: {
                    x: {
                        type: 'category',
                        position: 'outer-center',
                        categories: result.answer,
                        label: {
                            text: 'Choice',
                            position: 'outer-center'
                            // inner-right : default
                            // inner-center
                            // inner-left
                            // outer-right
                            // outer-center
                            // outer-left
                        }
                    },
                    y: {
                        // max: 50,
                        // min: 0,
                        label: {
                            text: 'number',
                            position: 'outer-middle'
                            // inner-top : default
                            // inner-middle
                            // inner-bottom
                            // outer-top
                            // outer-middle
                            // outer-bottom
                        }
                    },

                }

            });

        });


    };
});
