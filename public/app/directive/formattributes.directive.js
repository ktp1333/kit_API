(function() {
    'use strict';

    var app = angular.module('myApp');

    app.directive('formAttributes', function($timeout, $mdDialog, $q, $http, $compile, $filter, $rootScope, framework, formFactory) {
        var FormAttributeController = function($scope) {
            $scope.runSripts = runSripts;
            $scope.setFieldValues = setFieldValues;
            $scope.getRefDescFromValue = getRefDescFromValue;
            $scope.selectImage = selectImage;
            $scope.deleteImage = deleteImage;
            $scope.queryDatasets = queryDatasets;
            $scope.doPopupAnnont = doPopupAnnont;
            $scope.deleteCurrentAttribute = deleteCurrentAttribute;
            $scope.duplicateCurrentAttribute = duplicateCurrentAttribute;
            $scope.imageNewWindow = imageNewWindow;
            this.setFieldProperties = setFieldProperties;
           // $scope.showAlert = showAlert;
            $scope.page = 1;
            $scope.pages = 1;
            $scope.attrvalues = {};
            var attrClass = [];
            setFieldProperties();

            function imageNewWindow(data) {
                var image = new Image();
                image.src = data;
                var w = window.open("");
                w.document.write(image.outerHTML);
            }

            function runSripts(fieldAttribute) {
                if (!$scope.fieldAttribute.scripts || !$scope.formScriptsAsString) {
                    return;
                }

                var scripts = $scope.formScriptsAsString.replace('#$scripts$#', $scope.fieldAttribute.scripts);

                try {
                    eval(scripts);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        console.error(e);
                    } else {
                        console.error(e);
                    }
                }
            }

            function setFieldValues(tempAttribute, attribute) {
                var attributetype = attribute.attributetype;
                if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON') {
                    var matched = attribute.refdomainuid.values.filter(function(item) {
                        return (item.valuedescription === tempAttribute.value);
                    })[0];

                    if (matched) {
                        attribute.value = matched._id;
                    }

                } else if (attributetype == 'CHECKBOX') {
                    attribute.value = [];
                    if (tempAttribute.value == null || !tempAttribute.value.length) {
                        for (var i in attribute.refdomainuid.values) {
                            attribute.refdomainuid.values[i].ischecked = false;
                        }
                    }

                    attribute.value = [];
                    for (var i in attribute.refdomainuid.values) {
                        var matched = tempAttribute.value.filter(function(item) {
                            return (item === attribute.refdomainuid.values[i].valuedescription);
                        })[0];

                        if (matched) {
                            attribute.refdomainuid.values[i].ischecked = true;
                        } else {
                            attribute.refdomainuid.values[i].ischecked = false;
                        }
                    }
                } else if (attributetype == 'CHECKLISTTEXT') {
                    attribute.value = [];
                    if (tempAttribute.value == null || !tempAttribute.value.length) {
                        for (var i in attribute.refdomainuid.values) {
                            attribute.refdomainuid.values[i].ischecked = false;
                        }
                    }

                    for (var i in attribute.refdomainuid.values) {
                        var matched = tempAttribute.value.filter(function(item) {
                            return (item.referencevalue === attribute.refdomainuid.values[i].valuedescription);
                        })[0];

                        if (matched) {
                            attribute.refdomainuid.values[i].ischecked = true;
                            attribute.refdomainuid.values[i].additionalvalue = matched.additionalvalue;
                        } else {
                            attribute.refdomainuid.values[i].ischecked = false;
                        }
                    }
                } else if (attributetype == 'DATEFIELD' || attributetype == 'TIMEFIELD') {
                    if (tempAttribute.value) {
                        attribute.value = new Date(tempAttribute.value);
                        attribute.value.setSeconds(0, 0);
                    } else
                        attribute.value = null;
                } else if (attributetype == 'DATETIMEFIELD') {
                    if (tempAttribute.value) {
                        attribute.value = new Date(tempAttribute.value);
                        attribute.additionalvalue = new Date(tempAttribute.value);
                        attribute.additionalvalue.setSeconds(0, 0);
                    } else {
                        attribute.value = null;
                        attribute.additionalvalue = null;
                    }
                } else {
                    attribute.value = tempAttribute.value;
                }

                attribute.visibility = tempAttribute.visibility;

            }

            function getRefDescFromValue(attribute) {
                var attributetype = attribute.attributetype;
                if (attributetype == 'DATETIMEFIELD') {
                    return framework.mergeDateTime(attribute.value, attribute.additionalvalue);
                }

                if (!attribute.refdomainuid || !attribute.refdomainuid.values) {
                    if (attributetype == 'CHECKBOX' || attributetype == 'CHECKLISTTEXT') {
                        return [];
                    } else {
                        return '';
                    }
                }

                if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON') {
                    var matched = attribute.refdomainuid.values.filter(function(item) {
                        return (item._id === attribute.value);
                    })[0];

                    if (matched) {
                        return matched.valuedescription;
                    } else {
                        return attribute.value;
                    }
                } else if (attributetype == 'CHECKBOX') {
                    var valueDesc = [];

                    for (var i in attribute.refdomainuid.values) {
                        if (attribute.refdomainuid.values[i].ischecked) {
                            valueDesc.push(attribute.refdomainuid.values[i].valuedescription);
                        }
                    }
                    return valueDesc;
                } else if (attributetype == 'CHECKLISTTEXT') {
                    var valueDesc = [];

                    for (var i in attribute.refdomainuid.values) {
                        if (attribute.refdomainuid.values[i].ischecked) {
                            valueDesc.push({
                                referencevalue: attribute.refdomainuid.values[i].valuedescription,
                                additionalvalue: attribute.refdomainuid.values[i].additionalvalue
                            });
                        }
                    }
                    return valueDesc;
                } else {
                    return attribute.value;
                }
            }


            function setFieldProperties() {
                var attributetype = $scope.fieldAttribute.attributetype;

                if ($scope.fieldAttribute.refdomainuid) {
                    $scope.fieldAttribute.refdomainuid = removeInactiveRefValue($scope.fieldAttribute.refdomainuid);
                    // ordering the reference value if sortbydescription is true
                    // $scope.fieldAttribute.refdomainuid = framework.sortReferenceValues($scope.fieldAttribute.refdomainuid);
                }

                if (attributetype == 'DATEFIELD' || attributetype == 'DATETIMEFIELD' || attributetype == 'SEARCHFIELD') {
                    $scope.fieldAttribute.displaytextView = '';
                    if ($scope.fieldAttribute.showdisplaytextonleftside) {
                        $scope.fieldAttribute.displaytextView = '';
                    } else if ($scope.isPreview && $scope.fieldAttribute.ismandatory) {
                        $scope.fieldAttribute.displaytextView = $scope.fieldAttribute.displaytext + ' *';
                    } else {
                        $scope.fieldAttribute.displaytextView = $scope.fieldAttribute.displaytext;
                    }
                }

                if (attributetype == 'IMAGE' || attributetype == 'IMAGEFILESELECTOR') {
                    if (($scope.fieldAttribute.isannotationsupportneed || $scope.fieldAttribute.enablepopupannotation) && !$scope.fieldAttribute.annotationfontcolor) {
                        $scope.fieldAttribute.annotationfontcolor = 'rgb(255,87,34)';
                    }

                    if ((!$scope.fieldAttribute.value || (!$scope.fieldAttribute.isannotationsupportneed && !$scope.fieldAttribute.enablepopupannotation)) && $scope.fieldAttribute.imagemasteruid && $scope.fieldAttribute.imagemasteruid.clinicalimage) {
                        $scope.fieldAttribute.value = $scope.fieldAttribute.imagemasteruid.clinicalimage;
                    }
                }

                // if (!$scope.formtemplate.isForPrint) {
                //     if ($scope.fieldAttribute.patientdataset) {
                //         // $scope.fieldAttribute.readonly = true;
                //         if ($scope.isPreview || $scope.separtePreviewScreen) {
                //             $scope.fieldAttribute.value = $scope.fieldAttribute.patientdataset;
                //         }
                //     } else if ($scope.fieldAttribute.value != null && !$scope.isPreview) {
                //         // field is already having some value
                //         assignValueToAttribute();
                //     } else if (!!$scope.fieldAttribute.defaultvalue) {
                //         // field doesn't have any value but default value
                //         assignDefaultValueToAttribute();
                //     } else {
                //         // field doesnt have both value and default value.
                //         initializeFieldValue();
                //     }
                // }

                if (attributetype == 'DATETIMEFIELD' && $scope.fieldAttribute.additionalvalue) {
                    $scope.fieldAttribute.additionalvalue = new Date($scope.fieldAttribute.additionalvalue);
                    $scope.fieldAttribute.additionalvalue.setSeconds(0, 0);
                }

                // seting width and class for every attribute
                var attrstyle = null;
                if (attributetype == 'PAGEBREAK') {
                    attrClass = ['flex-100', 'page-break-always'];
                } else if ($scope.fieldAttribute.isflexiblewidth) {
                    attrClass = ['flex'];
                } else if ($scope.fieldAttribute.widthpercentage > 0) {
                    if ($scope.formtemplate.formentrytype == 'PRINTABLE') {
                        attrstyle = { 'width': $scope.fieldAttribute.widthpercentage + 'px' };
                    } else if ($scope.formsection.sectiontype === 'DYNAMIC' && $scope.formsection.layouttype === 'ROW') {
                        attrstyle = {
                            "flex": "1 1 " + $scope.fieldAttribute.widthpercentage + "%",
                            "max-width": $scope.fieldAttribute.widthpercentage + "%"
                        };
                    } else if ($scope.formsection.sectiontype === 'DYNAMIC' && $scope.formsection.layouttype === 'COLUMN') {
                        attrstyle = {
                            "min-width": $scope.fieldAttribute.widthpercentage + "%"
                        }
                    } else if ($scope.formsection.sectiontype === 'TABLE') {
                        attrstyle = {
                            "min-width": $scope.fieldAttribute.widthpercentage + "%",
                            "width": $scope.fieldAttribute.widthpercentage + "%"
                        };
                    }
                } else {
                    if (attributetype == 'LINE') {
                        attrClass = ['flex-100'];
                    } else if ($scope.fieldAttribute.layouttype == "ROW") {
                        if (attributetype == 'INPUTFIELD' || attributetype == 'COMBOSELECT' || attributetype == 'NUMBERFIELD') {
                            attrClass = ['flex-sm-50', 'flex-md-33', 'flex-gt-md-25'];
                        } else if (attributetype == 'CHECKLISTTEXT') {
                            attrClass = ['flex-100'];
                        } else if (attributetype == 'TEXTAREA') {
                            attrClass = ['input-normal-width'];
                        }
                    }
                }

                if ($scope.formtemplate.formentrytype == 'PRINTABLE') {
                    if (!attrstyle) attrstyle = {};
                    attrstyle.position = 'absolute';
                    attrstyle['z-index'] = 3;

                    if ($scope.fieldAttribute.topposition)
                        attrstyle.top = $scope.fieldAttribute.topposition + 'px';
                    if ($scope.fieldAttribute.leftposition)
                        attrstyle.left = $scope.fieldAttribute.leftposition + 'px';
                }

                if ($scope.formsection.sectiontype === 'TABLE' && $scope.fieldAttribute.verticalalignment) {
                    if (!attrstyle) attrstyle = {};
                    attrstyle['vertical-align'] = getVerticalalAlign($scope.fieldAttribute.verticalalignment);
                }

                if (attributetype == 'LABEL' && $scope.fieldAttribute.height > 0) {
                    attrstyle['min-height'] = $scope.fieldAttribute.height + 'px';
                }

                $scope.fieldAttribute.style = attrstyle;
                $scope.fieldAttribute.class = attrClass;
                $scope.fieldAttribute.tableCellClass = '';
                if ($scope.formsection.sectiontype === 'TABLE' && $scope.fieldAttribute.horizontalalignment) {
                    $scope.fieldAttribute.tableCellClass = 'layout-row layout-align-' + getHorizontalAlign($scope.fieldAttribute.horizontalalignment) + '-start';
                }

                $timeout(function() {
                    // dont run script on form updation.
                    if (!$scope.formtemplate.templateuid)
                        runSripts();
                }, 100);
            }

            function getHorizontalAlign(horizontalalignment) {
                if (horizontalalignment == 'CENTER')
                    return 'center';
                else if (horizontalalignment == 'RIGHT')
                    return 'end';
                else
                    return 'start';
            }

            function getVerticalalAlign(verticalalignment) {
                if (verticalalignment == 'TOP')
                    return 'top';
                else if (verticalalignment == 'BOTTOM')
                    return 'bottom';
                else
                    return 'middle';
            }

            function assignValueToAttribute() {
                var attributetype = $scope.fieldAttribute.attributetype;
                if (attributetype == 'CHECKBOX') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            var matched = $scope.fieldAttribute.value.find(function(item) {
                                return (item == $scope.fieldAttribute.refdomainuid.values[i]._id);
                            });

                            if (matched != null) {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = true;
                            } else {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                            }
                        }
                    }
                } else if (attributetype == 'CHECKLISTTEXT') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            var matched = $scope.fieldAttribute.value.find(function(item) {
                                return (item.referencevalueid == $scope.fieldAttribute.refdomainuid.values[i]._id);
                            });

                            if (matched != null) {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = true;
                                $scope.fieldAttribute.refdomainuid.values[i].additionalvalue = matched.additionalvalue;
                            } else {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                                $scope.fieldAttribute.refdomainuid.values[i].additionalvalue = '';
                            }
                        }
                    }
                } else if (attributetype == 'DATEFIELD' || attributetype == 'TIMEFIELD') {
                    $scope.fieldAttribute.value = new Date($scope.fieldAttribute.value);
                    $scope.fieldAttribute.value.setSeconds(0, 0);
                } else if (attributetype == 'DATETIMEFIELD') {
                    $scope.fieldAttribute.value = new Date($scope.fieldAttribute.value);
                    if ($scope.fieldAttribute.additionalvalue) {
                        $scope.fieldAttribute.additionalvalue = new Date($scope.fieldAttribute.additionalvalue);
                        $scope.fieldAttribute.additionalvalue.setSeconds(0, 0);
                    }
                } else if (attributetype == 'HORIZONTALSELECT') {
                    var newValue = null;
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i]._id == $scope.fieldAttribute.value) {
                                newValue = $scope.fieldAttribute.refdomainuid.values[i];
                                break;
                            }
                        }
                    }
                    $scope.fieldAttribute.value = newValue;
                } else if (attributetype == 'HORIZONTALMULTISELECT') {
                    var newValue = [];
                    if ($scope.fieldAttribute.value) {
                        for (var i = 0; i < $scope.fieldAttribute.value.length; i++) {
                            var matched = null;
                            if ($scope.fieldAttribute.refdomainuid) {
                                matched = $scope.fieldAttribute.refdomainuid.values.find(function(item) {
                                    return item._id == $scope.fieldAttribute.value[i];
                                });
                            }

                            if (matched)
                                newValue.push(matched);
                        }
                    }
                    $scope.fieldAttribute.value = newValue;
                }
            }

            function assignDefaultValueToAttribute() {
                var attributetype = $scope.fieldAttribute.attributetype;
                $scope.fieldAttribute.value = null;
                if (attributetype == 'INPUTFIELD' || attributetype == 'TEXTAREA' || attributetype == 'NUMBERFIELD') {
                    $scope.fieldAttribute.value = $scope.fieldAttribute.defaultvalue;
                } else if ((attributetype == 'DATEFIELD' || attributetype == 'TIMEFIELD') && $scope.fieldAttribute.defaultvalue === 'CURRENTDATE') {
                    $scope.fieldAttribute.value = new Date();
                    $scope.fieldAttribute.value.setSeconds(0, 0);
                } else if (attributetype == 'DATETIMEFIELD' && $scope.fieldAttribute.defaultvalue === 'CURRENTDATE') {
                    $scope.fieldAttribute.value = new Date();
                    $scope.fieldAttribute.additionalvalue = new Date();
                    $scope.fieldAttribute.additionalvalue.setSeconds(0, 0);
                } else if (attributetype == 'CHECKBOX') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i].valuecode == $scope.fieldAttribute.defaultvalue) {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = true;
                            } else {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                            }
                        }
                    }
                } else if (attributetype == 'CHECKLISTTEXT') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i].valuecode == $scope.fieldAttribute.defaultvalue) {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = true;
                            } else {
                                $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                                $scope.fieldAttribute.refdomainuid.values[i].additionalvalue = '';
                            }
                        }
                    }
                } else if (attributetype == 'RADIOBUTTON' || attributetype == 'COMBOSELECT') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i].valuecode == $scope.fieldAttribute.defaultvalue) {
                                $scope.fieldAttribute.value = $scope.fieldAttribute.refdomainuid.values[i]._id;
                                break;
                            }
                        }
                    }
                } else if (attributetype == 'SWITCH') {
                    if ($scope.fieldAttribute.defaultvalue === "true") {
                        $scope.fieldAttribute.value = true;
                    } else {
                        $scope.fieldAttribute.value = false;
                    }
                } else if (attributetype == 'HORIZONTALSELECT') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i].valuecode == $scope.fieldAttribute.defaultvalue) {
                                $scope.fieldAttribute.value = $scope.fieldAttribute.refdomainuid.values[i];
                                break;
                            }
                        }
                    }
                } else if (attributetype == 'HORIZONTALMULTISELECT') {
                    $scope.fieldAttribute.value = [];
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            if ($scope.fieldAttribute.refdomainuid.values[i].valuecode == $scope.fieldAttribute.defaultvalue) {
                                $scope.fieldAttribute.value.push($scope.fieldAttribute.refdomainuid.values[i]);
                            }
                        }
                    }
                }
            }

            function initializeFieldValue() {
                var attributetype = $scope.fieldAttribute.attributetype;
                if (attributetype == 'DATEFIELD' || attributetype == 'TIMEFIELD' || attributetype == 'HORIZONTALSELECT') {
                    $scope.fieldAttribute.value = null;
                } else if (attributetype == 'DATETIMEFIELD') {
                    $scope.fieldAttribute.value = null;
                    $scope.fieldAttribute.additionalvalue = null;
                } else if (attributetype == 'SWITCH') {
                    $scope.fieldAttribute.value = false;
                } else if (attributetype == 'LABEL' || attributetype == 'HEADING') {
                    $scope.fieldAttribute.value = $scope.fieldAttribute.displaytext;
                } else if (attributetype == 'CHECKBOX') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                        }
                    }
                } else if (attributetype == 'CHECKLISTTEXT') {
                    if ($scope.fieldAttribute.refdomainuid) {
                        for (var i = 0; i < $scope.fieldAttribute.refdomainuid.values.length; i++) {
                            $scope.fieldAttribute.refdomainuid.values[i].ischecked = false;
                            $scope.fieldAttribute.refdomainuid.values[i].additionalvalue = '';
                        }
                    }
                } else if (attributetype == 'HORIZONTALMULTISELECT') {
                    $scope.fieldAttribute.value = [];
                } else if (attributetype != 'IMAGE' && attributetype != 'IMAGEFILESELECTOR') {
                    $scope.fieldAttribute.value = '';
                }
            }

          
            $scope.textLabelsForAnnonation = {
                'Circle': ('COMMON.CIRCLE'),
                'Rectangle': ('COMMON.RECTANGLE'),
                'Arrow': ('COMMON.ARROW'),
                'Text': ('COMMON.TEXT'),
                'Pen': ('COMMON.PEN'),
                'Redo': ('COMMON.REDO'),
                'Undo': ('COMMON.UNDO'),
                'Italic': ('COMMON.ITALIC'),
                'Bold': ('COMMON.BOLD'),
                'FontSize': ('COMMON.FONTSIZE'),
                'ColorPicker': ('COMMON.COLORPICKER'),
                'Save': ('COMMON.SAVE'),
                'Cancel': ('COMMON.CANCEL'),
                'LineWidth': ('COMMON.LINEWIDTH')
            }

            function selectImage(files) {
                if (!files || !files.length) { return; }

                $scope.fieldError = framework.isInvalidateImage(files[0]);
                if ($scope.fieldError) return;

                var canvas = document.getElementById('imageSelectorCanvas');
                framework.imageToBase64(canvas, files[0], function(base64Image) {
                    $scope.fieldAttribute.baseimage = base64Image;
                });
            }

            function deleteImage() {
                if ($scope.isDeleteConfirm === true) {
                    for (var i = 0; i < $scope.formsection.attributes.length; i++) {
                        if ($scope.formsection.attributes[i].name == $scope.fieldAttribute.name) {
                            $scope.fieldAttribute.value = null;
                            $scope.fieldAttribute.datavalue = null;
                            break;
                        }
                    }
                } else {
                    framework.handleConfirmation('CLINICALDATAMASTER.CLEARCONFIRM', function() {
                        for (var i = 0; i < $scope.formsection.attributes.length; i++) {
                            if ($scope.formsection.attributes[i].name == $scope.fieldAttribute.name) {
                                $scope.fieldAttribute.value = null;
                                $scope.fieldAttribute.datavalue = null;
                                break;
                            }
                        }

                    });
                }
            }

            function duplicateCurrentAttribute() {
                if (!$scope.formsection || $scope.formsection.sectiontype !== 'DYNAMIC' || !$scope.formsection.attributes || !$scope.formsection.attributes.length) return;

                var newAttribute = JSON.parse(angular.toJson($scope.fieldAttribute));
                newAttribute._id = undefined;
                newAttribute.name += $scope.formsection.attributes.length;
                newAttribute.attributechanged = !newAttribute.attributechanged;
                newAttribute.isallowmultipleimageselection = false;
                newAttribute.isallowtodelete = true;
                newAttribute.value = '';
                newAttribute.datavalue = '';
                newAttribute.additionalvalue = null;
                $scope.formsection.attributes.push(newAttribute);
            }

            function deleteCurrentAttribute() {
                if (!$scope.formsection || $scope.formsection.sectiontype !== 'DYNAMIC' || !$scope.formsection.attributes || !$scope.formsection.attributes.length) return;

                if ($scope.isDeleteConfirm === true) {
                    for (var i = 0; i < $scope.formsection.attributes.length; i++) {
                        if ($scope.formsection.attributes[i].name == $scope.fieldAttribute.name) {
                            $scope.formsection.attributes.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    framework.handleConfirmation('ERRORS.ERRORCONFIRMATION', function() {
                        for (var i = 0; i < $scope.formsection.attributes.length; i++) {
                            if ($scope.formsection.attributes[i].name == $scope.fieldAttribute.name) {
                                $scope.formsection.attributes.splice(i, 1);
                                break;
                            }
                        }
                    });
                }
            }

            function removeInactiveRefValue(refdomain) {
                if (!refdomain.values || !refdomain.values.length) return refdomain;

                refdomain.values = refdomain.values.filter(function(item) {
                    if (!item.activeto || new Date(item.activeto) >= moment().startOf('day').toDate())
                        return true;
                    if (!$scope.fieldAttribute.value) return false;

                    // if value is present then don't remove it.
                    var attributetype = $scope.fieldAttribute.attributetype;
                    var value = $scope.fieldAttribute.value;
                    if (attributetype == 'CHECKBOX' || attributetype == 'HORIZONTALMULTISELECT') {
                        return (value.length && value.indexOf(item._id) > -1);
                    } else if (attributetype == 'CHECKLISTTEXT') {
                        var matched = value.find(function(valitem) {
                            return (valitem.referencevalueid == item._id);
                        });
                        return !!matched;
                    } else {
                        return value == item._id;
                    }
                });

                return refdomain;
            }

            function queryDatasets(searchText) {
                var defer = $q.defer();
                var query = $scope.fieldAttribute.searchfilter && $.extend(true, {}, $scope.fieldAttribute.searchfilter) || {};
                query.name = searchText;
                query.select = 'name';
                query.limit = 30;
                query.page = 1;
                var searchDataset = formFactory.getPropertiesOfSearchField($scope.fieldAttribute.searchdatasetname);

                if (!searchDataset || !searchDataset.url || !$scope.fieldAttribute.searchdatasetname || !searchDataset.searchresultname) {
                    $timeout(function() {
                        defer.resolve();
                    });
                    return;
                }

                $http.post(searchDataset.url, query).
                then(function successCallback(response) {
                    var data = response.data;
                    if (!data || !data[searchDataset.searchresultname] || !data[searchDataset.searchresultname].length) return defer.resolve([]);

                    var datas = data[searchDataset.searchresultname].map(function(item) {
                        return item.name || '';
                    });
                    defer.resolve(datas);
                }, function errorCallback(errresponse) {
                    var data = errresponse.data;
                    var error = !!data && !!data.error && data.error || "ERRORS.SERVERERROR";
                    defer.reject(error);
                });

                return defer.promise;
            }

            function doPopupAnnont() {
                if (!$scope.fieldAttribute.value) return;

                $mdDialog.show({
                    controller: PopupAnnotationController,
                    parent: angular.element(document.body),
                    locals: {
                        dataFromParentController: {
                            fieldAttribute: $scope.fieldAttribute,
                            textLabelsForAnnonation: $scope.textLabelsForAnnonation
                        }
                    },
                    clickOutsideToClose: false,
                    fullscreen: false,
                    template: '<md-dialog aria-label="Popup Annotation">' +
                        '  <md-dialog-content class="padding-10">' +
                        '     <div>' +
                        '        <md-image-annotation ng-if="::fieldAttribute.value" image-source="fieldAttribute.value" annotated-image="annotatedImage.value" color="fieldAttribute.annotationfontcolor" text-font-family="Roboto, \'Helvetica Neue\', sans-serif" text-labels="textLabelsForAnnonation"></md-image-annotation>' +
                        '     </div>' +
                        '  </md-dialog-content>' +
                        '  <md-dialog-actions layout="row">' +
                        '    <span class="errortext" flex translate>{{}}</span>' +
                        '    <md-button class="md-primary" aria-label="{{\'COMMON.SAVE\' | translate}}" ng-click="saveData()" ng-disabled="prefillForm.$invalid">' +
                        '      <md-icon md-font-icon="fa fa-save"></md-icon>' +
                        '      <span translate>COMMON.SAVE</span>' +
                        '    </md-button>' +
                        '    <md-button aria-label="{{\'COMMON.CANCEL\' | translate}}" ng-click="cancelData()">' +
                        '      <md-icon md-font-icon="fa fa-undo"></md-icon>' +
                        '      <span translate>COMMON.CANCEL</span>' +
                        '    </md-button>' +
                        '  </md-dialog-actions>' +
                        '</md-dialog>'
                }).then(function(annotatedImage) {
                    $scope.fieldAttribute.value = annotatedImage;
                    $scope.fieldAttribute.datavalue = annotatedImage;
                });
            }
        };

        function PopupAnnotationController($scope, dataFromParentController) {
            $scope.saveData = saveData;
            $scope.cancelData = cancelData;
            $scope.fieldAttribute = dataFromParentController.fieldAttribute;
            $scope.textLabelsForAnnonation = dataFromParentController.textLabelsForAnnonation;
            $scope.annotatedImage = { value: null };

            function saveData() {
                $mdDialog.hide($scope.annotatedImage.value);
            }

            function cancelData() {
                $mdDialog.cancel();
            }
        }

        return {
            restrict: 'E',
            scope: {
                fieldAttribute: '=',
                formtemplate: '=',
                formScriptsAsString: '=',
                formsection: '=',
                isPreview: '=',
                readonly: '=',
                separtePreviewScreen: '=',
                isDeleteConfirm: "="
            },
            controller: FormAttributeController,
            link: function($scope, iElement, iAttrs, controller) {
                if ($scope.isPreview) {
                    $scope.$watch('fieldAttribute.attributechanged',
                        function(newValue, oldValue) {
                            if (newValue === oldValue) { return; }

                            controller.setFieldProperties();
                            setAttributeHtml();
                        });
                }

                setAttributeHtml();

                function setAttributeHtml() {
                    iElement.html('');
                    var result = $(getTemplate($scope)).appendTo(iElement);
                    $compile(result)($scope);
                }
            }
        }

        function getTemplate($scope) {
            var readonly = $scope.readonly;
            var isPreview = $scope.isPreview;
            var formsection = $scope.formsection;
            var formtemplate = $scope.formtemplate;
            var fieldAttribute = $scope.fieldAttribute;
            if (!fieldAttribute || !fieldAttribute.attributetype || !formtemplate) return '';

            var attributetype = fieldAttribute.attributetype;
            var eleStyle = formtemplate.formFontSizeStyle ? $.extend(true, {}, formtemplate.formFontSizeStyle) : {};
            var fontStyle = {};
            if (fieldAttribute.textsize)
                formFactory.setFontSizeStyle(fontStyle, fieldAttribute.textsize);
            fontStyle = objToStyle(fontStyle);

            var fontClass = [];
            if (fieldAttribute.textproperties && fieldAttribute.textproperties.length)
                formFactory.addFontStyleClass(fontClass, fieldAttribute.textproperties);
            fontClass = fontClass.join(' ');

            var defaultWidth = null;
            if (fieldAttribute.displaytextwidth)
                defaultWidth = fieldAttribute.displaytextwidth;
            else if ($scope.formsection.defaultdisplaytextwidth)
                defaultWidth = $scope.formsection.defaultdisplaytextwidth;
            var displayTextStyle = 'min-width: ' + (defaultWidth || 200) + 'px;';

            var imageStyle = '';
            if (attributetype == 'IMAGE' || attributetype == 'IMAGEFILESELECTOR') {
                if ($scope.fieldAttribute.widthpercentage)
                    imageStyle += 'width: 100%;';
                if ($scope.fieldAttribute.height)
                    imageStyle += 'height: ' + $scope.fieldAttribute.height + 'px;';
                else if (attributetype == 'IMAGEFILESELECTOR')
                    imageStyle += 'height: auto;';
            }

            var placeholder = '';
            if (formtemplate.formentrytype == 'PRINTABLE') {
                placeholder = fieldAttribute.displaytext;
                $scope.fieldAttribute.displaytextView = '';
            }

            var html = '<div';
            html += ' style="' + objToStyle(eleStyle) + '" class="FORM-ATTR-' + attributetype + '">';

            if (attributetype == 'LABEL') {
                if (formtemplate.formentrytype == 'HEADERFOOTER')
                    fontClass += ' margin-0';

                html += '<md-input-container style="' + fontStyle + '" class="layout-row layout-align-start-center layout-wrap ' + fontClass + '">';

                if (fieldAttribute.displaytext && fieldAttribute.patientdataset) {
                    html += '<span style="' + displayTextStyle + '" class="word-wrap-break">';
                    html += formStringToHtml(fieldAttribute.displaytext);
                    html += '</span><span>&nbsp;:&nbsp;</span>';
                }

                if (fieldAttribute.patientdataset) {
                    if (fieldAttribute.patientdataset == 'Others.Page No') {
                        html += '<span class="word-wrap-break">{{page}}</span>';
                    } else if (fieldAttribute.patientdataset == 'Others.Total Pages') {
                        html += '<span class="word-wrap-break">{{pages}}</span>';
                    } else
                        html += '<span class="word-wrap-break" ng-bind-html="fieldAttribute.value"></span>';
                } else
                    html += '<span class="word-wrap-break">' + formStringToHtml(fieldAttribute.value) + '</span>';
                html += '</md-input-container>';
            } else if (attributetype == 'HEADING') {
                html +=
                    '<div>' +
                    '   <h4 style="' + displayTextStyle + fontStyle + '" class="word-wrap-break ' + fontClass + (formtemplate.formentrytype != 'PRINTABLE' ? ' padding-right-10' : '') + '">' +
                    formStringToHtml(fieldAttribute.value) +
                    '   </h4>' +
                    '</div>';
            } else if (attributetype == 'INPUTFIELD' || attributetype == 'NUMBERFIELD') {
                html +=
                    '<div style="' + fontStyle + '">' +
                    '   <md-input-container class="full-width layout-row layout-align-start-center" md-no-float>' + getLeftSideDisplayText() + getMateriaLabelTag();

                if (attributetype == 'NUMBERFIELD' || !formtemplate.isForPrint) {
                    html += '<input enterastab ng-model="fieldAttribute.value" ng-blur="runSripts();" ng-required="fieldAttribute.ismandatory && !isPreview"  class="form-input" aria-label="."' + (attributetype == 'INPUTFIELD' ? ' type="text"' : ' type="number"') + (placeholder ? ' placeholder="' + placeholder + '"' : '') + (fieldAttribute.maxchar ? ' maxlength="' + fieldAttribute.maxchar + '"' : '') + ' >';
                } else {
                    html += '<textarea elastic ng-required="fieldAttribute.ismandatory && !isPreview"  class="form-input flex" aria-label="."' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + '>' + fieldAttribute.value + '</textarea>';
                }
                html += '</md-input-container></div>';
            } else if (attributetype == 'DATEFIELD') {
                html +=
                    '<div style="' + fontStyle + '" class="layout-row layout-align-start-center no-page-break">' +
                    getLeftSideDisplayText() +
                    '   <md-date-selector ng-model="fieldAttribute.value"  ng-required="fieldAttribute.ismandatory && !isPreview" ng-blur="runSripts();"  input-class="form-input" class="date-min-width" label-class="form-label"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + (fieldAttribute.displaytextView ? ' floating-label="' + fieldAttribute.displaytextView + '"' : '') + (formtemplate.isForPrint ? ' hide-calender-btn="true"' : '') + ' ></md-date-selector>' +
                    '</div>';
            } else if (attributetype == 'DATETIMEFIELD') {
                html +=
                    '<div style="' + fontStyle + '" class="layout-row layout-align-start-center flex layout-wrap no-page-break">' +
                    '   <div class="layout-row layout-align-start-center">' +
                    getLeftSideDisplayText() +
                    '       <md-date-selector ng-model="fieldAttribute.value"  ng-required="fieldAttribute.ismandatory && !isPreview" ng-blur="runSripts();"  input-class="form-input" class="date-min-width" label-class="form-label"' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + (fieldAttribute.displaytextView ? ' floating-label="' + fieldAttribute.displaytextView + '"' : '') + (formtemplate.isForPrint ? ' hide-calender-btn="true"' : '') + ' ></md-date-selector>' +
                    '   </div>' +
                    '   <md-input-container md-no-float>';

                if (formtemplate.formentrytype != 'PRINTABLE') {
                    html += '<label class="form-label">' + ('COMMON.TIME')
                    if (fieldAttribute.ismandatory && isPreview)
                        html += '<mandatory-denotation></mandatory-denotation>';
                    html += '</label>';
                }

                if (!formtemplate.isForPrint) {
                    html += '<input type="time" ng-model="fieldAttribute.additionalvalue" placeholder="HH:mm" ng-blur="runSripts();" ng-required="fieldAttribute.ismandatory && !isPreview"  class="time-input" aria-label="." enterastab>';
                } else {
                    html += ' <input type="text" ng-required="fieldAttribute.ismandatory && !isPreview"  class="time-input" aria-label="." value="' + $filter('buddhistdate')(fieldAttribute.additionalvalue, $rootScope.Time24Format) + '">';
                }

                html +=
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'TIMEFIELD') {
                html +=
                    '<div style="' + fontStyle + '" class="flex no-page-break">' +
                    '   <md-input-container class="layout-row layout-align-start-center flex" md-no-float>' +
                    getLeftSideDisplayText() + getMateriaLabelTag();

                if (!formtemplate.isForPrint) {
                    html += '<input type="time" ng-model="fieldAttribute.value" placeholder="HH:mm" ng-blur="runSripts();" ng-required="fieldAttribute.ismandatory && !isPreview"  class="time-input" aria-label="." enterastab>';
                } else {
                    html += ' <input type="text" ng-required="fieldAttribute.ismandatory && !isPreview"  class="time-input" aria-label="." value="' + $filter('buddhistdate')(fieldAttribute.value, $rootScope.Time24Format) + '">';
                }

                html +=
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'TEXTAREA') {
                html +=
                    '<div style="' + fontStyle + '" class="flex no-page-break">' +
                    '   <md-input-container class="full-width layout-row layout-align-start-center flex" md-no-float>' + getLeftSideDisplayText() + getMateriaLabelTag();

                html +=
                    '     <textarea ng-model="fieldAttribute.value" elastic ng-blur="runSripts();" ng-required="fieldAttribute.ismandatory && !isPreview"   class="flex" aria-label="." ' + (placeholder ? ' placeholder="' + placeholder + '"' : '') + (fieldAttribute.maxchar ? ' maxlength="' + fieldAttribute.maxchar + '"' : '') + '>' + fieldAttribute.value + '</textarea>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'HORIZONTALSELECT') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-align-start-center') + '">' + getDisplayText() +
                    '       <horizontal-select horizontal-items="fieldAttribute.refdomainuid.values" selected-item="fieldAttribute.value"  ng-required="fieldAttribute.ismandatory && !isPreview" unique-field-of-item="_id"' + (fieldAttribute.showoptioncolumnwise ? ' show-option-column-wise="true"' : '') + (formtemplate.isForPrint ? ' comma-separated-item="true"' : '') + ' selected-item-changed="runSripts();" is-single="true">' +
                    '           <horizontal-select-template>{{$item.valuedescription}}</horizontal-select-template>' +
                    '       </horizontal-select>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'HORIZONTALMULTISELECT') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-align-start-center') + '">' + getDisplayText() +
                    '       <horizontal-select horizontal-items="fieldAttribute.refdomainuid.values" selected-item="fieldAttribute.value"  ng-required="fieldAttribute.ismandatory && !isPreview" unique-field-of-item="_id"' + (fieldAttribute.showoptioncolumnwise ? ' show-option-column-wise="true"' : '') + (formtemplate.isForPrint ? ' comma-separated-item="true"' : '') + ' selected-item-changed="runSripts();">' +
                    '           <horizontal-select-template>{{$item.valuedescription}}</horizontal-select-template>' +
                    '       </horizontal-select>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'CHECKBOX') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-align-start-center') + '">' + getDisplayText() +
                    '       <div class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-wrap') + '">' +
                    '           <md-checkbox ng-repeat="refvalue in ::fieldAttribute.refdomainuid.values" ng-model="refvalue.ischecked" ng-change="runSripts();" aria-label="." class="small-checkbox form-check-items" >{{::refvalue.valuedescription }}</md-checkbox>' +
                    '       </div>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'RADIOBUTTON') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-align-start-center') + '">' + getDisplayText() +
                    '       <md-radio-group ng-model="fieldAttribute.value" ng-change="runSripts();" class="' + (fieldAttribute.showoptioncolumnwise ? 'layout-column' : 'layout-row layout-wrap') + '">';

                if (fieldAttribute.refdomainuid && fieldAttribute.refdomainuid.values) {
                    fieldAttribute.refdomainuid.values.forEach(function(refvalue) {
                        html += '<md-radio-button value="' + refvalue._id + '"  class="form-check-items">' + refvalue.valuedescription + '</md-radio-button>';
                    });
                }

                html +=
                    '       </md-radio-group>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'CHECKLISTTEXT') {
                fieldAttribute.showoptioncolumnwise = true;
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + (formtemplate.formentrytype != 'PRINTABLE' ? ' padding-top-10 padding-bottom-10' : '') + '">' + getDisplayText() +
                    '  <table>' +
                    '    <tr ng-repeat="refvalue in ::fieldAttribute.refdomainuid.values">' +
                    '      <td class="padding-right-20 vertical-align-middle no-border-cell">' +
                    '         <md-input-container class="md-block">' +
                    '            <md-checkbox ng-model="refvalue.ischecked" ng-change="runSripts();" aria-label="."  class="md-check-nowrap">' +
                    '                {{::refvalue.valuedescription}}' +
                    '             </md-checkbox>' +
                    '         </md-input-container>' +
                    '      </td>' +
                    '      <td class="min-width-comment no-border-cell" id="fullheighttd">' +
                    '         <md-input-container ng-if="refvalue.ischecked" class="md-block margin-0">' +
                    '           <label class="form-label">' + ('COMMON.COMMENTS') + '</label>' +
                    '           <textarea enterastab type="text" ng-model="refvalue.additionalvalue"   aria-label="."' + (fieldAttribute.maxchar ? ' maxlength="' + fieldAttribute.maxchar + '"' : '') + ' elastic>{{refvalue.additionalvalue}}</textarea>' +
                    '         </md-input-container>' +
                    '       </td>' +
                    '     </tr>' +
                    '   </table>' +
                    '</div>';
            } else if (attributetype == 'COMBOSELECT') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="full-width layout-row layout-align-start-center">' + getLeftSideDisplayText();

                if (formtemplate.formentrytype != 'PRINTABLE' && !fieldAttribute.showdisplaytextonleftside) {
                    html += '<label>' + fieldAttribute.displaytext + (fieldAttribute.ismandatory && isPreview ? ' <sub class="mandatory-denotation form-label"> *</sub>' : '') + '</label>'
                }

                if (!formtemplate.isForPrint) {
                    html +=
                        '<md-select ng-model="fieldAttribute.value" ng-change="runSripts();"  ng-required="fieldAttribute.ismandatory && !isPreview" aria-label=".">' +
                        '   <md-option ng-if="!fieldAttribute.ismandatory" ng-value="null" md-option-empty>' +
                        '       <em><span>' + ('COMMON.CLEARSELECT') + '</span></em>' +
                        '</md-option>'

                    if (fieldAttribute.refdomainuid && fieldAttribute.refdomainuid.values) {
                        fieldAttribute.refdomainuid.values.forEach(function(refvalue) {
                            html += '<md-option value="' + refvalue._id + '">' + refvalue.valuedescription + '</md-option>';
                        });
                    }

                    html += '</md-select>';
                } else {
                    if (fieldAttribute.refdomainuid && fieldAttribute.refdomainuid.values) {
                        fieldAttribute.refdomainuid.values.forEach(function(refvalue) {
                            if (refvalue._id != fieldAttribute.value) return;
                            html += '<div>' + refvalue.valuedescription + '</div>';
                        });
                    }
                }

                html +=
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'IMAGE') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break">' +
                    '   <div class="layout-row layout-align-start-start">';

                if (fieldAttribute.displaytext) {
                    html +=
                        '<div class="padding-right-10 break-word flex" style="' + displayTextStyle + '">' +
                        '   <span class="word-wrap-break">' + formStringToHtml(fieldAttribute.displaytext) + '</span>' +
                        '</div>';
                }

                if (fieldAttribute.enablepopupannotation && !readonly && !formtemplate.isForPrint) {
                    html +=
                        '<md-button class="md-icon-button margin-0" aria-label="." ng-click="doPopupAnnont();">' +
                        '   <md-icon md-font-icon="zmdi zmdi-collection-image-o"></md-icon>' +
                        '   <md-tooltip>' +
                        '       <span>' + ('CLINICALDATAMASTER.DOIMAGEANNOT') + '</span>' +
                        '   </md-tooltip>' +
                        '</md-button>';
                }

                html += '   </div>';

                if (!fieldAttribute.isannotationsupportneed || readonly || formtemplate.isForPrint) {
                    html +=
                        '<div ' + (formtemplate.formentrytype != 'PRINTABLE' ? 'class="padding-right-10 padding-bottom-10"' : '') + '>' +
                        '   <img class="image-small" style="' + imageStyle + '" ng-src="{{fieldAttribute.value}}" ng-click="imageNewWindow(fieldAttribute.value);">' +
                        '</div>';
                } else {
                    html += '<div style="' + imageStyle + '">';
                    if (fieldAttribute.value) {
                        var additionalvalue = fieldAttribute.additionalvalue && JSON.parse(fieldAttribute.additionalvalue) || null;
                        fieldAttribute.annotationpositions = additionalvalue && additionalvalue.annotationpositions || [];
                        fieldAttribute.baseimage = additionalvalue && additionalvalue.baseimage || fieldAttribute.value;

                        html += '<md-image-annotation ng-if="fieldAttribute.baseimage" image-source="fieldAttribute.baseimage" annotated-image="fieldAttribute.datavalue" annotation-positions="fieldAttribute.annotationpositions" color="fieldAttribute.annotationfontcolor" text-font-family="Roboto, \'Helvetica Neue\', sans-serif" text-labels="textLabelsForAnnonation" set-parent-height-width="true" reload-annotation="fieldAttribute.reloadAnnotation"></md-image-annotation>';
                    }
                    html += '</div>';
                }

                html += '</div>';
            } else if (attributetype == 'IMAGEFILESELECTOR') {
                html +=
                    '<div class="no-page-break">' +
                    '   <div class="layout-row layout-align-start-center" style="' + fontStyle + '">';

                if (fieldAttribute.displaytext) {
                    html +=
                        '<div class="padding-right-10 break-word flex" style="' + displayTextStyle + '">' +
                        '   <span class="word-wrap-break">' + formStringToHtml(fieldAttribute.displaytext) + '</span>' +
                        '</div>';
                }

                if (!readonly && !formtemplate.isForPrint) {
                    html +=
                        '<md-button class="md-icon-button margin-0" aria-label="." ngf-select="selectImage($files)" ngf-accept="\'image/*\'" ngf-multiple="false">' +
                        '   <md-icon md-font-icon="fa fa-image"></md-icon>' +
                        '   <md-tooltip>' +
                        '       <span>' + ('COMMON.CHOOSEIMAGE') + '</span>' +
                        '   </md-tooltip>' +
                        '</md-button>'
                }

                html +=
                    '<md-button class="md-icon-button md-warn margin-0" aria-label="." ng-if="!readonly && !formtemplate.isForPrint && fieldAttribute.isallowtodelete && !isPreview && formsection.sectiontype === \'DYNAMIC\'" ng-click="deleteCurrentAttribute($index);">' +
                    '   <md-icon md-font-icon="fa fa-trash-o"></md-icon>' +
                    '   <md-tooltip>' +
                    '       <span>' + ('COMMON.DELETE') + '</span>' +
                    '   </md-tooltip>' +
                    '</md-button>' +
                    ' <md-button class="md-icon-button md-warn margin-0" aria-label="." ng-if="!!fieldAttribute.value && !readonly && !formtemplate.isForPrint" ng-click="deleteImage();">' +
                    '   <md-icon md-font-icon="fa fa-undo"></md-icon>' +
                    '   <md-tooltip>' +
                    '       <span>' + ('CLINICALDATAMASTER.CLEARIMAGE') + '</span>' +
                    '   </md-tooltip>' +
                    '</md-button>' +
                    '<md-button ng-if="fieldAttribute.enablepopupannotation && fieldAttribute.value && !readonly && !formtemplate.isForPrint" class="md-icon-button margin-0" aria-label="." ng-click="doPopupAnnont();">' +
                    '   <md-icon md-font-icon="zmdi zmdi-collection-image-o"></md-icon>' +
                    '   <md-tooltip>' +
                    '       <span>' + ('CLINICALDATAMASTER.DOIMAGEANNOT') + '</span>' +
                    '   </md-tooltip>' +
                    '</md-button>';

                if (fieldAttribute.isallowmultipleimageselection && !readonly && !formtemplate.isForPrint && formsection.sectiontype === 'DYNAMIC') {
                    html +=
                        '<md-button class="md-icon-button md-primary margin-0" aria-label="."  ng-click="duplicateCurrentAttribute();">' +
                        '   <md-icon md-font-icon="fa fa-plus"></md-icon>' +
                        '   <md-tooltip>' +
                        '       <span>' + ('COMMON.ADD') + '</span>' +
                        '   </md-tooltip>' +
                        '</md-button>';
                }

                html += '</div>';

                if (!fieldAttribute.isannotationsupportneed || readonly || formtemplate.isForPrint) {
                    html +=
                        '<div ' + (formtemplate.formentrytype != 'PRINTABLE' ? 'class="padding-right-10 padding-bottom-10"' : '') + '>' +
                        '   <img ng-if="fieldAttribute.value" class="image-small" style="' + imageStyle + '" ng-src="{{fieldAttribute.value}}" ng-click="imageNewWindow(fieldAttribute.value);">' +
                        '</div>';
                } else {
                    var additionalvalue = fieldAttribute.additionalvalue && JSON.parse(fieldAttribute.additionalvalue) || null;
                    fieldAttribute.annotationpositions = additionalvalue && additionalvalue.annotationpositions || [];
                    fieldAttribute.baseimage = additionalvalue && additionalvalue.baseimage || fieldAttribute.value;

                    html +=
                        '<div style="' + imageStyle + '">' +
                        '   <md-image-annotation ng-if="fieldAttribute.baseimage" image-source="fieldAttribute.baseimage" annotated-image="fieldAttribute.datavalue" annotation-positions="fieldAttribute.annotationpositions" color="fieldAttribute.annotationfontcolor" text-font-family="Roboto, \'Helvetica Neue\', sans-serif" text-labels="textLabelsForAnnonation" set-parent-height-width="true" reload-annotation="fieldAttribute.reloadAnnotation"></md-image-annotation>' +
                        '</div>';
                }

                html +=
                    '</div>' +
                    '<div ng-if="fieldError" translate style="color: red;">{{fieldError}}</div>' +
                    '<canvas id="imageSelectorCanvas" style="display: none;"></canvas>';
            } else if (attributetype == 'SWITCH') {
                html +=
                    '<div class="no-page-break">' +
                    '   <md-input-container class="full-width">' +
                    '      <md-switch class="md-primary padding-left-0" md-no-ink aria-label="." ng-model="fieldAttribute.value" ng-change="runSripts();" >' +
                    '         <span class="word-wrap-break">' + formStringToHtml(fieldAttribute.displaytext) + '</span>' +
                    '       </md-switch>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'SEARCHFIELD') {
                html +=
                    '<div style="' + fontStyle + '" class="no-page-break ' + fontClass + '">' +
                    '   <md-input-container class="full-width layout-row layout-align-start-center flex" md-no-float>' + getLeftSideDisplayText() +
                    '       <md-autocomplete md-require-match="' + (!isPreview) + '" md-min-length="1" md-no-cache="true" md-selected-item="fieldAttribute.value" title="{{fieldAttribute.value}}" md-item-text="item" md-search-text="vm.searchText" md-items="item in queryDatasets(vm.searchText);" md-selected-item-change="runSripts();" ng-required="fieldAttribute.ismandatory && !isPreview" ' + (formtemplate.formentrytype != 'PRINTABLE' && !fieldAttribute.showdisplaytextonleftside && fieldAttribute.displaytextView ? ' md-floating-label="' + fieldAttribute.displaytextView + '"' : '') + ' >' +
                    '        <md-item-template>' +
                    '          <span md-highlight-text="vm.searchText" md-highlight-flags="^i">{{item}}</span>' +
                    '          <md-tooltip>{{item}}</md-tooltip>' +
                    '        </md-item-template>' +
                    '        <md-not-found>' +
                    '           <span>' + ('ERRORS.NOMATCHES') + '</span>' +
                    '        </md-not-found>' +
                    '    </md-autocomplete>' +
                    '   </md-input-container>' +
                    '</div>';
            } else if (attributetype == 'PAGEBREAK') {
                if (isPreview)
                    html += '<span>' + ('CLINICALDATAMASTER.FORMTEMPLATEENUM.PAGEBREAK') + '</span>';
                else
                    html += '<span>>----</span>';
            } else if (attributetype == 'LINE') {
                if (!fieldAttribute.height || fieldAttribute.height <= 0)
                    fieldAttribute.height = 1;
                fontStyle += 'border-bottom: ' + fieldAttribute.height + 'px solid #9a9999;';
                html += '<div style="' + fontStyle + '" class="form-attr-line"></div>';
            }

            return html + '</div>';

            function getLeftSideDisplayText(isLeftText) {
                if (!fieldAttribute.displaytext || (!fieldAttribute.showdisplaytextonleftside && !isLeftText)) return '';
                var lefthtml =
                    '<div class="padding-right-10 break-word ' + fontClass + '" style="' + displayTextStyle + '">' +
                    '   <span class="word-wrap-break">' + formStringToHtml(fieldAttribute.displaytext) + '</span>' +
                    '   <mandatory-denotation ng-if="fieldAttribute.ismandatory"></mandatory-denotation>' +
                    '</div>' +
                    '<span>&nbsp;:&nbsp;</span>';
                return lefthtml
            }

            function getDisplayText() {
                if (!fieldAttribute.displaytext) return '';

                var lefthtml =
                    '<div class="padding-right-10 break-word" style="' + displayTextStyle + '">' +
                    '   <span class="word-wrap-break">' + formStringToHtml(fieldAttribute.displaytext) + '</span>' +
                    '   <mandatory-denotation ng-if="fieldAttribute.ismandatory"></mandatory-denotation>' +
                    '</div>';
                if (!fieldAttribute.showoptioncolumnwise)
                    lefthtml += '<span>&nbsp;:&nbsp;</span>';
                return lefthtml
            }

            function getMateriaLabelTag() {
                if (formtemplate.formentrytype == 'PRINTABLE' || fieldAttribute.showdisplaytextonleftside)
                    return '';

                var labelTag = '';
                labelTag += '<label class="form-label">' + (fieldAttribute.displaytext || '')
                if (fieldAttribute.ismandatory && isPreview)
                    labelTag += '<mandatory-denotation></mandatory-denotation>';
                return labelTag + '</label>';
            }
        }

        function objToStyle(styobj) {
            return formFactory.objToStyle(styobj);
        }

        function formStringToHtml(newhtml) {
            if (!newhtml) return '';

            newhtml = (newhtml + '').replace(/\n/g, '<br>');
            return newhtml.replace(/ /g, "&nbsp;");
        }
    });

})();