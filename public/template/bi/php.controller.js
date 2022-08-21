var app = angular.module('myApp', []);
app.controller('myController', function ($scope, $http) {
    $scope.values = {};
    $scope.result = {};


    $scope.testa_form = true;
    // $scope.testb_form = true;
    // $scope.testc_form = true;
    // $scope.testd_form = true;
    // $scope.formToggle = function () {
    //     $('#testa').slideToggle();
    //     $('#testb').css('display', 'none');
    //     $('#testc').css('display', 'none');
    //     $('#testd').css('display', 'none');
    //     var chart = c3.generate({
    //         bindto: '#chart1',
    //         data: {
    //             json: $scope.locations,

    //             type: 'bar',

    //             colors: {
    //                 data1: '#ff0000',
    //                 data2: '#00ff00',
    //                 data3: '#0000ff'
    //             },
    //             color: function (color, d) {
    //                 // d will be 'id' when called for legends
    //                 return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
    //             }
    //         }
    //     });
    // };
    // $scope.formToggle2 = function () {
    //     $('#testb').slideToggle();
    //     $('#testa').css('display', 'none');
    //     $('#testc').css('display', 'none');
    //     $('#testd').css('display', 'none');
    // };
    // $scope.formToggle3 = function () {
    //     $('#testc').slideToggle();
    //     $('#testa').css('display', 'none');
    //     $('#testb').css('display', 'none');
    //     $('#testd').css('display', 'none');

    // };

    function show1() {
        var promise = new Promise(function (resolve, reject) {
            $http.get('server/php/page1.php').success(function (data, status, headers, config) {
                $scope.values = data;
                var result = {};
                result.location = [];
                result.pt = [];
                data.forEach(function (element) {
                    result.location.push(element.location);
                    result.pt.push(element.pt);
                }, this);
                resolve(result);


            }).error(function (data, status, headers, config) {
                reject('Error while searching');
                alert('Error while searching');
            });
        });

        return promise;
    };

    function show2() {
        var promise = new Promise(function (resolve, reject) {
            $http.get('server/php/page2.php').success(function (data, status, headers, config) {
                $scope.values = data;
                var result = {};
                result.location = [];
                result.pt = [];
                data.forEach(function (element) {
                    result.location.push(element.location);
                    result.pt.push(element.pt);
                }, this);
                resolve(result);


            }).error(function (data, status, headers, config) {
                reject('Error while searching');
                alert('Error while searching');
            });
        });

        return promise;
    };


    $scope.formToggle = function () {

        show1().then(function (result) {
            //  console.log(result);
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

                    pattern: ['#363FBC', '#363FBC', '#B73540', '#B73540']
                },
                title: {
                    text: 'OPD'
                },
                legend: {
                    show: false
                },

                axis: {
                    x: {
                        type: 'category',
                        position: 'inner-center',
                        categories: result.location
                    }
                }

            }); //  var chart = c3.generate({


        }); // show1().then(function (result) {

        show2().then(function (result) {
            var chart = c3.generate({
                bindto: '#chart2',
                // size: {
                //     height: 240,
                //     width: 480
                // },

                data: {
                    json: result,
                    labels: true,
                    type: 'bar',
                    // colors: {
                    //     location: '#FF62B0'
                    // },
                },
                color: {
                    pattern: ['#809DCC', '#F78768', '#FDD271', '#0DD89D', '#5098EE', '#809DCC', '#FCFCFC']
                },

                title: {
                    text: 'IPD'
                },
                legend: {
                    show: false
                },

                axis: {
                    x: {
                        type: 'category',
                        categories: result.location
                    }
                }

            });

        });

        $('#testa').slideToggle();
        // $('#testa').css('display', 'none');
        // $('#testb').css('display', 'none');
        // $('#testc').css('display', 'none');

    };

})




