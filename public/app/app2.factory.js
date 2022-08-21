(function () {
    'use strict';

    var app = angular.module('myApp');

    app.factory('httpRequestInterceptor', function ($rootScope, $q) {
        return {
            request: function (actualConfig) {
                var config = angular.copy(actualConfig);
                // if (!!config && !!config.data && !!config.data['name'])
                //     config.data['name'] = escapeSpecialCharacters(config.data['name']);
                // if (!!config && !!config.data && !!config.data['code'])
                //     config.data['code'] = escapeSpecialCharacters(config.data['code']);
                config.headers['incus-token'] = $rootScope.UserContext.SessionToken;
                config.headers['useruid'] = $rootScope.UserContext.UserUID;
                //config.headers['username'] = $rootScope.UserContext.UserName;
                config.headers['roleuid'] = $rootScope.UserContext.RoleUID;
                config.headers['hasanonymouspermission'] = $rootScope.UserContext.HasAnonymousPermission;
                config.headers['orguid'] = $rootScope.UserContext.OrgUID;
                config.headers['parentorguid'] = $rootScope.UserContext.ParentOrgUID;
                config.headers['utcoffset'] = $rootScope.UserContext.UTCOffset;
                config.headers['departmentuid'] = $rootScope.UserContext.DepartmentUID;
                return config;
            },
            responseError: function (response) {
                //Server Unreachable. Please check your network
                if (response && response.status === -1) {
                    response.data = {
                        error: "Server Unreachable. Please check your network"
                    };
                }
                return $q.reject(response);
            }
        };

        // function escapeSpecialCharacters(value) {
        //     var result = value.replace(/([!@#$%^&*()+=\[\]\\';,./{}|":<>?~_-])/g, "\\$1");
        //     return result;
        // }
    });

    app.factory('framework', function ( $http,   $mdDialog) {
        var obj = {};

        var isDisplayingFixedLoader = false;
        obj.displayAlert = function (title, message) {
            return $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title($translate.instant(title))
                    .textContent($translate.instant(message))
                    .ariaLabel(message)
                    .ok($translate.instant('COMMON.OK'))
                    .targetEvent(null)
            );
        };   
        obj.mergeDateTime = function (dateobj, timeobj) {
            if (!dateobj) {
                return null;
            }
            var newobject = new Date(dateobj);
            if (!timeobj) {
                newobject.setSeconds(0, 0);
                return newobject;
            }
            newobject.setHours(timeobj.getHours(), timeobj.getMinutes(), timeobj.getSeconds(), timeobj.getMilliseconds());
            return newobject
        };
        obj.flatJsonDifference = function (oldJson, newJson) {
            var newObj = obj.flattenJson(newJson);
            var oldObj = obj.flattenJson(oldJson);
            var diff = obj.jsonDifference(newObj, oldObj);
            var diff1 = obj.jsonDifference(oldObj, newObj);

            for (var i in diff1) {
                if (i && !diff[i]) {
                    diff[i] = { 'old': diff1[i].new, 'new': diff1[i].old };
                }
            }

            return diff && !angular.equals(diff, {}) ? diff : null;
        }
        obj.getCurrentVisitCP = function (patientVisit, callback) {
            var returnCP = null;
            if (patientVisit != null && patientVisit.visitcareproviders != null && patientVisit.visitcareproviders.length > 0) {
                returnCP = returnVisitCP(patientVisit);
                if (!!callback) {
                    callback(returnCP);
                    return;
                }
                return returnCP;
            } else if (!!patientVisit) {
                //get current visit careprovider from DB
                var patientvisituid = null;
                if (!!patientVisit) {
                    if (!!patientVisit._id)
                        patientvisituid = patientVisit._id;
                    patientvisituid = patientVisit;
                }
                if (!!patientvisituid) {
                    callback = callback || function () { };
                    $http.get('/mpi/patientvisit/getdetail/' + patientvisituid).
                        then(function successCallback(response) {
                            var data = response.data;
                            //cache the role and the menu
                            var patientvisitFromDb = data.patientvisit;
                            if (!!patientvisitFromDb && !!patientvisitFromDb.visitcareproviders && patientvisitFromDb.visitcareproviders.length > 0) {
                                returnCP = returnVisitCP(patientvisitFromDb);
                            }
                            callback(returnCP);
                            return;
                        }, function errorCallback(errresponse) {
                            callback(returnCP);
                            obj.displaySaveFeedback("ERRORS.INVALIDCP", null, true);
                            return;
                        });
                } else {
                    if (!!callback) {
                        callback(returnCP);
                        return;
                    }
                    return returnCP;
                }
            } else {
                if (!!callback) {
                    callback(returnCP);
                    return;
                }
                return returnCP;
            }
        };


        return obj;
    });

    app.factory('navigationCacheMode', ['$rootScope', '$cacheFactory', function ($rootScope, $cacheFactory) {
        var cache = $cacheFactory('cacheData');
        var service = {
            data: null,
            required: function (obj) {
                this.data ? this.copyTo(obj) : this.put(obj);
            },
            put: function (obj) {
                service.data = obj;
            },
            copyTo: function (toObj) {
                for (var key in service.data) {
                    //copy all the fields
                    if (key.includes('$') == false && typeof (service.data[key]) != 'function') {
                        if (!toObj[key])
                            toObj[key] = angular.copy(service.data[key]);
                        else {
                            toObj[key] = service.data[key];
                        }
                    }
                }
                this.put(toObj);
            },
            restore: function () {
                sessionStorage.restorestate = true;
            },
            saveState: function () {
                cache.put('navigationCache', service.data);
                service.data = null;
            },
            restoreState: function () {
                service.data = cache.get('navigationCache');
            }
        }

        $rootScope.$on("savestate", service.saveState);
        $rootScope.$on("restorestate", service.restoreState);
        return service;
    }]);


    app.factory('Language', function ($translate) {
        //add the languages you support here. ar stands for arabic
        var rtlLanguages = ['ar'];

        var isRtl = function () {
            var languageKey = $translate.proposedLanguage() || $translate.use();
            for (var i = 0; i < rtlLanguages.length; i += 1) {
                // You may need to change this logic depending on your supported languages (possible languageKey values)
                // This code will match both "ar", "ar-XXX" locales. It won't match any other languages as we only support en, es, ar.
                if (languageKey.indexOf(rtlLanguages[i]) > -1)
                    return true;
            }
            return false;
        };

        //public api
        return {
            isRtl: isRtl
        };
    });

    app.factory('checklicense', function ($rootScope, $http, $q, $mdToast, $translate, $mdDialog, $state, $stateParams, triBreadcrumbsService, $timeout, $compile, moment, appConstant, appEnums, $filter, framework) {
        var obj = {};
        // obj.bedlimitlicense = function () {
        //     var defer = $q.defer();
        //     var querytype = {};
        //     querytype.entypeuid = "59ef351fd2bbe66c36f99862";//Ref.Value _id ,DomainCode = ENTYPE ,relatedvalue = IPD
        //     $http.post('/inpatient/wardlayout/checkbedavaliable', querytype).
        //         then(function successCallback(response) {
        //             var canadmitactivelicense = true;
        //             var data = response.data;
        //             var checkbed = data.bedlicenseactive;
        //             if (checkbed != true) {
        //                 if (checkbed == 'expire') {
        //                     framework.displayAlert('Bed license expired.Please contact Admin.');
        //                     canadmitactivelicense = false;
        //                     defer.resolve({ canadmitactivelicense: canadmitactivelicense });
        //                 }
        //                 else {
        //                     framework.displayAlert('Bed license limit over exceeded.', 'Bed limit More than equal ' + checkbed + ' Beds.');
        //                     canadmitactivelicense = false;
        //                     defer.resolve({ canadmitactivelicense: canadmitactivelicense });
        //                 }

        //             }
        //             else {
        //                 canadmitactivelicense = true;
        //                 defer.resolve({ canadmitactivelicense: canadmitactivelicense });
        //             }
        //         }, function errorCallback(errresponse) {
        //             var data = errresponse.data;
        //             // vm.error = data.error;
        //             framework.displayAlert('ERRORS.ERROR', data.error);
        //             defer.reject(data);
        //         });
        //     return defer.promise;

        // }

        obj.bedlimitlicenseNew = function () {
            var defer = $q.defer();
            var querytype = {};
            querytype.entypeuid = "59ef351fd2bbe66c36f99862";//Ref.Value _id ,DomainCode = ENTYPE ,relatedvalue = IPD
            $http.post('/inpatient/wardlayout/checkbedavaliable', querytype).
                then(function successCallback(response) {
                    var data = response.data;
                    var checkbed = data.bedlicenseactive;
                    if (checkbed && checkbed.canadmitactivelicense != true) {
                        if (checkbed && checkbed.isexpire == true) {
                            var data = {};
                            data.canadmitactivelicense = false;
                            data.bed = checkbed.bed
                            data.expiredate = checkbed.expiredate;
                            data.isexpire = true;

                            framework.displayAlert('Bed license expired.Please contact Admin.');
                            defer.resolve({ canadmitactivelicense: data.canadmitactivelicense });
                        }
                        else {
                            var data = {};
                            data.canadmitactivelicense = false;
                            data.bed = checkbed.bed
                            data.expiredate = checkbed.expiredate;
                            data.isexpire = false;

                            framework.displayAlert('Bed license limit over exceeded.', 'Bed limit More than equal ' + checkbed.bed + ' Beds.');
                            defer.resolve({ canadmitactivelicense: data.canadmitactivelicense });
                        }

                    }
                    else {
                        var data = {};
                        data.canadmitactivelicense = true;
                        data.bed = checkbed.bed
                        data.expiredate = checkbed.expiredate;
                        data.isexpire = false;
                        defer.resolve({ canadmitactivelicense: data.canadmitactivelicense });
                    }



                }, function errorCallback(errresponse) {
                    var data = errresponse.data;
                    // vm.error = data.error;
                    framework.displayAlert('ERRORS.ERROR', data.error);
                    defer.reject(data);
                });
            return defer.promise;

        }

        obj.bedlimitlicenseinabout = function () {
            var defer = $q.defer();
            var querytype = {};
            querytype.entypeuid = "59ef351fd2bbe66c36f99862";//Ref.Value _id ,DomainCode = ENTYPE ,relatedvalue = IPD
            $http.post('/inpatient/wardlayout/checkbedavaliable', querytype).
                then(function successCallback(response) {
                    var data = response.data;
                    var checkbed = data.bedlicenseactive;
                    if (checkbed && checkbed.canadmitactivelicense != true) {
                        if (checkbed && checkbed.isexpire == true) {
                            var data = {};
                            data.canadmitactivelicense = false;
                            data.startdate = checkbed.startdate;
                            data.bed = checkbed.bed
                            data.expiredate = checkbed.expiredate;
                            data.isexpire = true;
                            defer.resolve({ canadmitactivelicense: data });
                        }
                        else {
                            var data = {};
                            data.canadmitactivelicense = false;
                            data.startdate = checkbed.startdate;
                            data.bed = checkbed.bed
                            data.expiredate = checkbed.expiredate;
                            data.isexpire = false;
                            defer.resolve({ canadmitactivelicense: data });
                        }

                    }
                    else {
                        var data = {};
                        data.canadmitactivelicense = true;
                        data.startdate = checkbed.startdate;
                        data.bed = checkbed.bed
                        data.expiredate = checkbed.expiredate;
                        data.isexpire = false;
                        defer.resolve({ canadmitactivelicense: data });
                    }
                }, function errorCallback(errresponse) {
                    var data = errresponse.data;
                    // vm.error = data.error;
                    framework.displayAlert('ERRORS.ERROR', data.error);
                    defer.reject(data);
                });
            return defer.promise;

        }

        obj.licenceexpire = function () {
            var defer = $q.defer();
            var querydata = {};
            $http.post('/framework/security/checklicenseexpire').
                then(function successCallback(response) {
                    var activelicense = true;
                    var data = response.data;

                    var checkactive = data.licenseactive;
                    if (checkactive != true) {
                        framework.displayAlert('License expired.Please contact Admin.');
                        activelicense = false;
                        defer.resolve({ activelicensestatus: activelicense });
                    }
                    else {
                        activelicense = true;
                        defer.resolve({ activelicensestatus: activelicense });
                    }
                }, function errorCallback(errresponse) {
                    var data = errresponse.data;
                    // vm.error = data.error;
                    framework.displayAlert('ERRORS.ERROR', data.error);
                    defer.reject(data);
                });
            return defer.promise;

        }

        return obj;
    });

    // if includes not supported
    if (!String.prototype.includes) {
        String.prototype.includes = function (search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
})();