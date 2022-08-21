var app = angular.module("myApp", ["ngMaterial"]);
app.controller("addon_dashboardController", function ($scope, $location, $http, $timeout, $mdSidenav, $window, $q, $interval, $filter, globalSetting) {
  var vm = this;
  // $scope.token = $location.search()["token"];
  // $scope.orguid = $location.search()["orguid"];
  // console.log($scope.orguid);

  // $location.url($location.path());
  var today = new Date();
  $scope.dtp1 = {
    value: new Date(today.getFullYear(), today.getMonth(), 1)
    // value: new Date()
  };
  $scope.dtp2 = {
    value: new Date()
  };
  // $scope.fromdate = moment($scope.dtp1.value).startOf('day').toISOString();
  // $scope.todate = moment($scope.dtp2.value).endOf('day').toISOString();
  var tick = function () {
    $scope.clock = new Date();
    $scope.mlabel = moment(new Date()).format("MMMM YYYY");
    $scope.datetime = moment(new Date()).format("DD/MM/YYYY  -  HH:mm");
  };
  tick();
  $interval(tick, 1000);



  $scope.action = action;
  $scope.callapi = callapi;
  $scope.closebox3 = closebox3;
  // $scope.chartadmitdc = chartadmitdc;
  // $scope.graph1 = graph1;
  // $scope.renderTable = renderTable;

  // $scope.downloadTypeChange = downloadTypeChange;
  // $scope.downloadFile = downloadFile;
  // $scope.printFile = printFile;
  // $scope.selectedColumnChange = selectedColumnChange;
  // $scope.selectedAllColumn = selectedAllColumn;
  // $scope.initColumns = initColumns;
  // $scope.JSONToCSVConvertor = JSONToCSVConvertor;
  // vm.showresult = false;
  // $scope.findorgname = findorgname;
  // $scope.toggleLeft = buildToggler("left");
  // $scope.toggleRight = buildToggler("right");
  // $scope.hidepage = true;
  
  closebox3();

  getOrguid();
  // resetvm();
  function getOrguid() {
    $http.get('/org-config').then(function (success) {
      var orgSite = success.data.org
      $scope.orguid = globalSetting.setting.orguid[orgSite];
      // findopd();
      console.log($scope.orguid);
      if ($scope.orguid=="59e865c8ab5f11532bab0537") {
        vm.a1 = 'OPD';
        vm.a2 = 'IPD';

      } else {
    
        // vm.a1 = 'Top10 ICD10/ avg cost';
        // vm.a2 = 'Top10 ICD9/ avg cost';
        // vm.murl1 = "/API_db/findicd10";
        // vm.murl2 = "/API_db/findicd9";
      }
      findorgname();
    })
  }
  function findorgname() {
    $http
      .post("/API/find_site", {
        orguid: $scope.orguid
      })
      .success(function (data) {
        if (data && data.data.length > 0) {
          $scope.site = data.data;
          console.log("$scope.site", $scope.site);
          $scope.sitename = $scope.site[0].name;
        }
      });
  }

  function closebox3() {
    vm.show1 = false;
    vm.show2 = false;
  }

  function action(params, mdate1, mdate2) {
    // var fromdate = moment(mdate1.value).startOf('day').toISOString();
    // var todate = moment(mdate2.value).endOf('day').toISOString();
    if ($scope.orguid=="59e865c8ab5f11532bab0537") {
      switch (params) {
        case 1:
          console.log(1);
          var mparams = {
            fromdate: mdate1,
            todate: mdate2,
            orguid: $scope.orguid,
          };
          closebox3();
          vm.show1 = true;
          callapi("/API/opd", mparams, params);
          break;
        case 2:
          console.log(2);
          var mparams = {
            fromdate: mdate1,
            todate: mdate2,
            orguid: $scope.orguid,
          };
          closebox3();
          vm.show1 = true;
          callapi("/API/ipd", mparams, params);
          break;
        case 3:
          console.log(3);
          break;
  
  
        default:
          break;
      }
    } else {
  

    }

  }

 
  function callapi(mapi,params, cho) {
    console.log(params);
    $scope.data = {};
    $http({
      method: "POST",
      url: mapi,
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify(
        params
      )
    }).success(function (data) {
      console.log(data);
      if (data && data.results.length > 0) {
        $scope.data = data.results;
        graph1($scope.data);
        vm.results = $scope.data;
        console.log('vm.results', vm.results);
        // vm.date_title = "";
        if (vm.results && vm.results.length > 0) {
          vm.showresult = true;
          initColumns();
          renderTable();
        } else {
          vm.showresult = false;
        }
      } else {
        $scope.data = {};
      }
      // switch (cho) {
      //   case 1:
      //     graph1($scope.data);
      //     vm.results = $scope.data;
      //     console.log('vm.results', vm.results);
      //     // vm.date_title = "";
      //     if (vm.results && vm.results.length > 0) {
      //       vm.showresult = true;
      //       initColumns();
      //       renderTable();
      //     } else {
      //       vm.showresult = false;
      //     }
      //     break;
      //   case 2:
      //     graph1($scope.data);
      //     vm.results = $scope.data;
      //     console.log('vm.results', vm.results);
      //     // vm.date_title = "";
      //     if (vm.results && vm.results.length > 0) {
      //       vm.showresult = true;
      //       initColumns();
      //       renderTable();
      //     } else {
      //       vm.showresult = false;
      //     }

      //     break;

      //   default:
      //     break;
      // }
      console.log($scope.data);
    });
  }
  function graph2(result) {
    var categories = [];
    console.log('resultgr', result);
    for (var j = 0; j < result.length; j++) {
      categories.push({

        icd: result[j].icd,
        count: parseFloat(result[j].count)
        // department: result[j]._id.department
        // planneddischargedate: moment(result[j].planneddischargedate).format('DD/MM/YYYY')
      });
    }
    console.log(categories);
    var chart = c3.generate({
      bindto: "#left2",
      size: {
        height: 350,
        width: 450
      },
      // padding: {
      //   top: 10,
      //   right: 80,
      //   bottom: 10,
      //   left: 50
      // },
      data: {
        json: categories,

        keys: {
          value: ["count"]
        },
        labels: true,
        types: {
          // icd10: "area-spline",
          count: "bar"
        }
        // fillColor: gradient
      },

      color: {
        pattern: ["#2ca9ba", "url(#gradient)", "#B73540", "#B73540"]
      },
      title: {
        text: ""
      },
      legend: {
        show: false
      },

      axis: {
        // rotated: true,
        x: {
          type: "category",
          position: "inner-center",
          json: categories,
          // categories: ['icd'],
          categories: categories.map(function (cat) {
            return (cat.icd).substring(0, 20);
          }),
          // show:false
          // tick: {
          // format: function (x) { return x.getFullYear(); }
          //   format: '%D' // format string is also available for category data
          // }
          tick: {
            rotate: 75,
            multiline: false
          }
        },
        // y: {
        //   max: 100
        // ,tick : {
        //     values : [0,1,2,3,4,5,6,7,8,9,10]
        // }
        // },
      },
      oninit: function () {
        d3.select("svg defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 0)
          .attr("y2", 1)
          .html(
            '<stop offset="0%" stop-color="blue" /><stop offset="100%" stop-color="cyan"/>'
          );
      }
    });
  }
  function graph1(result) {
    var categories = [];
    console.log('resultgr', result);
    for (var j = 0; j < result.length; j++) {
      categories.push({
        // cdate: moment(result[j].createdat).format("DD/MM/YYYY"),
        date: result[j].date,
        count: parseFloat(result[j].count)
      });
    }
    console.log(categories);
    var chart = c3.generate({
      bindto: "#left2",
      size: {
        height: 350,
        width: 450
      },
      // padding: {
      //   top: 10,
      //   right: 80,
      //   bottom: 10,
      //   left: 50
      // },
      data: {
        json: categories,

        keys: {
          value: ["count"]
        },
        labels: true,
        types: {
          // icd10: "area-spline",
          count: "bar"
        }
        // fillColor: gradient
      },

      color: {
        pattern: ["#2ca9ba", "url(#gradient)", "#B73540", "#B73540"]
      },
      title: {
        text: ""
      },
      legend: {
        show: false
      },

      axis: {
        // rotated: true,
        x: {
          type: "category",
          position: "inner-center",
          json: categories,
          // categories: ['icd'],
          categories: categories.map(function (cat) {
            return cat.date;
          }),
          // show:false
          // tick: {
          // format: function (x) { return x.getFullYear(); }
          //   format: '%D' // format string is also available for category data
          // }
          tick: {
            rotate: 75,
            multiline: false
          }
        },
        // y: {
        //   max: 100
        // ,tick : {
        //     values : [0,1,2,3,4,5,6,7,8,9,10]
        // }
        // },
      },
      oninit: function () {
        d3.select("svg defs")
          .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 0)
          .attr("y2", 1)
          .html(
            '<stop offset="0%" stop-color="blue" /><stop offset="100%" stop-color="cyan"/>'
          );
      }
    });
  }
  function renderTable() {
    var tableSetting = {
      height: '100%',
      data: vm.results.map((result) => {
        var selectResult = {};
        vm.selectedColumns.filter((selectedColumn) => selectedColumn != "-").forEach((key) => {
          selectResult[key] = result[key];
        });
        return selectResult;
      }),
      columns: vm.selectedColumns.filter((selectedColumn) => selectedColumn != "-").map((columnName) => {
        var columnConfig = {
          title: columnName,
          field: columnName,
        };

        // if (vm.sumCols && vm.sumCols.map(field => field.toLowerCase()).includes(columnName.toLowerCase())) {
        //   columnConfig['bottomCalc'] = function (values, data, calcParams) {
        //     return values.reduce((prev, current) => prev + current, 0).toFixed(2);
        //   }
        //   columnConfig['bottomCalcFormatter'] = 'money'
        // }

        return columnConfig;
      }),
      layout: "fitColumns",
      // layout: "fitDataFill",
      responsiveLayout: "collapse",
      printAsHtml: true,
      tooltips: true,
      printHeader: `<div style="margin-bottom: 10px;"><b>test<div>`
    };

    vm.table = new Tabulator("#example-table", tableSetting);

  }
  function initColumns() {
    vm.resultColumns = _.chain(vm.results)
      .map((result) => Object.keys(result))
      .flatten()
      .uniq()
      .value();
    vm.selectedColumns = ["-"].concat(vm.resultColumns);
  }
  function selectedAllColumn() {
    if (vm.selectedColumns.indexOf('-') != -1) {
      vm.selectedColumns = ["-"];
    } else {
      vm.initColumns();
      vm.selectedColumns.shift();
    }
  }
  function selectedColumnChange() {
    var selectedAllIndex = vm.selectedColumns.indexOf('-');
    if (selectedAllIndex != -1 && (vm.selectedColumns.length - 1) != vm.resultColumns.length) {
      vm.selectedColumns.splice(selectedAllIndex, 1);
    } else if (vm.selectedColumns.length === vm.resultColumns.length) {
      vm.selectedColumns.unshift("-");
    }
    renderTable();
  }
  function downloadTypeChange(fileType) {
    localStorage.setItem('DOWNLOAD_TYPE', fileType);
  }
  function downloadFile(fileType) {
    console.log(vm.table);;
    if (fileType === 'pdf') {
      vm.table.download(fileType, vm.headertxt, {
        autoTable: function (doc) {
          var doc = new jsPDF();
          doc.addFont('THSarabunNew', 'bold');
          doc.setFont("THSarabunNew", 'bold');
          doc.setFontSize(16);
          var header = function (data) {
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.setFont("THSarabunNew", 'normal');
            doc.text('', data.settings.margin.left, 50);
          };
          return {
            styles: {
              font: "THSarabunNew",
              fontStyle: "bold",
              fontSize: 16
            },
            headStyles: {
              fillColor: [0, 78, 82]
            },
            didDrawPage: header,
            margin: {
              top: 65
            },
            theme: 'grid'
          }
        }
      });
    } else if (fileType === 'json') {
    } else if (fileType === 'xlsx') {
      vm.table.download(fileType, vm.headertxt + '.' + fileType, {
        sheetName: 'Report',
        documentProcessing: (workbook) => {
          var data = vm.table.getData();
          var ws = XLSX.utils.aoa_to_sheet([
            [vm.headertxt + '  ' + vm.subtitletext],
            [vm.datetitle]
          ]);

          if (data && data.length > 0) {
            var header = Object.keys(data[0]);

            XLSX.utils.sheet_add_json(ws, data, {
              header: header,
              origin: "A3"
            });

            ws['!cols'] = header.map(h => ({
              wch: 20
            }));

            var mergeCell = [XLSX.utils.decode_range('A1:G1'), XLSX.utils.decode_range('A2:G2')];
            ws['!merges'] = mergeCell;
          }
          workbook.Sheets[workbook.SheetNames[0]] = ws;
          return workbook;
        }
      });

    } else if (fileType === 'csv') {
      var JSONData = vm.table.getData();
      // var ReportTitle = vm.headertxt+ '.' + fileType;
      JSONToCSVConvertor(JSONData, '', true);

    } else {
      vm.table.download(fileType, '' + '.' + fileType);
    }
  }
  function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {

    console.log(JSONData);
    console.log(ReportTitle);
    console.log(ShowLabel);
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';
    //Set Report title in first row or line

    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
      var row = "";

      //This loop will extract the label from 1st index of on array
      for (var index in arrData[0]) {

        //Now convert each value to string and comma-seprated
        row += index + ',';
      }

      row = row.slice(0, -1);

      //append Label row with line break
      CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
      var row = "";

      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);

      //add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV == '') {
      alert("Invalid data");
      return;
    }

    //Generate a file name
    // var fileName = "MyReport_";
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g, "_");
    // fileName='kit';
    //Initialize file format you want csv or xls
    var uri = 'data:text/xls;charset=utf-8,' + escape(CSV);
    // downloadFile('1.csv', 'data:text/csv;charset=UTF-8,' + '\uFEFF' + encodeURIComponent(CSV));
    var uri = 'data:text/csv;charset=utf-8,' + '\uFEFF' + encodeURIComponent(CSV);
    // var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    // console.log('vm.table', vm.table);
    // console.log('CSV', CSV);
    // console.log('uri', uri);

    //Download the file as CSV
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", CSV]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = ReportTitle; //Name the file here
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    // CSV.download('csv', `${$rootScope.selectedRoute.title}.csv`);
    // window.open(uri);
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    

    //this trick will generat
  }
  $scope.saveJSON = function () {
    $scope.toJSON = '';
    $scope.toJSON = angular.toJson(vm.results);
    var blob = new Blob([$scope.toJSON], { type:"application/json;charset=utf-8;" });			
    var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href',window.URL.createObjectURL(blob));
                downloadLink.attr('download', 'fileName.json');
    downloadLink[0].click();
};
  function printFile() {
    vm.table.print();
  }
  






});