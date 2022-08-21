
var app = angular.module('myApp', ['ngMaterial', 'angular.filter']);
app.controller('emrController', function ($scope, $location, $http, $timeout, $mdSidenav, $window, $q, $filter, $sce) {

    // var app = angular.module('myApp', ['ngMaterial']);
    // app.controller('indexController', function ($scope, $http, $timeout, $location) {
    var today = new Date();
    $scope.dtp = {
        // value: new Date(today.getFullYear(), today.getMonth(), 1)
        value: today
    };
    $scope.dtp2 = {
        value: today
    };
    $scope.todaydate = new Date();
    function clearall() {
        $scope.right = false;
        $scope.left = false;
    }
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        };
    }
    setTimeout(function () {
        $scope.toggleLeft();
    }, 1000);
    function refreshmenu() {
        clearall();
        $scope.toggleLeft();
    }
    function cleartext() {

        document.getElementById('HN1').value = "";
        document.getElementById('HN1').focus();
        $scope.HN = '';
    }
    init();
    function init() {
        $scope.imagepath = '';
        $scope.dermos = {};
        $scope.datas = {};
        $scope.datalabs = {};
        $scope.datapicts = {};
        $scope.labs = {};
        $scope.meds = {};
        $scope.Fullname = '';
        $scope.imagepath = '';
        $scope.PN = '';
        // $scope.HN = '1140495';
        // $scope.HN = '';
        $scope.ID = ''
        $scope.date = '';
        $scope.medslength = 0;
        // var url = $location.path();
        // var newString = url.replace("/", "");
        // $scope.HN = newString;
        $scope.openlab = openlab;
        $scope.openxray = openxray;
        $scope.selectpict = selectpict;
        $scope.migrate = migrate;
        $scope.dermo = dermo;
        $scope.select_by_episode = select_by_episode;
        $scope.buildToggler = buildToggler;
        $scope.apiip = "http://localhost:3000";
        // $scope.apiip="http://10.1.8.108:3000";
        $scope.getAge = getAge;
        $scope.clearall = clearall;
        $scope.emr_med = false;
        $scope.emr_lab = false;
        $scope.printreport = printreport;
        $scope.PrintMe = PrintMe;
        $scope.select_episode = select_episode;
        $scope.refreshmenu = refreshmenu;
        $scope.cleartext = cleartext;
        $scope.selectepisode = selectepisode;
        // $scope.note = note;


    }



    // alert("ID  is - " + $location.search()['ward']);
    // $location.search()['ward'];
    // selectder($scope.PatientID);
    // episode();
    // select_episode($scope.HN);

    // selectepisode($scope.HN);
    function select_episode(HN) {
        // HN = transhn(HN);
        // console.log('HN');
        // console.log(HN);
        $scope.toggleLeft();
        $scope.left = true;

        $scope.HN = HN;
        $http.post('/sql/new_episode', {
            // ID: id //'54-17-186545' 
            "HN": HN
        }).success(function (data) {
            if (data) {
                // data = JSON.parse( JSON.stringify( data ) )
                $scope.episode01 = data.result.recordset;
                console.log('$scope.episode01');
                console.log(data.result.recordset);

                async.eachOfSeries($scope.episode01, function (episode, index, callback) {
                    select_episode01(episode.PatientVisitUID).then(function (mEN) {
                        episode.EN = mEN;
                        callback();
                    });
                }, function () {
                    async.eachOfSeries($scope.episode01, function (episode, index, callback) {
                        select_episode02(episode.PatientVisitUID).then(function (mdiag) {
                            episode.Dx = mdiag;
                            callback();
                        });
                    }, function () {
                        async.eachOfSeries($scope.episode01, function (episode, index, callback) {
                            select_episode03(episode.PatientVisitUID).then(function (mdr) {
                                episode.Dr = mdr;
                                callback();
                            });
                        }, function () {
                            console.log('$scope.episode01x');
                            console.log($scope.episode01);

                            dermo($scope.HN);

                        });
                    });
                });



            }
        });
    }
    // function transhn(HN) {
    //     if (HN!='') {
    //         var mtext = (HN).replace(/-/g, "");
    //         var m1 = (mtext).substr(0, 2);
    //         var m2 = (mtext).substr(2, 2);
    //         var m3 = (mtext).substr(4, 5);
    //         HN = m1 + '-' + m2 + '-' + m3;
    //         return HN
    //     } else {

    //     }

    // };
    function select_episode01(VN) {
        var defer = $q.defer();
        $http.post('/sql/new_episode_01', {
            "VN": VN
        }).success(function (data) {
            if (data) {
                var mEN = '';
                for (var i = 0; i < data.result.recordset.length; i++) {
                    mEN = mEN + ' : ' + data.result.recordset[i].EN;
                }
                defer.resolve(mEN);
            } else {
                defer.resolve();
            }
        });
        return defer.promise;
    }

    function select_episode02(VN) {
        var defer = $q.defer();
        $http.post('/sql/new_episode_02', {
            "VN": VN
        }).success(function (data) {
            if (data) {
                var mdiag = '';
                for (var i = 0; i < data.result.recordset.length; i++) {
                    mdiag = mdiag + ' | ' + data.result.recordset[i].ProblemName;
                }
                defer.resolve(mdiag);
            } else {
                defer.resolve();
            }
        });
        return defer.promise;
    }
    function select_episode03(VN) {
        var defer = $q.defer();
        $http.post('/sql/new_episode_03', {
            "VN": VN
        }).success(function (data) {
            if (data) {
                var mdr = '';
                for (var i = 0; i < data.result.recordset.length; i++) {
                    mdr = mdr + ' | ' + data.result.recordset[i].DocName;
                }
                defer.resolve(mdr);
            } else {
                defer.resolve();
            }
        });
        return defer.promise;
    }


    // function episode() {
    //     $scope.episode = true;
    // }

    function getAge(myDate) {
        var currentDate = moment();
        var dateOfBirth = moment(myDate);
        var years = currentDate.diff(dateOfBirth, 'years');
        dateOfBirth.add(years, 'years');
        var months = currentDate.diff(dateOfBirth, 'months');
        dateOfBirth.add(months, 'months');
        var days = currentDate.diff(dateOfBirth, 'days');
        var mage = years + ' Y/' + months + ' M/' + days + 'D';
        return mage;
    }

    function migrate() {
        $http.post('/emr/save_emr', {
            date: $scope.Edate,
            HN: $scope.HN,
            EN: $scope.EN,
            VisitUID: $scope.VisitUID,
            PTUID: $scope.PTUID,
            cc: $scope.cc,
            allergy: $scope.allergy,
            diag: $scope.diag,
            labname: $scope.labname,
            xrayname: $scope.xrayname,
            med: $scope.med,

        }).success(function (data) {
            console.log('save data ready');

        });
    }

    function selectepisode(HN) {

        $http.post('/sql/episode', {
            // ID: id //'54-17-186545' 
            "HN": HN
        }).success(function (data) {
            if (data) {
                // data = JSON.parse( JSON.stringify( data ) )
                $scope.en = data.result.recordset;

                console.log('$scope.en');
                console.log(data.result.recordset);
                dermo($scope.HN);
            }
        });
    }
    function dermo(HN) {
        $http.post('/sql/dermo', {
            "HN": HN
        }).success(function (data) {
            if (data) {
                $scope.dermo = data.result.recordset;
                console.log('$scope.dermo');
                console.log(data.result.recordset);
                // $scope.ptname= $scope.dermo[0].fname+' '+ $scope.dermo[0].lname;
                // $scope.dob= $scope.dermo[0].birthday;
                $scope.name = $scope.dermo[0].name;
                $scope.PTUID = $scope.dermo[0].UID;
                $scope.PTVUID = $scope.dermo[0].PatientVisitUID;
                allergy($scope.PTUID);

            }
        });
    }
    function allergy(PTUID) {
        $http.post('/sql/allergy', {
            "PTUID": PTUID
        }).success(function (data) {
            if (data) {
                $scope.allergy = data.result.recordset;
                console.log('$scope.allergy');
                console.log(data.result.recordset);
                // medhx($scope.PTUID);
            }
        });
    }
    // function note(HN) {
    //     $http.post('/sql/note', {
    //         "HN": HN
    //     }).success(function (data) {
    //         if (data) {
    //             $scope.note = data.result.recordset;
    //             console.log('$scope.note');
    //             console.log(data.result.recordset);
    //             // medhx($scope.PTUID);
    //         }
    //     });
    // }

    function select_by_episode(VN, EN, Edate) {
        $scope.EN = EN;
        $scope.VisitUID = VN;
        $scope.Edate = Edate;
        $scope.cc = '';
        $scope.diag = '';
        $scope.labname = '';
        $scope.med = '';
        $scope.lab = '';
        $scope.medhx = '';
        $scope.PE = '';
        $scope.xrayname = '';
        $scope.xray = '';
        $scope.right = true;
        async.waterfall([
            function getnote(callback) {
                $http.post('/sql/note', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.note = data.result.recordset;
                        // var file = new Blob([$scope.note[0].TemplateXML], {
                        //     type: "application/rtf"
                        //   });
                        //   // file object reference
                        //   var download = URL.createObjectURL(file);
                          
                        //   var a = document.createElement("a");
                        //   a.href = download;
                        //   a.download = "file-" + new Date().getTime();
                        //   document.body.appendChild(a);
                        //   a.click()
                        if ($scope.note && $scope.note.length > 0) {
                            $scope.note.map((note) => {
                                if (note.TemplateXML) {
                                    note.TemplateXML = $sce.trustAsHtml(note.TemplateXML);
                                }
                                return note;
                            })
                        }
                        console.log('$scope.note');
                        console.log(data.result.recordset);
                        // medhx($scope.PTUID);
                    }
                    callback();
                });
            },
            function getCC(callback) {
                $http.post('/sql/cc', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.cc = data.result.recordset;
                        console.log('$scope.cc');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getmedhx(callback) {
                $http.post('/sql/medhx', {
                    "HN": $scope.HN
                }).success(function (data) {
                    if (data) {
                        $scope.medhx = data.result.recordset;
                        console.log('$scope.medhx');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getDiag(callback) {
                $http.post('/sql/diag', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.diag = data.result.recordset;
                        console.log('$scope.diag');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getprocedure(callback) {
                $http.post('/sql/procedure', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.procedure = data.result.recordset;
                        console.log('$scope.procedure');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getLabname(callback) {
                $http.post('/sql/labname', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.labname = data.result.recordset;
                        console.log('$scope.labname');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getXrayname(callback) {
                $http.post('/sql/xrayname', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.xrayname = data.result.recordset;
                        console.log('$scope.xrayname');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getScandoc(callback) {
                $http.post('/sql/scandoc', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.scandoc = data.result.recordset;
                        console.log('$scope.scandoc');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getMed(callback) {
                $http.post('/sql/med', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.med = data.result.recordset;
                        console.log('$scope.med');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
            function getPE(callback) {
                $http.post('/sql/PE', {
                    "VN": VN
                }).success(function (data) {
                    if (data) {
                        $scope.PE = data.result.recordset;
                        console.log('$scope.PE');
                        console.log(data.result.recordset);
                    }
                    callback();
                });
            },
        ], function () {

        })
    }

    function convertToPlain(rtf) {
        rtf = rtf.replace(/\\par[d]?/g, "");
        return rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
    }

    function openlab(VN, NO) {
        $http.post('/sql/lab', {
            "VN": VN,
            "NO": NO
        }).success(function (data) {
            if (data) {
                $scope.lab = data.result.recordset;
                console.log('$scope.lab');
                console.log(data.result.recordset);
            }
        });
    }

    function openxray(VN, resultNO) {
        $http.post('/sql/xray', {
            "VN": VN,
            "resultNO": resultNO
        }).success(function (data) {
            if (data) {
                $scope.xray = data.result.recordset;
                if ($scope.xray && $scope.xray.length > 0) {
                    $scope.xray.map(function (xrayitem) {
                        if (xrayitem.Report) xrayitem.Report = convertToPlain(xrayitem.Report);
                        return xrayitem;
                    });
                }
                console.log('$scope.xray');
                console.log(data.result.recordset);
            }
        });
    }

    function convertToPlain(rtf) {
        rtf = rtf.replace(/\\par[d]?/g, "");
        return rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
    }


    function selectpict(ID) {
        var splits = ID.split("\\");
        $scope.imagepath = "/image/" + splits[splits.length - 1];
        // $scope.imagepath = "../Docimage/image/" + splits[splits.length - 1];

        //$scope.imagepath ="http://localhost:82/"+splits[splits.length-1];
        // $scope.datapicts={};

        // $http.post('selectpict.php', {
        //     "ID": ID
        // }).success(function (data) {
        //     if (data) {
        //         $scope.datapicts = data;
        //     }
        // });

    }

    function printreport() {
        PrintMe();
    }
    function PrintMe() {
        var disp_setting = "toolbar=yes,location=no,";
        disp_setting += "directories=yes,menubar=yes,";
        disp_setting += "scrollbars=yes,width=650, height=600, left=100, top=25";
        var content_vlue = document.getElementById('printableArea').innerHTML;
        var docprint = window.open("", "", disp_setting);
        docprint.document.open();
        docprint.document.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"');
        docprint.document.write('"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">');
        docprint.document.write('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">');
        docprint.document.write('<head><title>My Title</title>');
        docprint.document.write('<style type="text/css">body{ _margin:0px;');
        docprint.document.write('font-family:verdana,Arial;color:#000;');
        docprint.document.write('font-family:Verdana, Geneva, sans-serif; font-size:12px;}');
        docprint.document.write('a{color:#000;text-decoration:none;} </style>');
        docprint.document.write('</head><body onLoad="self.print()"><center>');
        docprint.document.write(content_vlue);
        docprint.document.write('</center></body></html>');
        docprint.document.close();
        docprint.focus();
    }

})

