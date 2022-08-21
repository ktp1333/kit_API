(function() {
    'use strict';

    var app = angular.module('myApp');

    app.directive('formStringToHtml', function($compile, $timeout) {
        return {
            restrict: 'A',
            scope: {
                formStringToHtml: '='
            },
            replace: true,
            link: function(scope, ele) {
                var html = scope.formStringToHtml;
                if (html) {
                    formStringToHtml(html);
                } else {
                    $timeout(formStringToHtml);
                }

                function formStringToHtml(newhtml) {
                    if (newhtml) {
                        newhtml = (newhtml + '').replace(/\n/g, '<br>');
                        newhtml = newhtml.replace(/ /g, "&nbsp;");
                    }

                    ele.html(newhtml);
                    $compile(ele.contents())(scope);
                }
            }
        };
    });

    app.factory('formFactory', function($rootScope, $http, $q, $filter, $timeout,  $mdDialog, framework) {
        var obj = {};

        obj.getValidAttribute = function(attribute, isAllowLabel) {
            if (!attribute) { return null }
            var attributetype = attribute.attributetype;
            if (attributetype == 'PAGEBREAK' || attributetype == 'LINE') return attribute;
            if (attributetype == 'IMAGE' || attributetype == 'IMAGEFILESELECTOR') {
                attribute.value = attribute.datavalue;
            } else if (attribute.datavalue != null && attribute.datavalue != '') {
                attribute.value = JSON.parse(attribute.datavalue);
            } else {
                attribute.value = null;
            }

            if (!attribute.patientdataset && !isAllowLabel && (attribute.attributetype == 'LABEL' || attribute.attributetype == 'HEADING'))
                return null;
            else if (attribute.attributetype == 'SWITCH' && attribute.value)
                return attribute;
            else if (attribute.attributetype == 'IMAGE' || attribute.attributetype == 'LABEL' || (attribute.value != null && attribute.value != ''))
                return attribute;
            return null;
        }

        obj.setParentAttibuteValueToChild = function(formsection, childColumn) {
            if (!childColumn.attribute._id)
                return;

            var parentAttibute = null;
            for (var i = 0; i < formsection.tablerows.length; i++) {
                for (var j = 0; j < formsection.tablerows[i].tablecolumns.length; j++) {
                    var col = formsection.tablerows[i].tablecolumns[j];
                    if (col && col.attribute && col.attribute.attributeuid == childColumn.attribute.attributeuid && col._id != childColumn._id && col.attribute._id != childColumn.attribute._id) {
                        parentAttibute = JSON.parse(angular.toJson(col.attribute));
                        break;
                    }
                }
                if (parentAttibute)
                    break;
            }

            if (parentAttibute) {
                parentAttibute._id = childColumn.attribute._id;
                parentAttibute.value = childColumn.attribute.value;
                parentAttibute.datavalue = childColumn.attribute.datavalue;
                parentAttibute.additionalvalue = childColumn.attribute.additionalvalue;
                parentAttibute.ischildattribute = true;
                childColumn.attribute = parentAttibute;
            }
        }

        obj.getSavedPatientDataSet = function(patientDataSets, attribute) {
            if (!attribute.patientdataset) { return; }
            var tempset = attribute.patientdataset.split('.');

            if (tempset && tempset.length == 2) {
                var schema = tempset[0];
                var field = tempset[1];
                var schemafound = false;

                for (var i = 0; i < patientDataSets.length; i++) {
                    if (patientDataSets[i].schema != schema) continue;
                    schemafound = true;
                    if (patientDataSets[i].fields.indexOf(field) == -1)
                        patientDataSets[i].fields.push(field);
                }

                if (!schemafound) {
                    patientDataSets.push({
                        schema: schema,
                        fields: [field]
                    });
                }
            }
        }

        obj.setColspan = function(formsection) {
            for (var i = 0; i < formsection.tablerows.length; i++) {
                if (!formsection.tablerows[i].tablecolumns) { continue; }

                var columnLength = 0;
                for (var j = 0; j < formsection.tablerows[i].tablecolumns.length; j++) {
                    formsection.tablerows[i].tablecolumns[j].hidecolumn = false;
                }

                for (var j = 0; j < formsection.tablerows[i].tablecolumns.length; j++) {
                    var colum = formsection.tablerows[i].tablecolumns[j];
                    if (colum.hidecolumn) { continue; }

                    var colspan = 1;
                    if (colum.attribute && colum.attribute.colspan)
                        colspan = colum.attribute.colspan;
                    if (colspan <= 1) { continue; }
                    var colspanSet = 1;

                    // colspan is set. so have to hide the next columns
                    for (var k = (j + 1); k < formsection.tablerows[i].tablecolumns.length; k++) {
                        formsection.tablerows[i].tablecolumns[k].hidecolumn = true;
                        colspanSet++;
                        if (colspan <= colspanSet)
                            break;
                    }
                }
            }
        }

        obj.setSectionClass = function(formsection) {
            if (!formsection) return;
            var sectionwidthpercentage = formsection.sectionwidthpercentage || 100;
            formsection.sectionStyle = {
                "flex": "1 1 " + sectionwidthpercentage + "%",
                "max-width": sectionwidthpercentage + "%"
            };
        }

        obj.getScriptsAsString = function(form) {
            if (!form) { return ''; }

            var formDataAsString = '';
            var formDataAsStringPost = '';

            for (var i = 0; i < form.formsections.length; i++) {
                var formsection = form.formsections[i];
                if (formsection.attributes && formsection.attributes.length) {
                    for (var j = 0; j < formsection.attributes.length; j++) {
                        var attributetype = formsection.attributes[j].attributetype;
                        var attributeString = 'form.formsections[' + i + '].attributes[' + j + ']';
                        var attributesName = formsection.attributes[j].name;

                        appendFormDataAsString(attributetype, attributeString, attributesName);
                    }
                }

                if (formsection.tablerows && formsection.tablerows.length) {
                    for (var j = 0; j < formsection.tablerows.length; j++) {
                        if (!formsection.tablerows[j].tablecolumns) { continue; }

                        for (var k = 0; k < formsection.tablerows[j].tablecolumns.length; k++) {
                            var col = formsection.tablerows[j].tablecolumns[k];
                            if (!col || !col.attribute) { continue; }

                            var attributetype = col.attribute.attributetype;
                            var attributeString = 'form.formsections[' + i + '].tablerows[' + j + '].tablecolumns[' + k + '].attribute';
                            var attributesName = col.attribute.name;

                            appendFormDataAsString(attributetype, attributeString, attributesName);
                        }
                    }
                }
            }

            function appendFormDataAsString(attributetype, attributeString, attributesName) {
                if (attributetype != 'IMAGE' && attributetype != 'IMAGEFILESELECTOR') {

                    // setting the form fields with values and visibility, so that user code can access it
                    formDataAsString += 'var ' + attributesName + ' = {';

                    if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON' || attributetype == 'CHECKBOX' || attributetype == 'CHECKLISTTEXT' || attributetype == 'HORIZONTALSELECT' || attributetype == 'HORIZONTALMULTISELECT' || attributetype == 'DATETIMEFIELD') {
                        // comboselect and radio button _id will be stored in the value.
                        // so need to change it to string
                        formDataAsString += 'value: getValueForScript(' + attributeString + '), ';

                        if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON' || attributetype == 'HORIZONTALSELECT')
                            formDataAsString += 'getRelatedValue: function(){ return getRelatedValue(' + attributeString + ')}, ';
                    } else {
                        formDataAsString += 'value: ' + attributeString + '.value,';
                    }

                    formDataAsString += 'mandatory: ' + attributeString + '.ismandatory, '
                    formDataAsString += 'readonly: ' + attributeString + '.readonly, '
                    formDataAsString += 'visibility: ' + attributeString + '.visibility};'

                    // if user code changed any property value then coressponding will affect the actual value
                    formDataAsStringPost += 'setFieldValues(' + attributesName + ', ' + attributeString + '); ';
                }
            }

            return (formDataAsString + ' #$scripts$# ;' + formDataAsStringPost);
        }

        // don't remove any arg
        obj.runSripts = function(form, formScriptsAsString, scripts, readonly) {
            var scriptsToRun = formScriptsAsString.replace('#$scripts$#', scripts);
            try {
                eval(scriptsToRun);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    console.error(e);
                    return e.message;
                } else {
                    console.error(e);
                    return e.message;
                }
            }
            return '';

            function showAlert(title, message) {
                framework.displayAlert(title, message);
            }

            // this function will trigger while executing the scripts
            function setFieldValues(tempAttribute, attribute) {
                attribute.readonly = tempAttribute.readonly;
                attribute.ismandatory = tempAttribute.mandatory;
                attribute.visibility = tempAttribute.visibility;
                if (readonly || form.isForPrint) return;

                var attributetype = attribute.attributetype;
                if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON') {
                    attribute.value = null;
                    if (attribute.refdomainuid) {
                        var matched = attribute.refdomainuid.values.filter(function(item) {
                            return (item.valuedescription == tempAttribute.value);
                        })[0];

                        if (matched) {
                            attribute.value = matched._id;
                        }
                    }
                } else if (attributetype == 'CHECKBOX') {
                    attribute.value = [];
                    if (tempAttribute.value == null || !tempAttribute.value.length) {
                        if (attribute.refdomainuid) {
                            for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                                attribute.refdomainuid.values[i].ischecked = false;
                            }
                        }
                    }

                    attribute.value = [];
                    if (attribute.refdomainuid) {
                        for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                            var matched = tempAttribute.value.filter(function(item) {
                                return (item == attribute.refdomainuid.values[i].valuedescription);
                            })[0];

                            if (matched) {
                                attribute.refdomainuid.values[i].ischecked = true;
                            } else {
                                attribute.refdomainuid.values[i].ischecked = false;
                            }
                        }
                    }
                } else if (attributetype == 'CHECKLISTTEXT') {
                    attribute.value = [];
                    if (tempAttribute.value == null || !tempAttribute.value.length || !(tempAttribute.value instanceof Array)) {
                        for (var i in attribute.refdomainuid.values) {
                            attribute.refdomainuid.values[i].ischecked = false;
                        }
                    }

                    if (attribute.refdomainuid) {
                        for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                            var matched = tempAttribute.value.filter(function(item) {
                                return (item.referencevalue == attribute.refdomainuid.values[i].valuedescription);
                            })[0];

                            if (matched) {
                                attribute.refdomainuid.values[i].ischecked = true;
                                attribute.refdomainuid.values[i].additionalvalue = matched.additionalvalue;
                            } else {
                                attribute.refdomainuid.values[i].ischecked = false;
                            }
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
                } else if (attributetype == 'HORIZONTALSELECT') {
                    attribute.value = null;
                    if (tempAttribute.value && attribute.refdomainuid) {
                        var matched = attribute.refdomainuid.values.filter(function(item) {
                            return (item.valuedescription == tempAttribute.value);
                        })[0];

                        if (matched) {
                            attribute.value = matched;
                        }
                    }
                } else if (attributetype == 'HORIZONTALMULTISELECT') {
                    attribute.value = [];
                    if (tempAttribute.value && tempAttribute.value instanceof Array && attribute.refdomainuid) {
                        for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                            var matched = tempAttribute.value.filter(function(item) {
                                return (item == attribute.refdomainuid.values[i].valuedescription);
                            })[0];

                            if (matched)
                                attribute.value.push(attribute.refdomainuid.values[i]);
                        }
                    }
                } else {
                    attribute.value = tempAttribute.value;
                }
            }

            // this function will trigger will executing scripts
            function getValueForScript(attribute) {
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
                        return (item._id == attribute.value);
                    })[0];

                    if (matched) {
                        return matched.valuedescription;
                    } else {
                        return attribute.value;
                    }
                } else if (attributetype == 'CHECKBOX') {
                    var valueDesc = [];

                    if (attribute.refdomainuid != null && attribute.refdomainuid.values != null) {
                        for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                            if (attribute.refdomainuid.values[i].ischecked) {
                                valueDesc.push(attribute.refdomainuid.values[i].valuedescription);
                            }
                        }
                    }
                    return valueDesc;
                } else if (attributetype == 'CHECKLISTTEXT') {
                    var valueDesc = [];

                    if (attribute.refdomainuid != null && attribute.refdomainuid.values != null) {
                        for (var i = 0; i < attribute.refdomainuid.values.length; i++) {
                            if (attribute.refdomainuid.values[i].ischecked) {
                                valueDesc.push({
                                    referencevalue: attribute.refdomainuid.values[i].valuedescription,
                                    additionalvalue: attribute.refdomainuid.values[i].additionalvalue
                                });
                            }
                        }
                    }
                    return valueDesc;
                } else if (attributetype == 'HORIZONTALSELECT') {
                    return attribute.value && attribute.value.valuedescription || '';
                } else if (attributetype == 'HORIZONTALMULTISELECT') {
                    var valueDesc = [];
                    if (attribute.value) {
                        for (var i = 0; i < attribute.value.length; i++) {
                            valueDesc.push(attribute.value[i].valuedescription);
                        }
                    }
                    return valueDesc;
                } else {
                    return attribute.value;
                }
            }

            function getRelatedValue(attribute) {
                if (!attribute || !attribute.refdomainuid || !attribute.refdomainuid.values || !attribute.refdomainuid.values.length)
                    return 0;

                var attributetype = attribute.attributetype;
                if (attributetype == 'COMBOSELECT' || attributetype == 'RADIOBUTTON') {
                    var matched = attribute.refdomainuid.values.filter(function(item) {
                        return (item._id == attribute.value);
                    })[0];

                    if (matched)
                        return matched.relatedvalue;
                } else if (attributetype == 'HORIZONTALSELECT') {
                    return attribute.value && attribute.value.relatedvalue || 0;
                }

                return 0;
            }
        }

        obj.getDefaultFontSize = function(attributetype, fontSize) {
            if (fontSize || !attributetype) { return fontSize; }

            if (attributetype == 'LABEL' || attributetype == 'CHECKBOX' || attributetype == 'RADIOBUTTON' || attributetype == 'CHECKLISTTEXT') {
                return 16;
            } else if (attributetype == 'HEADING') {
                return 16;
            }
            return null;
        }

        obj.validateForm = function(form) {
            form.error = '';
            if (!form.formsections || !form.formsections.length) { return; }

            for (var i = 0; i < form.formsections.length; i++) {
                var formsection = form.formsections[i];

                if (formsection.attributes && formsection.attributes.length) {
                    for (var j = 0; j < formsection.attributes.length; j++) {
                        var attribute = formsection.attributes[j];
                        var error = validateAttribute(attribute);
                        if (error)
                            return form.error = error;
                    }
                }

                if (formsection.tablerows && formsection.tablerows.length) {
                    for (var j = 0; j < formsection.tablerows.length; j++) {
                        var row = formsection.tablerows[j];
                        if (!row || !row.tablecolumns || !row.tablecolumns.length) { continue; }

                        for (var k = 0; k < row.tablecolumns.length; k++) {
                            if (!row.tablecolumns[k].attribute) { continue; }
                            var attribute = row.tablecolumns[k].attribute;
                            var error = validateAttribute(attribute);
                            if (error)
                                return form.error = error;
                        }
                    }
                }
            }
        }

        function validateAttribute(attribute) {
            var attributetype = attribute.attributetype;
            if (attributetype == 'PAGEBREAK' || attributetype == 'LINE') return;
            var fieldName = attribute.displaytext ? attribute.displaytext : attribute.name;

            if (attributetype == 'INPUTFIELD' || attributetype == 'DATEFIELD' || attributetype == 'TIMEFIELD' || attributetype == 'COMBOSELECT' || attributetype == 'TEXTAREA' || attributetype == 'RADIOBUTTON' || attributetype == 'SEARCHFIELD') {
                if (attribute.ismandatory && !attribute.value) {
                    return ('ERRORS.INVALIDFIELD') + fieldName;
                }
            } else if (attributetype == 'NUMBERFIELD') {
                if (attribute.ismandatory && attribute.value == null) {
                    return ('ERRORS.INVALIDFIELD') + fieldName;
                }
            } else if (attributetype == 'DATETIMEFIELD') {
                if (attribute.ismandatory && (!attribute.value || !attribute.additionalvalue)) {
                    return ('ERRORS.INVALIDFIELD') + fieldName;
                }
            } else if (attributetype == 'CHECKBOX' || attributetype == 'CHECKLISTTEXT') {
                setCheckBoxValues(attribute);

                if (attribute.ismandatory && (!attribute.value || !attribute.value.length)) {
                    return ('ERRORS.NOCHECKSELECT') + fieldName;
                }
            } else if (attributetype == 'HORIZONTALSELECT') {
                attribute.datavalue = null;
                if (attribute.value && attribute.value._id)
                    attribute.datavalue = attribute.value._id;
                if (attribute.ismandatory && !attribute.datavalue) {
                    return ('ERRORS.INVALIDFIELD') + fieldName;
                }
            } else if (attributetype == 'HORIZONTALMULTISELECT') {
                attribute.datavalue = [];
                if (attribute.value && attribute.value.length) {
                    for (var i = 0; i < attribute.value.length; i++) {
                        if (attribute.value[i]._id)
                            attribute.datavalue.push(attribute.value[i]._id);
                    }
                }

                if (attribute.ismandatory && !attribute.datavalue.length) {
                    return ('ERRORS.INVALIDFIELD') + fieldName;
                }
            } else if (attributetype == 'IMAGE') {
                attribute.additionalvalue = null;
                if (attribute.patientdataset)
                    attribute.datavalue = attribute.value || null;

                if (attribute.isannotationsupportneed) {
                    attribute.additionalvalue = {
                        baseimage: attribute.baseimage,
                        annotationpositions: attribute.annotationpositions
                    };
                    attribute.additionalvalue = JSON.stringify(attribute.additionalvalue);
                }
            } else if (attributetype == 'IMAGEFILESELECTOR') {
                if (attribute.isannotationsupportneed) {
                    attribute.additionalvalue = {
                        baseimage: attribute.baseimage,
                        annotationpositions: attribute.annotationpositions
                    };
                    attribute.additionalvalue = JSON.stringify(attribute.additionalvalue);
                }
            }
        }

        obj.setFormValue = function(form) {
            for (var i in form.formsections) {
                var formsection = form.formsections[i];
                if (formsection.attributes && formsection.attributes.length) {
                    for (var j in formsection.attributes) {
                        var attribute = formsection.attributes[j];
                        var attributetype = attribute.attributetype;

                        if (attributetype == 'CHECKBOX' || attributetype == 'CHECKLISTTEXT') {
                            setCheckBoxValues(attribute);
                        }
                    }
                }

                if (formsection.tablerows && formsection.tablerows.length) {
                    for (var j = 0; j < formsection.tablerows.length; j++) {
                        var row = formsection.tablerows[j];
                        if (!row || !row.tablecolumns || !row.tablecolumns.length) { continue; }

                        for (var k = 0; k < row.tablecolumns.length; k++) {
                            if (!row.tablecolumns[k].attribute) { return; }
                            var attribute = row.tablecolumns[k].attribute;
                            var attributetype = attribute.attributetype;

                            if (attributetype == 'CHECKBOX' || attributetype == 'CHECKLISTTEXT') {
                                setCheckBoxValues(attribute);
                            }
                        }
                    }
                }
            }
        }

        function setCheckBoxValues(attribute) {
            attribute.value = [];
            if (attribute.refdomainuid != null && attribute.refdomainuid.values != null && attribute.refdomainuid.values.length) {
                for (var k = 0; k < attribute.refdomainuid.values.length; k++) {
                    if (!attribute.refdomainuid.values[k].ischecked) { continue; }

                    if (attribute.attributetype == 'CHECKBOX') {
                        attribute.value.push(attribute.refdomainuid.values[k]._id);
                    } else {
                        attribute.value.push({
                            referencevalueid: attribute.refdomainuid.values[k]._id,
                            additionalvalue: attribute.refdomainuid.values[k].additionalvalue
                        });
                    }
                }
            }
        }

        obj.setFontSizeStyle = function(displayTextStyle, textsize) {
            displayTextStyle['font-size'] = textsize + "px";
        }

        obj.addFontStyleClass = function(displayTextClass, textproperties) {
            for (var i = 0; i < textproperties.length; i++) {
                if (textproperties[i] == "BOLD")
                    displayTextClass.push('form-text-bold');
                else if (textproperties[i] == "ITALIC")
                    displayTextClass.push('form-text-italic');
                else if (textproperties[i] == "UNDERLINE")
                    displayTextClass.push('form-text-underline');
            }
        }

        obj.toggleSectionShowAllOption = function(form) {
            var showallsection = !!form.showallsection;
            if (!form.formsections || !form.formsections.length)
                return;

            for (var i = 0; i < form.formsections.length; i++) {
                var formsection = form.formsections[i];
                if (formsection.showname)
                    formsection.showsection = showallsection;
                else
                    formsection.showsection = true;
            }
        }

        obj.updateShowAllOption = function(form) {
            form.showallsection = true;
            for (var i = 0; i < form.formsections.length; i++) {
                if (!form.formsections[i].showsection)
                    form.showallsection = false;
            }
        }

        obj.setFormResolution = function(form) {
            if (!form || !form.pagetype || !form.pageorientation) {
                form.screenWidth = null;
                return form.pageresolution = null;
            }

            var pageMargin = 18;
            var pageresolution = framework.getPageSizeInMm(form.pagetype, form.pageorientation);
            if (form.formentrytype == 'PRINTABLE' || !form.formprinttype)
                pageMargin = 0;

            if (form.formentrytype != 'PRINTABLE' && pageresolution) {
                pageresolution.height = undefined;
                pageresolution.width -= pageMargin;
            }

            if (pageresolution) {
                if (pageresolution.height)
                    pageresolution.height += 'mm';
                pageresolution.width += 'mm';
            }

            form.pageresolution = pageresolution;
            form.screenWidth = { width: pageresolution.width };
        }

        obj.setFormFontSize = function(form) {
            form.formFontSizeStyle = null;

            if (!form.fontsize)
                form.fontsize = 16;
            form.formFontSizeStyle = {
                'font-size': form.fontsize + 'px'
            }
        }

        obj.setFormHeight = function(form) {
            if (!form.formheight) {
                if (form.screenWidth && form.screenWidth.height)
                    form.screenWidth.height = null;
                return;
            }

            if (!form.screenWidth)
                form.screenWidth = {};

            form.screenWidth.height = form.formheight + 'mm';
            form.screenWidth.overflow = 'auto';
        }

        obj.objToStyle = function(styobj) {
            if (!styobj) return '';
            var stylestr = '';

            for (var i in styobj) {
                stylestr += i + ':' + styobj[i] + ';';
            }
            return stylestr;
        }

        obj.doFormSimplePrint = function(formuid, isAllFields, callback) {
            if (!formuid) return;

            $http.post('/emr/patientform/downloadpdf', {
                _id: formuid,
                isAllFields: isAllFields
            }).then(function successCallback(response) {
                var data = response.data;

                if (data && data.pdf != null && data.pdf.data != null) {
                    var blob = new Blob([b2ab(data.pdf.data)], {
                        type: "application/pdf;charset=utf-8"
                    });

                    var fileURL = URL.createObjectURL(blob);
                    var popupWin = window.open(fileURL, '', '');
                    window.setTimeout(function() {
                        if (!popupWin || popupWin.closed || typeof popupWin.closed == 'undefined') {
                            //saveAs provided by FileSaver.js
                            saveAs(blob, data.fileName);
                            return;
                        }

                        popupWin.focus();
                        popupWin.print();
                        popupWin.document.close();
                    });
                    callback();
                } else {
                    callback('ERRORS.DOWNLOADPDF');
                }
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                callback(data && data.error || 'ERRORS.DOWNLOADPDF');
            });
        }

        function b2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i != s.length; ++i) view[i] = s[i];
            return buf;
        }

        obj.viewFormAuditLog = function(formuid) {
            if (!formuid) return;

            $mdDialog.show({
                controller: auditLogController,
                controllerAs: 'vm',
                templateUrl: 'app/framework/viewauditlogs.tmpl.html',
                parent: angular.element(document.body),
                locals: {
                    dataFromParentController: { formuid: formuid }
                },
                clickOutsideToClose: false,
                skipHide: true,
                multiple: true,
                fullscreen: false
            });

            function auditLogController(dataFromParentController) {
                var vm = this;
                vm.cancelData = cancelData;
                vm.viewAuditLog = viewAuditLog;
                vm.auditlogs = [];
                vm.selectedAuditloguid = null;
                vm.showLoader = true;

                if (dataFromParentController && dataFromParentController.formuid) {
                    $http.get('/emr/patientform/getauditlogs/' + dataFromParentController.formuid).
                    then(function successCallback(response) {
                        var data = response.data;
                        vm.showLoader = false;
                        setAuditInformation(data.auditlogs);
                    }, function errorCallback(errresponse) {
                        var data = errresponse.data;
                        vm.showLoader = false;
                        vm.error = data.error;
                    });
                }

                function setAuditInformation(auditlogs) {
                    if (!auditlogs || !auditlogs.length) return vm.error = "ERRORS.NOLOGFOUNDS";
                    vm.auditlogs = auditlogs;
                }

                function viewAuditLog(log, index) {
                    if (!log || !log._id) { return; }
                    if (vm.selectedAuditloguid == log._id)
                        return vm.selectedAuditloguid = null;

                    vm.selectedAuditloguid = log._id;
                    if (!vm.auditlogs || vm.auditlogs.length < index) { return; }
                    var newValue = vm.auditlogs[index].postaudit;
                    var oldValue = vm.auditlogs[index + 1] ? vm.auditlogs[index + 1].postaudit : '';
                    vm.jsonDifference = framework.flatJsonDifference(oldValue, newValue);
                }

                function cancelData() {
                    $mdDialog.cancel();
                }
            }
        }

        var predefinedDataSetDetails = {
            'CHIEFCOMPLAINTS': {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'CCHPI',
            },
            'PRESENTILLNESS': {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'CCHPI',
            },
            "PASTHISTORY": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'MEDICAL HISTORY',
                headers: [
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'durationinyear', label: 'COMMON.YEARS', isselcted: true },
                    { field: 'durationinmonth', label: 'COMMON.MONTHS', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS', isselcted: true }
                ]
            },
            "FAMILYHISTORY": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'MEDICAL HISTORY',
                headers: [
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'problemtext', label: 'EMR.DIAGNOSIS', isselcted: true },
                    { field: 'durationinyear', label: 'COMMON.YEARS', isselcted: true },
                    { field: 'durationinmonth', label: 'COMMON.MONTHS', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS', isselcted: true }
                ]
            },
            "PERSONALHISTORY": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'MEDICAL HISTORY',
                headers: [
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'durationinyear', label: 'COMMON.YEARS', isselcted: true },
                    { field: 'durationinmonth', label: 'COMMON.MONTHS', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS', isselcted: true }
                ]
            },
            "MEDICATIONHISTORY": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'MEDICATION HISTORY',
                headers: [
                    { field: 'code', label: 'COMMON.CODE', isselcted: true },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'ordercat', label: 'ORDERITEM.CATEGORY' },
                    { field: 'ordersubcat', label: 'ORDERITEM.SUBCATEGORY' },
                    { field: 'dosage', label: 'ORDERSET.DOSAGE', isselcted: true },
                    { field: 'frequency', label: 'FREQUENCYMASTER.FREQUENCY', isselcted: true },
                    { field: 'longterm', label: 'EMR.LONGTERM', isselcted: true }
                ]
            },
            "OBHISTORY": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'OB HISTORY',
                headers: [
                    { field: 'code', label: 'COMMON.CODE', isselcted: true },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'durationinyear', label: 'COMMON.YEARS', isselcted: true },
                    { field: 'durationinmonth', label: 'COMMON.MONTHS', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS', isselcted: true }
                ]
            },
            "EXAMINATIONS": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'EXAMINATION',
            },
            "DIAGNOSIS": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'DIAGNOSIS',
                headers: [
                    { field: 'code', label: 'COMMON.CODE', isselcted: true },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'codingscheme', label: 'EMR.SCHEME' },
                    { field: 'primary', label: 'EMR.PRIMARYDIAGNOSIS', isselcted: true },
                    { field: 'encounterstage', label: 'EMR.ENCOUNTERSTAGE', isselcted: true },
                    { field: 'severity', label: 'EMR.SEVERITY', isselcted: true },
                    { field: 'comorbidity', label: 'EMR.COMORBIDITY', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS' }
                ]
            },
            "PROCEDURES": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'PATIENT PROCEDURE',
                headers: [
                    { field: 'code', label: 'COMMON.CODE', isselcted: true },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'codingscheme', label: 'EMR.SCHEME' }
                ]
            },
            "DOCTORNOTES": {
                allowmodify: true,
                autopulldata: true,
                secureditem: 'DOCTOR NOTES',
            },
            "DOCTORRECOMMENDATION": {
                allowmodify: true,
                secureditem: 'DOCTOR RECOMMENDATION',
            },
            "ALLERGIES": {
                autopulldata: true,
                headers: [
                    { field: 'type', label: 'COMMON.TYPE', isselcted: true },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'severity', label: 'DRUGMASTER.SEVERITY', isselcted: true },
                    { field: 'symptoms', label: 'ALLERGIES.SYMPTOM', isselcted: true },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                ]
            },
            "OBSERVATION": {
                secureditem: 'CHARTING',
            },
            "CLINICALNOTES": {
                autopulldata: false,
                secureditem: 'CLINICAL DOCUMENT',
                headers: [
                    { field: 'dateandtime', label: 'COMMON.DATEANDTIME', isselcted: true },
                    { field: 'freetext', label: 'COMMON.FREETEXT', isselcted: true },
                    { field: 'recordedby', label: 'COMMON.RECORDEDBY', isselcted: true },
                ]
            },
            "PROGRESSNOTES": {
                autopulldata: false,
                secureditem: 'CLINICAL DOCUMENT',
                headers: [
                    { field: 'dateandtime', label: 'COMMON.DATEANDTIME', isselcted: true },
                    { field: 'freetext', label: 'COMMON.FREETEXT', isselcted: true },
                    { field: 'recordedby', label: 'COMMON.RECORDEDBY', isselcted: true },
                ]
            },
            "LABRESULTS": {
                headers: [
                    { field: 'name', label: 'COMMON.NAME', isselcted: true },
                    { field: 'labno', label: 'LAB.LABNO', isselcted: true },
                    { field: 'resultdate', label: 'COMMON.DATETIME', isselcted: true },
                    { field: 'resultname', label: 'CLINICALDATAMASTER.RESULTNAME', isselcted: true, isconfidential: true },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'resultvalue', label: 'COMMON.VALUE', isselcted: true, isconfidential: true },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                    { field: 'careprovider', label: 'ENTERPRISE.CAREPROVIDER' },
                    { field: 'rang', label: 'ORDERRESULTITEM.RANGE' },
                    { field: 'uom', label: 'ORDERRESULTITEM.UOM', isselcted: true },
                    { field: 'subcat', label: 'ORDERITEM.SUBCATEGORY' },
                    { field: 'approvaldate', label: 'COMMON.APPROVALDATE' },
                ]
            },
            "RADIOLOGYRESULTS": {
                headers: [
                    { field: 'itemname', label: 'COMMON.NAME', isselcted: true },
                    { field: 'ordernumber', label: 'EMR.RADIOLOGYNO', isselcted: true },
                    { field: 'resultdate', label: 'COMMON.DATETIME', isselcted: true },
                    { field: 'careprovider', label: 'ENTERPRISE.CAREPROVIDER', isselcted: true },
                    { field: 'radiologist', label: 'RADIOLOGY.RADIOLOGIST' },
                    { field: 'approvaldate', label: 'COMMON.APPROVALDATE' },
                    { field: 'resulttext', label: 'EMR.RESULTTEXT', isselcted: true, isfullwidth: true },
                    { field: 'impressiontext', label: 'EMR.IMPRESSION', isselcted: true, showOnlyIfData: true, isfullwidth: true },
                ]
            },
            "MEDICINEORDERS": {
                secureditem: 'ORDERS',
                headers: [
                    { field: 'no', label: 'ORDERITEM.ORDERNUMBER', isselcted: true },
                    { field: 'datetime', label: 'ORDERS.ORDERDATETIME' },
                    { field: 'code', label: 'COMMON.CODE' },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'dosageandfreq', label: 'PATIENTORDERS.DOSAGEANDFREQ', isselcted: true, tdstyle: { 'min-width': '200px;' } },
                    { field: 'priority', label: 'COMMON.PRIORITY' },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'type', label: 'PATIENTORDERS.ORDERTYPE' },
                    { field: 'careprovider', label: 'ENTERPRISE.CAREPROVIDER' },
                    { field: 'department', label: 'ENTERPRISE.DEPARTMENT' },
                    { field: 'quantity', label: 'COMMON.QUANTITY' },
                    { field: 'ordercat', label: 'ORDERITEM.CATEGORY' },
                    { field: 'ordersubcat', label: 'ORDERITEM.SUBCATEGORY' },
                    { field: 'admininstrct', label: 'ORDERITEM.ADMINISTRATIONINSTRUCTION' },
                    { field: 'startdate', label: 'COMMON.STARTDATE' },
                    { field: 'enddate', label: 'COMMON.ENDDATE' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                ]
            },
            "ORDERS": {
                secureditem: 'ORDERS',
                headers: [
                    { field: 'no', label: 'ORDERITEM.ORDERNUMBER', isselcted: true },
                    { field: 'datetime', label: 'ORDERS.ORDERDATETIME' },
                    { field: 'code', label: 'COMMON.CODE' },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'type', label: 'PATIENTORDERS.ORDERTYPE' },
                    { field: 'careprovider', label: 'ENTERPRISE.CAREPROVIDER' },
                    { field: 'department', label: 'ENTERPRISE.DEPARTMENT' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                    { field: 'ordercat', label: 'ORDERITEM.CATEGORY' },
                    { field: 'ordersubcat', label: 'ORDERITEM.SUBCATEGORY' },
                    { field: 'startdate', label: 'COMMON.STARTDATE' },
                    { field: 'enddate', label: 'COMMON.ENDDATE' },
                ]
            },
            "FUTUREORDERS": {
                secureditem: 'FUTURE ORDER',
                headers: [
                    { field: 'code', label: 'COMMON.CODE' },
                    { field: 'name', label: 'COMMON.NAME', isNeededAlways: true, isselcted: true },
                    { field: 'startdate', label: 'COMMON.STARTDATE', isselcted: true },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'type', label: 'COMMON.TYPE' },
                    { field: 'details', label: 'COMMON.DETAILS', isselcted: true },
                    { field: 'quantity', label: 'COMMON.QUANTITY', isselcted: true },
                    { field: 'priority', label: 'COMMON.PRIORITY' },
                    { field: 'orderdate', label: 'ORDERS.ORDERDATETIME' },
                    { field: 'ordercattype', label: 'ORDERCATEGORY.CATTYPE' },
                ]
            },
            "CONSULT": {
                autopulldata: true,
                secureditem: 'CONSULT',
                headers: [
                    { field: 'referredto', label: 'REFERRAL.REFERTODEPARTMENT', isselcted: true },
                    { field: 'referredtocp', label: 'REFERRAL.REFERTOCAREPROVIDER', isselcted: true },
                    { field: 'appointmentdate', label: 'REFERRAL.APPOINTMENTDATE', isselcted: true },
                    { field: 'referringdept', label: 'REFERRAL.REFEREDBYDEPARTMENT' },
                    { field: 'referringcp', label: 'REFERRAL.REFEREDBYCAREPROVIDER' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                    { field: 'status', label: 'COMMON.STATUS' },
                ]
            },
            "SURGERYREQUEST": {
                autopulldata: true,
                secureditem: 'SURGERY REQUEST',
                headers: [
                    { field: 'referredto', label: 'ENTERPRISE.DEPARTMENT' },
                    { field: 'surgerydate', label: 'OPERATINGROOM.SURGERYDATETIME', isselcted: true },
                    { field: 'surgeon', label: 'REFERRAL.SURGEON', isselcted: true },
                    { field: 'cosurgeon', label: 'OPERATINGROOM.COSURGEON' },
                    { field: 'asstsurgeon', label: 'OPERATINGROOM.ASSTSURGEON' },
                    { field: 'anaesthetist', label: 'OPERATINGROOM.ANAESTHETIST' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                ]
            },
            "OPAPPOINTMENT": {
                autopulldata: true,
                secureditem: 'APPOINTMENTS',
                headers: [
                    { field: 'appointmentno', label: 'OPD.APPOINTMENTNUMBER', isselcted: true },
                    { field: 'datetime', label: 'COMMON.DATEANDTIME', isselcted: true, isNeededAlways: true },
                    { field: 'department', label: 'ENTERPRISE.DEPARTMENT', isselcted: true },
                    { field: 'careprovider', label: 'ENTERPRISE.CAREPROVIDER', isselcted: true },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'priority', label: 'COMMON.PRIORITY' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                ]
            },
            "ORSCHEDULE": {
                autopulldata: true,
                secureditem: 'OR SCHEDULE',
                headers: [
                    { field: 'bookingnumber', label: 'OPERATINGROOM.BOOKINGNO', isselcted: true },
                    { field: 'datetime', label: 'COMMON.DATEANDTIME', isselcted: true, isNeededAlways: true },
                    { field: 'operatingroom', label: 'OPERATINGROOM.OPERATINGROOM', isselcted: true },
                    { field: 'status', label: 'COMMON.STATUS' },
                    { field: 'surgeon', label: 'REFERRAL.SURGEON', isselcted: true },
                    { field: 'cosurgeon', label: 'OPERATINGROOM.COSURGEON' },
                    { field: 'asstsurgeon', label: 'OPERATINGROOM.ASSTSURGEON' },
                    { field: 'anaesthetist', label: 'OPERATINGROOM.ANAESTHETIST' },
                    { field: 'comments', label: 'COMMON.COMMENTS' },
                ]
            }
        };

        obj.getPredefinedDatasetHeader = function(dataset) {
            var headers = predefinedDataSetDetails[dataset] && predefinedDataSetDetails[dataset].headers;
            return headers && $.extend(true, [], headers) || [];
        }

        obj.getPredefinedDatasetSecuredItem = function(dataset) {
            return predefinedDataSetDetails[dataset] && predefinedDataSetDetails[dataset].secureditem || '';
        }

        obj.isAutopullAvailable = function(dataset) {
            return predefinedDataSetDetails[dataset] && predefinedDataSetDetails[dataset].autopulldata || false;
        }

        obj.isDataSetsHavingModifyOption = function(dataset) {
            return predefinedDataSetDetails[dataset] && predefinedDataSetDetails[dataset].allowmodify || false;
        }

        obj.getDataSetHavingModifyOption = function() {
            var dataSetHavingModifyOption = [];
            for (var i in predefinedDataSetDetails) {
                if (predefinedDataSetDetails[i].autopulldata || (predefinedDataSetDetails[i].headers && predefinedDataSetDetails[i].headers.length))
                    dataSetHavingModifyOption.push(i);
            }

            dataSetHavingModifyOption.push('OBSERVATION');
            return dataSetHavingModifyOption;
        }

        var searchDataset = {
            "User": {
                url: '/enterprise/user/basicsearch',
                searchresultname: 'users',
                filters: [
                    { field: 'description', label: 'Description', type: 'test' },
                    { field: 'iscareprovider', label: 'Careprovider', type: 'boolean' },
                    { field: 'isopconsultant', label: 'OP Consultant', type: 'boolean' },
                    { field: 'isadmitconsultant', label: 'Admit Consultant', type: 'boolean' },
                    { field: 'issurgeon', label: 'Surgeon', type: 'boolean' },
                    { field: 'isanaesthetist', label: 'Anaesthetist', type: 'boolean' },
                    { field: 'isradiologist', label: 'Radiologist', type: 'boolean' },
                    { field: 'islaboratorist', label: 'Laboratorist', type: 'boolean' },
                ]
            },
            "Department": {
                url: '/enterprise/department/basicsearch',
                searchresultname: 'departments',
                filters: [
                    { field: 'description', label: 'Description', type: 'test' },
                    { field: 'isregistrationallowed', label: 'Registration Allowed', type: 'boolean' },
                    { field: 'isadmissionallowed', label: 'Admission Allowed', type: 'boolean' },
                    { field: 'isEmergencyDept', label: 'Emergency Department', type: 'boolean' },
                ]
            }
        };

        obj.getAllSearchDataSet = function() {
            var allSearchDataSets = [];
            for (var i in searchDataset) {
                allSearchDataSets.push(i);
            }
            return allSearchDataSets;
        }

        obj.getPropertiesOfSearchField = function(searchdatasetname) {
            var searchFilters = searchDataset[searchdatasetname];
            return searchFilters && $.extend(true, [], searchFilters) || [];
        }

        obj.setPatientDataSetValues = function(form, patientDataSets, filter, attributes, callback) {
            if (!patientDataSets.length || !filter || !filter.patientuid || !filter.patientvisituid) {
                if (callback)
                    callback();
                return;
            }

            var tasks = [];
            var patientData = {};

            for (var i = 0; i < patientDataSets.length; i++) {
                var schema = patientDataSets[i].schema.toLowerCase();

                if (schema === "patient") {
                    tasks.push(buildPatientData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "patient visit" && filter.patientvisituid) {
                    tasks.push(buildPatientVisitData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "organisation") {
                    tasks.push(buildOrganisationData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "date time") {
                    tasks.push(buildDateTime(patientData, filter));
                } else if (schema === "referral" && filter.patientvisituid) {
                    tasks.push(buildReferralData(patientData, filter));
                } else if (schema === "vital sign" && filter.patientvisituid) {
                    tasks.push(buildVitalSignData(patientData, filter));
                } else if (schema === "observation" && filter.patientvisituid) {
                    tasks.push(buildObservationData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "login user") {
                    tasks.push(buildLoginUserData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "allergy") {
                    tasks.push(buildAllergyData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "triage") {
                    tasks.push(buildTriageData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "or record") {
                    tasks.push(buildOrRecordData(patientData, filter, patientDataSets[i].fields));
                } else if (schema === "others") {
                    tasks.push(buildOtherData(patientData));
                }  else if (schema === "emergency") {
                    tasks.push(buildEmergencyData(patientData, filter, patientDataSets[i].fields));
                }
            }

            if (!tasks.length) {
                if (callback)
                    callback();
                return;
            }

            $q.all(tasks).then(function() {
                if (attributes && attributes.length) {
                    for (var j = 0; j < attributes.length; j++) {
                        setPaitentData(patientData, attributes[j]);
                    }

                    if (callback)
                        callback();
                    return;
                }

                for (var i = 0; i < form.formsections.length; i++) {
                    var formsection = form.formsections[i];

                    if (formsection.attributes && formsection.attributes.length) {
                        for (var j = 0; j < formsection.attributes.length; j++) {
                            setPaitentData(patientData, formsection.attributes[j]);
                        }
                    }

                    if (formsection.tablerows && formsection.tablerows.length) {
                        for (var j = 0; j < formsection.tablerows.length; j++) {
                            var row = formsection.tablerows[j];
                            if (!row || !row.tablecolumns || !row.tablecolumns.length) { continue; }

                            for (var k = 0; k < row.tablecolumns.length; k++) {
                                setPaitentData(patientData, row.tablecolumns[k].attribute);
                            }
                        }
                    }
                }

                if (callback)
                    callback();
            }, function() {
                if (callback)
                    callback();
            });
        }

        function setPaitentData(patientData, attribute) {
            if (!attribute || !attribute.patientdataset) { return; }

            if (patientData[attribute.patientdataset] != null)
                attribute.value = patientData[attribute.patientdataset];
            else
                attribute.value = '';
        }

        function getDateString(date) {
            if (date)
                return $filter('buddhistdate')(date, $rootScope.INSDateFormat);
            else
                return '';
        }

        function getDateAndTimeString(date) {
            if (date)
                return $filter('buddhistdate')(date, $rootScope.INMDateFormat);
            else
                return '';
        }

        function getTimeString(date) {
            if (date)
                return $filter('buddhistdate')(date, $rootScope.Time24Format);
            else
                return '';
        }

        function buildPatientData(patientData, filter, fields) {
            var populates = [];
            var fieldsToSelect = [];
            var patientAdditionalFields = [];
            var patientAdditionalPopulates = [];
            var nokFields = ["NOK Name", "NOK MRN", "NOK Gender", "NOK Title", "NOK Type", "NOK DOB", "NOK AGE", "NOK Mobile", "NOK Phone", "NOK National ID", ];

            for (var i = 0; i < fields.length; i++) {
                if (fields[i] == 'Title') {
                    populates.push({ path: 'titleuid', select: 'valuedescription' });
                    populates.push({ path: 'localnametitleuid', select: 'valuedescription' });
                } else if (fields[i] == 'Name') {
                    fieldsToSelect.push('firstname middlename lastname');
                    fieldsToSelect.push('localfirstname localmiddlename locallastname');
                } else if (fields[i] == 'Local Name') {
                    fieldsToSelect.push('localfirstname localmiddlename locallastname');
                } else if (fields[i] == 'Gender') {
                    populates.push({ path: 'genderuid', select: 'valuedescription' });
                } else if (fields[i] == 'Age' || fields[i] == 'Date of Birth' || fields[i] == 'Is Approx DOB') {
                    fieldsToSelect.push('dateofbirth isdobestimated');
                } else if (fields[i] == 'Nationality') {
                    populates.push({ path: 'nationalityuid', select: 'valuedescription' });
                } else if (fields[i] == 'Phone' || fields[i] == 'Mobile' || fields[i] == 'Email ID') {
                    fieldsToSelect.push('contact');
                } else if (fields[i] == 'Marital Status') {
                    populates.push({ path: 'maritalstatusuid', select: 'valuedescription' });
                } else if (fields[i] == 'Religion') {
                    populates.push({ path: 'religionuid', select: 'valuedescription' });
                } else if (fields[i] == 'Race') {
                    populates.push({ path: 'raceuid', select: 'valuedescription' });
                } else if (fields[i] == 'Occupation') {
                    populates.push({ path: 'occupationuid', select: 'valuedescription' });
                } else if (fields[i] == 'Patient Image') {
                    populates.push({ path: 'patientimageuid', select: 'patientphoto' });
                } else if (fields[i] == 'Blood Group') {
                    populates.push({ path: 'bloodgroupuid', select: 'valuedescription' });
                } else if (fields[i] == 'RH Factor') {
                    populates.push({ path: 'rhfactoruid', select: 'valuedescription' });
                } else if (fields[i] == 'Passport No') {
                    patientAdditionalFields.push('addlnidentifiers.iddetail');
                    patientAdditionalPopulates.push({ path: 'addlnidentifiers.idtypeuid', select: 'relatedvalue' })
                } else if (nokFields.indexOf(fields[i]) > -1) {
                    patientAdditionalFields.push('nokdetails');
                    patientAdditionalPopulates.push({ path: 'nokdetails.reltypeuid', select: 'valuedescription' });
                    patientAdditionalPopulates.push({ path: 'nokdetails.titleuid', select: 'valuedescription' });
                    patientAdditionalPopulates.push({ path: 'nokdetails.genderuid', select: 'valuedescription' });
                    patientAdditionalPopulates.push({
                        path: 'nokdetails.patientuid',
                        select: 'mrn firstname middlename lastname contact nationalid titleuid dateofbirth isdobestimated genderuid isanonymous',
                        populate: [
                            { path: 'titleuid', model: 'ReferenceValue', select: 'valuedescription' },
                            { path: 'genderuid', model: 'ReferenceValue', select: 'valuedescription' }
                        ]
                    });
                } else {
                    fieldsToSelect.push(fields[i].toLowerCase().replace(' ', ''));
                }
            }

            populates.push({ path: 'preflanguid', select: 'relatedvalue' });
            var defer = $q.defer();
            $http.post('/mpi/patient/getselectedfields/', {
                _id: filter.patientuid,
                populates: populates,
                fields: fieldsToSelect.join(' '),
                patientAdditionalPopulates: patientAdditionalPopulates,
                patientAdditionalFields: patientAdditionalFields.join(' ')
            }).then(function successCallback(response) {
                var data = response.data;
                var patient = data.patient;
                var patadddet = data.patientadditionaldetail;

                if (patient && patient._id) {
                    var name = [];
                    if (patient.firstname) name.push(patient.firstname);
                    if (patient.middlename) name.push(patient.middlename);
                    if (patient.lastname) name.push(patient.lastname);
                    patient.name = name.join(' ');

                    var localname = [];
                    if (patient.localfirstname) localname.push(patient.localfirstname);
                    if (patient.localmiddlename) localname.push(patient.localmiddlename);
                    if (patient.locallastname) localname.push(patient.locallastname);
                    patient.localname = localname.join(' ');

                    if (patient.titleuid) patient.title = patient.titleuid.valuedescription || '';
                    if (patient.localnametitleuid) patient.localtitle = patient.localnametitleuid.valuedescription || '';

                    if (patient.preflanguid && patient.preflanguid.relatedvalue && patient.preflanguid.relatedvalue.toLowerCase() == 'th') {
                        if (patient.localname)
                            patient.name = patient.localname;
                        if (patient.localtitle)
                            patient.title = patient.localtitle;
                    }

                    if (patient.genderuid) patient.gender = patient.genderuid.valuedescription || '';
                    if (patient.nationalityuid) patient.nationality = patient.nationalityuid.valuedescription || '';
                    if (patient.maritalstatusuid) patient.maritalstatus = patient.maritalstatusuid.valuedescription || '';
                    if (patient.religionuid) patient.religion = patient.religionuid.valuedescription || '';
                    if (patient.raceuid) patient.race = patient.raceuid.valuedescription || '';
                    if (patient.occupationuid) patient.occupation = patient.occupationuid.valuedescription || '';
                    if (patient.rhfactoruid) patient.rhfactor = patient.rhfactoruid.valuedescription || '';
                    if (patient.bloodgroupuid) patient.bloodgroup = patient.bloodgroupuid.valuedescription || '';

                    if (patient.address) {
                        var address = [];
                        if (patient.address.address) address.push(patient.address.address);
                        if (patient.address.area) address.push(patient.address.area);
                        if (patient.address.city) address.push(patient.address.city);
                        if (patient.address.state) address.push(patient.address.state);
                        if (patient.address.country) address.push(patient.address.country);
                        if (patient.address.zipcode) address.push(patient.address.zipcode);
                        patient.address = address.join(', ');
                    }

                    if (patient.dateofbirth) {
                        patient.age = $filter('displayAge')(patient.dateofbirth, patient.isdobestimated);
                        patient.dateofbirth = getDateString(patient.dateofbirth);
                    }

                    patientData["Patient.MRN"] = patient.mrn;
                    patientData["Patient.Title"] = patient.title || '';
                    patientData["Patient.Name"] = patient.name;
                    patientData["Patient.Local Name"] = patient.localname;
                    patientData["Patient.Gender"] = patient.gender || '';
                    patientData["Patient.Date of Birth"] = patient.dateofbirth;
                    patientData["Patient.Is Approx DOB"] = patient.isdobestimated;
                    patientData["Patient.Nationality"] = patient.nationality || '';
                    patientData["Patient.Marital Status"] = patient.maritalstatus || '';
                    patientData["Patient.Religion"] = patient.religion || '';
                    patientData["Patient.Race"] = patient.race || '';
                    patientData["Patient.Occupation"] = patient.occupation || '';
                    patientData["Patient.National ID"] = patient.nationalid;
                    patientData["Patient.Address"] = patient.address;
                    patientData["Patient.Patient Image"] = patient.patientimageuid && patient.patientimageuid.patientphoto || null;
                    patientData["Patient.Phone"] = patient.contact && patient.contact.workphone || "";
                    patientData["Patient.Mobile"] = patient.contact && patient.contact.mobilephone || "";
                    patientData["Patient.Email ID"] = patient.contact && patient.contact.emailid || "";
                    patientData["Patient.Age"] = patient.age || '';
                    patientData["Patient.Blood Group"] = patient.bloodgroup || '';
                    patientData["Patient.RH Factor"] = patient.rhfactor || '';
                }

                if (patadddet && patadddet._id) {
                    var passportno = '';
                    if (patadddet.addlnidentifiers && patadddet.addlnidentifiers.length) {
                        var matchedid = patadddet.addlnidentifiers.find(function(item) {
                            return item.idtypeuid && item.idtypeuid.relatedvalue == 'PASSPORTNO';
                        });
                        if (matchedid && matchedid.iddetail)
                            passportno = matchedid.iddetail;
                    }

                    var nokdetails = patadddet.nokdetails && patadddet.nokdetails[0] || {};
                    var nokname = [];
                    var noktype = nokdetails.reltypeuid && nokdetails.reltypeuid.valuedescription || '';

                    if (nokdetails.patientuid) {
                        var nok = nokdetails.patientuid;
                        if (nok.mrn) nokdetails.mrn = nok.mrn;
                        if (nok.firstname) nokname.push(nok.firstname);
                        if (nok.middlename) nokname.push(nok.middlename);
                        if (nok.lastname) nokname.push(nok.lastname);
                        nokdetails.noknationalid = nok.nationalid || '';
                        if (nok.titleuid) nokdetails.noktitle = nok.titleuid.valuedescription || '';
                        if (nok.genderuid) nokdetails.gender = nok.genderuid.valuedescription || '';

                        if (nok.contact) {
                            nokdetails.nokmobile = nok.contact.mobilephone || '';
                            nokdetails.workphone = nok.contact.workphone || '';
                        }

                        if (nok.dateofbirth) {
                            nokdetails.age = $filter('displayAge')(nok.dateofbirth, nok.isdobestimated);
                            nokdetails.dateofbirth = getDateString(nok.dateofbirth);
                        }
                    } else {
                        var nok = nokdetails;
                        nokdetails.mrn = '';
                        if (nok.nokname) nokname.push(nok.nokname);
                        if (nok.middlename) nokname.push(nok.middlename);
                        if (nok.lastname) nokname.push(nok.lastname);
                        nokdetails.noknationalid = nok.nationalid || '';
                        if (nok.titleuid) nokdetails.noktitle = nok.titleuid.valuedescription || '';
                        if (nok.genderuid) nokdetails.gender = nok.genderuid.valuedescription || '';

                        if (nok.contact) {
                            nokdetails.nokmobile = nok.contact.mobilephone || '';
                            nokdetails.workphone = nok.contact.workphone || '';
                        }

                        if (nok.dateofbirth) {
                            nokdetails.age = $filter('displayAge')(nok.dateofbirth, nok.isdobestimated);
                            nokdetails.dateofbirth = getDateString(nok.dateofbirth);
                        }
                    }

                    patientData["Patient.Passport No"] = passportno;
                    patientData["Patient.NOK Name"] = nokname.join(' ');
                    patientData["Patient.NOK Type"] = noktype;
                    patientData["Patient.NOK MRN"] = nokdetails.mrn;
                    patientData["Patient.NOK Gender"] = nokdetails.gender;
                    patientData["Patient.NOK Title"] = nokdetails.noktitle;
                    patientData["Patient.NOK DOB"] = nokdetails.dateofbirth;
                    patientData["Patient.NOK AGE"] = nokdetails.age;
                    patientData["Patient.NOK Mobile"] = nokdetails.nokmobile;
                    patientData["Patient.NOK Phone"] = nokdetails.workphone;
                    patientData["Patient.NOK National ID"] = nokdetails.noknationalid;
                }
                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildLoginUserData(patientData, filter, fields) {
            var populates = [];
            var fieldsToSelect = [];

            for (var i = 0; i < fields.length; i++) {
                if (fields[i] == 'Provider Type') {
                    populates.push({ path: 'providertypeuid', select: 'valuedescription' });
                } else if (fields[i] == 'Full Name') {
                    fieldsToSelect.push('name');
                } else if (fields[i] == 'Title') {
                    populates.push({ path: 'titleuid', select: 'valuedescription' });
                } else if (fields[i] == 'Title with Name') {
                    fieldsToSelect.push('name');
                    populates.push({ path: 'titleuid', select: 'valuedescription' });
                } else if (fields[i] == 'Title') {
                    populates.push({ path: 'titleuid', select: 'valuedescription' });
                } else if (fields[i] == 'Doctor Specialty') {
                    populates.push({ path: 'specialtyuid', select: 'valuedescription' });
                } else if (fields[i] == 'User Image') {
                    populates.push({ path: 'userimageuid', select: 'userphoto' });
                } else if (fields[i] == 'User Signature') {
                    populates.push({ path: 'usersignatureuid', select: 'userphoto' });
                } else if (fields[i] == 'Phone' || fields[i] == 'Mobile' || fields[i] == 'Email ID') {
                    fieldsToSelect.push('contact');
                } else {
                    fieldsToSelect.push(fields[i].toLowerCase().replace(' ', ''));
                }
            }

            var defer = $q.defer();
            $http.post('/enterprise/user/getselectedfields', {
                _id: $rootScope.UserContext.UserUID,
                populates: populates,
                fields: fieldsToSelect.join(' '),
            }).then(function successCallback(response) {
                var data = response.data;
                var user = data.user;
                if (!user || !user._id) return defer.resolve();

                var titleWithName = [];
                if (user.providertypeuid) user.providertype = user.providertypeuid.valuedescription || '';
                if (user.titleuid) user.title = user.titleuid.valuedescription || '';
                if (user.title) titleWithName.push(user.title);
                if (user.name) titleWithName.push(user.name);
                if (user.specialtyuid) user.specialty = user.specialtyuid.valuedescription || '';
                if (user.userimageuid) user.userimage = user.userimageuid.userphoto || '';
                if (user.usersignatureuid) user.usersignature = user.usersignatureuid.userphoto || '';

                patientData["Login User.Full Name"] = user.name || '';
                patientData["Login User.Last Name"] = user.lastname || '';
                patientData["Login User.Provider Type"] = user.providertype;
                patientData["Login User.Title"] = user.title;
                patientData["Login User.Title with Name"] = titleWithName.join(' ');
                patientData["Login User.Print Name"] = user.printname || '';
                patientData["Login User.Doctor Specialty"] = user.specialty;
                patientData["Login User.License Number"] = user.licensenumber || '';
                patientData["Login User.Qualification"] = user.qualification || '';
                patientData["Login User.User Image"] = user.userimage || null;
                patientData["Login User.User Signature"] = user.usersignature || null;
                patientData["Login User.Phone"] = user.contact && user.contact.workphone || '';
                patientData["Login User.Mobile"] = user.contact && user.contact.mobilephone || '';
                patientData["Login User.Email ID"] = user.contact && user.contact.emailid || '';

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildPatientVisitData(patientData, filter, fields) {
            var populates = [];
            var fieldsToSelect = [];
            var loadDischargeDetails = false;
            var dischargeFields = ['Discharge Date', 'Discharge Time'];
            var ignoreFields = ['Encounter Type', "Discharge Date", "Discharge Time"];
            var cpFields = ["Careprovider", "Careprovider Print Name", "Careprovider License", "Careprovider Provider Type", "Careprovider Image", "Careprovider Signature"];
            var cpPopulates = [];
            var isCpNeedsToPopulate = false;

            fieldsToSelect.push('visitcareproviders bedoccupancy visitpayors');
            populates.push({ path: 'entypeuid', select: 'valuedescription relatedvalue' });

            for (var i = 0; i < fields.length; i++) {
                if (fields[i] == 'Visit Type') {
                    populates.push({ path: 'visitcareproviders.visittypeuid', select: 'valuedescription' });
                } else if (fields[i] == 'Visit Date' || fields[i] == 'Visit Time') {
                    fieldsToSelect.push('startdate');
                } else if (fields[i] == 'Department') {
                    populates.push({ path: 'visitcareproviders.departmentuid', select: 'name' });
                } else if (cpFields.indexOf(fields[i]) > -1) {
                    isCpNeedsToPopulate = true;
                    if (fields[i] == 'Careprovider Image') {
                        cpPopulates.push({ path: 'userimageuid', model: 'UserImage', select: 'userphoto' });
                    } else if (fields[i] == 'Careprovider Signature') {
                        populates.push({ path: 'usersignatureuid', model: 'UserImage', select: 'userphoto' });
                    } else if (fields[i] == 'Careprovider Provider Type') {
                        populates.push({ path: 'providertypeuid', model: 'ReferenceValue', select: 'valuedescription' });
                    }
                } else if (fields[i] == 'Wards') {
                    populates.push({ path: 'bedoccupancy.warduid', select: 'name' });
                } else if (fields[i] == 'Beds') {
                    populates.push({ path: 'bedoccupancy.beduid', select: 'name' });
                } else if (fields[i] == 'Primary Payor' || fields[i] == 'All Payor') {
                    populates.push({ path: 'visitpayors.payoruid', select: 'name' });
                } else if (fields[i] == 'Primary Payor Office' || fields[i] == 'All Payor Office') {
                    populates.push({ path: 'visitpayors.tpauid', select: 'name' });
                } else if (fields[i] == 'Primary Payor Agreement' || fields[i] == 'All Payor Agreement') {
                    populates.push({ path: 'visitpayors.payoragreementuid', select: 'name' });
                } else if (dischargeFields.indexOf(fields[i]) > -1) {
                    loadDischargeDetails = true;
                } else if (ignoreFields.indexOf(fields[i]) > -1) {
                    continue;
                } else {
                    fieldsToSelect.push(fields[i].toLowerCase().replace(' ', ''));
                }
            }

            if (isCpNeedsToPopulate) {
                cpPopulates.push({ path: 'titleuid', model: 'ReferenceValue', select: 'valuedescription' });
                var cppop = { path: 'visitcareproviders.careprovideruid', select: 'name printname licensenumber', populate: cpPopulates };
                populates.push(cppop);
            }

            var defer = $q.defer();
            async.parallel([
                function getPatientVisit(callback) {
                    $http.post('/mpi/patientvisit/getselectedfields', {
                        _id: filter.patientvisituid,
                        populates: populates,
                        fields: fieldsToSelect.join(' '),
                    }).then(function successCallback(response) {
                        var data = response.data;
                        callback(null, data.patientvisit);
                    }, function errorCallback(errresponse) {
                        callback();
                    });
                },
                function getPatientVisit(callback) {
                    if (!loadDischargeDetails) return callback();

                    $http.post('/inpatient/dischargeprocess/getdischargeprocess', {
                        patientuid: filter.patientuid,
                        patientvisituid: filter.patientvisituid
                    }).then(function successCallback(response) {
                        var data = response.data;
                        callback(null, data.dischargeprocess);
                    }, function errorCallback(errresponse) {
                        callback();
                    });
                }
            ], function(err, results) {
                if (!results || results.length < 2) {
                    defer.resolve();
                    return;
                }

                var patientvisit = results[0];
                var dischargeprocess = results[1];

                if (!patientvisit) {
                    defer.resolve();
                    return;
                }

                var currentCP = framework.getCurrentVisitCP(patientvisit);

                if (currentCP && currentCP.careprovideruid) {
                    patientvisit.careprovider = currentCP.careprovideruid.name;
                    if (currentCP.careprovideruid.titleuid && currentCP.careprovideruid.titleuid.valuedescription) {
                        patientvisit.careprovider = currentCP.careprovideruid.titleuid.valuedescription + ' ' + patientvisit.careprovider;
                    }

                    patientvisit.careproviderprintname = currentCP.careprovideruid.printname;
                    patientvisit.careproviderlicense = currentCP.careprovideruid.licensenumber;
                    patientvisit.cpimage = currentCP.careprovideruid.userimageuid && currentCP.careprovideruid.userimageuid.userphoto || null;
                    patientvisit.cpsign = currentCP.careprovideruid.usersignatureuid && currentCP.careprovideruid.usersignatureuid.userphoto || null;
                    patientvisit.cpprovidertype = currentCP.careprovideruid.providertypeuid && currentCP.careprovideruid.providertypeuid.valuedescription || null;
                }

                if (currentCP) {
                    if (currentCP.departmentuid)
                        patientvisit.department = currentCP.departmentuid.name;
                    if (currentCP.visittypeuid)
                        patientvisit.visittype = currentCP.visittypeuid.valuedescription;
                }

                if (patientvisit.entypeuid)
                    patientvisit.entype = patientvisit.entypeuid.valuedescription;

                if (patientvisit.startdate) {
                    patientvisit.starttime = getTimeString(patientvisit.startdate);
                    patientvisit.startdate = getDateString(patientvisit.startdate);
                }

                if (patientvisit.visitpayors && patientvisit.visitpayors.length > 0) {
                    var payors = [];
                    var payoragreements = [];
                    var payoroffice = [];
                    var primaryPayordet = null;

                    for (var i = 0; i < patientvisit.visitpayors.length; i++) {
                        var visitpayor = patientvisit.visitpayors[i];
                        if (visitpayor.payoruid) payors.push(visitpayor.payoruid.name);
                        if (visitpayor.payoragreementuid) payoragreements.push(visitpayor.payoragreementuid.name);
                        if (visitpayor.tpauid) payoroffice.push(visitpayor.tpauid.name);

                        if (!primaryPayordet || primaryPayordet.orderofpreference > visitpayor.orderofpreference)
                            primaryPayordet = visitpayor;
                    }

                    patientvisit.payor = payors.join(', ');
                    patientvisit.payoragreement = payoragreements.join(', ');
                    patientvisit.payoroffice = payoroffice.join(', ');

                    if (primaryPayordet) {
                        patientvisit.primarypayor = primaryPayordet.payoruid && primaryPayordet.payoruid.name;
                        patientvisit.primaryagreement = primaryPayordet.payoragreementuid && primaryPayordet.payoragreementuid.name;
                        patientvisit.primarytpauid = primaryPayordet.tpauid && primaryPayordet.tpauid.name;
                    }
                }

                if (dischargeprocess && dischargeprocess.dischargestage != 0) {
                    patientvisit.medicaldischargedate = dischargeprocess.medicaldischargedate;
                } else {
                    patientvisit.medicaldischargedate = "";
                }

                if (patientvisit.bedoccupancy) {
                    var beds = [];
                    var wards = [];
                    for (var i = 0; i < patientvisit.bedoccupancy.length; i++) {
                        var bedocc = patientvisit.bedoccupancy[i];
                        if (!bedocc.beduid || !bedocc.isactive) continue;
                        if (bedocc.beduid) beds.push(bedocc.beduid.name);
                        if (bedocc.warduid) wards.push(bedocc.warduid.name);
                    }

                    patientvisit.beds = beds.join(', ');
                    patientvisit.wards = wards.join(', ');
                }

                patientData["Patient Visit.Visit ID"] = patientvisit.visitid;
                patientData["Patient Visit.Visit Date"] = patientvisit.startdate;
                patientData["Patient Visit.Visit Time"] = patientvisit.starttime;
                patientData["Patient Visit.Encounter Type"] = patientvisit.entype;
                patientData["Patient Visit.Visit Type"] = patientvisit.visittype;
                patientData["Patient Visit.Careprovider"] = patientvisit.careprovider;
                patientData["Patient Visit.Careprovider Print Name"] = patientvisit.careproviderprintname;
                patientData["Patient Visit.Careprovider License"] = patientvisit.careproviderlicense;
                patientData["Patient Visit.Careprovider Provider Type"] = patientvisit.cpprovidertype;
                patientData["Patient Visit.Careprovider Image"] = patientvisit.cpimage;
                patientData["Patient Visit.Careprovider Signature"] = patientvisit.cpsign;
                patientData["Patient Visit.Department"] = patientvisit.department;
                patientData["Patient Visit.Discharge Date"] = getDateString(patientvisit.medicaldischargedate);
                patientData["Patient Visit.Discharge Time"] = getTimeString(patientvisit.medicaldischargedate);
                patientData["Patient Visit.Beds"] = patientvisit.beds;
                patientData["Patient Visit.Wards"] = patientvisit.wards;
                patientData["Patient Visit.All Payor"] = patientvisit.payor;
                patientData["Patient Visit.All Payor Agreement"] = patientvisit.payoragreement;
                patientData["Patient Visit.All Payor Office"] = patientvisit.payoroffice;
                patientData["Patient Visit.Primary Payor"] = patientvisit.primarypayor;
                patientData["Patient Visit.Primary Payor Agreement"] = patientvisit.primaryagreement;
                patientData["Patient Visit.Primary Payor Office"] = patientvisit.primarytpauid;
                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildOrganisationData(patientData, filter) {
            var defer = $q.defer();
            var orgId = $rootScope.UserContext.OrgUID;
            $http.get('/enterprise/organisation/getdetail/' + orgId).
            then(function successCallback(response) {
                var data = response.data;
                var organisation = data.organisation;

                if (organisation) {
                    patientData["Organisation.Code"] = organisation.code;
                    patientData["Organisation.Name"] = organisation.name;
                    patientData["Organisation.GST No"] = organisation.gstregno;
                    patientData["Organisation.GST Business Name"] = organisation.companyname;

                    if (organisation.address) {
                        patientData["Organisation.Address"] = organisation.address.address;
                        patientData["Organisation.Area"] = organisation.address.area;
                        patientData["Organisation.City"] = organisation.address.city;
                        patientData["Organisation.State"] = organisation.address.state;
                        patientData["Organisation.Country"] = organisation.address.country;
                        patientData["Organisation.Zipcode"] = organisation.address.zipcode;
                    }

                    if (organisation.contact) {
                        patientData["Organisation.Phone"] = organisation.contact.workphone;
                        patientData["Organisation.Weburl"] = organisation.contact.weburl;
                    }
                }
                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildDateTime(patientData, filter) {
            var defer = $q.defer();
            var currentdate = moment();
            var buddhistYear = moment(currentdate).add(543, 'years');
            patientData["Date Time.Day"] = currentdate.format('DD');
            patientData["Date Time.Month"] = currentdate.format('MM');
            patientData["Date Time.Year"] = currentdate.format('YYYY');
            patientData["Date Time.Year (Buddhist)"] = buddhistYear.format('YYYY');
            patientData["Date Time.Hours"] = currentdate.format('HH');
            patientData["Date Time.Minutes"] = currentdate.format('mm');
            patientData["Date Time.Date"] = currentdate.format('DD-MM-YYYY');
            patientData["Date Time.Date (Buddhist)"] = buddhistYear.format('DD-MM-YYYY');
            patientData["Date Time.Date And Time"] = currentdate.format('DD-MM-YYYY HH:mm');
            patientData["Date Time.Date And Time (Buddhist)"] = buddhistYear.format('DD-MM-YYYY HH:mm');
            patientData["Date Time.Time"] = currentdate.format('HH:mm');

            $timeout(function() {
                defer.resolve();
            });
            return defer.promise;
        };

        function buildReferralData(patientData, filter) {
            var defer = $q.defer();
            $http.get('/mpi/patientvisitreferral/getdetail/' + filter.patientvisituid).
            then(function successCallback(response) {
                var data = response.data;
                var patientvisit = data.patientvisit;

                if (patientvisit && patientvisit.refererdetail) {
                    var refdet = patientvisit.refererdetail;
                    patientData["Referral.Referral Type"] = refdet.reftypeuid && refdet.reftypeuid.valuedescription;
                    patientData["Referral.Referral By"] = refdet.referringorguid && refdet.referringorguid.name;
                    patientData["Referral.Referral Sub Type"] = refdet.refsubtypeuid && refdet.refsubtypeuid.valuedescription;
                }

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildVitalSignData(patientData, filter) {
            var defer = $q.defer();
            var codeOrResultType = ['HEIGHT', 'WEIGHT', 'BMI', 'BSA', 'TEMPERATURE', 'PULSE', 'RESPIRATION', 'SYSBP', 'DIABP', 'O2SATURATION'];

            $http.post('/emr/patientform/getlatestobservation', {
                codeOrResultType: codeOrResultType,
                patientuid: filter.patientuid,
                patientvisituid: filter.patientvisituid
            }).then(function successCallback(response) {
                var data = response.data;

                if (data.observationresult && data.observationresult.length) {
                    var resultObservations = data.observationresult;
                    patientData["Vital Sign.Height"] = getVitalSignData(resultObservations, "HEIGHT");
                    patientData["Vital Sign.Weight"] = getVitalSignData(resultObservations, "WEIGHT");
                    patientData["Vital Sign.BMI"] = getVitalSignData(resultObservations, "BMI");
                    patientData["Vital Sign.BSA"] = getVitalSignData(resultObservations, "BSA");
                    patientData["Vital Sign.Temperature"] = getVitalSignData(resultObservations, "TEMPERATURE");
                    patientData["Vital Sign.Pulse"] = getVitalSignData(resultObservations, "PULSE");
                    patientData["Vital Sign.Respiration Rate"] = getVitalSignData(resultObservations, "RESPIRATION");
                    patientData["Vital Sign.Systolic BP"] = getVitalSignData(resultObservations, "SYSBP");
                    patientData["Vital Sign.Diastolic BP"] = getVitalSignData(resultObservations, "DIABP");
                    patientData["Vital Sign.O2 saturation level"] = getVitalSignData(resultObservations, "O2SATURATION");
                }

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });

            return defer.promise;
        }

        function getVitalSignData(resultObservations, code, isCodeOnly) {
            var result = "";
            var data = null;
            if (!isCodeOnly)
                data = resultObservations.find(function(resultObservation) {
                    return resultObservation.code == code || resultObservation.vitaltype == code;
                });
            else
                data = resultObservations.find(function(resultObservation) {
                    return resultObservation.code == code;
                });

            if (data) {
                var results = [];
                results.push(data.value);
                results.push(data.uom);
                results.push(data.normalrange);
                result = results.join(" ");
            }
            return result;
        }

        function buildObservationData(patientData, filter, codes) {
            var defer = $q.defer();
            $http.post('/emr/patientform/getlatestobservation', {
                codes: codes,
                patientuid: filter.patientuid,
                patientvisituid: filter.patientvisituid
            }).then(function successCallback(response) {
                var data = response.data;

                if (data.observationresult && data.observationresult.length) {
                    for (var i = 0; i < data.observationresult.length; i++) {
                        var code = data.observationresult[i].code;
                        patientData["Observation." + code] = getVitalSignData(data.observationresult, code, true);
                    }
                }

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildAllergyData(patientData, filter, fields) {
            var defer = $q.defer();
            $http.post('/emr/drugalergy/getallactiveallergies', {
                patientuid: filter.patientuid,
                poplatedata: true,
                startoftoday: moment().startOf('day').toDate()
            }).then(function successCallback(response) {
                var data = response.data;
                if (!data.allergies || !data.allergies.length) return defer.resolve();

                var allAllergies = [];
                var drugAllergies = [];
                var foodAllergies = [];
                var otherAllergies = [];
                var allSideEffects = [];
                var drugSideEffects = [];
                var foodSideEffects = [];
                var otherSideEffects = [];
                var noknowndrugallergies = false;

                for (var i = 0; i < data.allergies.length; i++) {
                    if (!data.allergies[i]) continue;

                    if (data.allergies[i].drugallergies && data.allergies[i].drugallergies.length) {
                        for (var j = 0; j < data.allergies[i].drugallergies.length; j++) {
                            var drugalg = data.allergies[i].drugallergies[j];
                            if (!drugalg || !drugalg.isactive) continue;

                            if (drugalg.allergenuid && drugalg.allergenuid.name) {
                                if (drugAllergies.indexOf(drugalg.allergenuid.name) == -1) {
                                    drugAllergies.push(drugalg.allergenuid.name);
                                }
                            } else if (drugalg.druggroupuid && drugalg.druggroupuid.name) {
                                if (drugAllergies.indexOf(drugalg.druggroupuid.name) == -1) {
                                    drugAllergies.push(drugalg.druggroupuid.name);
                                }
                            } else if (drugalg.tradenameuid && drugalg.tradenameuid.name) {
                                if (drugAllergies.indexOf(drugalg.tradenameuid.name) == -1) {
                                    drugAllergies.push(drugalg.tradenameuid.name);
                                }
                            } else if (drugalg.freetext) {
                                if (drugAllergies.indexOf(drugalg.freetext) == -1) {
                                    drugAllergies.push(drugalg.freetext);
                                }
                            }

                            if (drugalg.sideeffects && drugSideEffects.indexOf(drugalg.sideeffects) == -1) {
                                drugSideEffects.push(drugalg.sideeffects);
                            }
                        }
                    }

                    if (data.allergies[i].noknowndrugallergies)
                        noknowndrugallergies = true;

                    if (data.allergies[i].foodallergies && data.allergies[i].foodallergies.length) {
                        for (var j = 0; j < data.allergies[i].foodallergies.length; j++) {
                            var foodalg = data.allergies[i].foodallergies[j];
                            if (!foodalg || !foodalg.isactive) continue;

                            if (foodalg.resultitemuid && foodalg.resultitemuid.name) {
                                if (foodAllergies.indexOf(foodalg.resultitemuid.name) == -1)
                                    foodAllergies.push(foodalg.resultitemuid.name);
                            }

                            if (foodalg.sideeffects && foodSideEffects.indexOf(foodalg.sideeffects) == -1) {
                                foodSideEffects.push(foodalg.sideeffects);
                            }
                        }
                    }

                    if (data.allergies[i].otherallergies && data.allergies[i].otherallergies.length) {
                        for (var j = 0; j < data.allergies[i].otherallergies.length; j++) {
                            var otheralg = data.allergies[i].otherallergies[j];
                            if (!otheralg || !otheralg.isactive || !otheralg.freetext) continue;

                            if (otherAllergies.indexOf(otheralg.freetext) == -1)
                                otherAllergies.push(otheralg.freetext);
                            if (otheralg.sideeffects && otherSideEffects.indexOf(otheralg.sideeffects) == -1) {
                                otherSideEffects.push(otheralg.sideeffects);
                            }
                        }
                    }
                }

                if (!drugAllergies.length && noknowndrugallergies)
                    drugAllergies.push('EMR.NOKNOWNDRUGALLERGIES');

                allAllergies = drugAllergies.concat(foodAllergies);
                allAllergies = allAllergies.concat(otherAllergies);
                allSideEffects = drugSideEffects.concat(foodSideEffects);
                allSideEffects = allSideEffects.concat(otherSideEffects);
                patientData["Allergy.All Allergies"] = allAllergies.join(', ');
                patientData["Allergy.Drug Allergies"] = drugAllergies.join(', ');
                patientData["Allergy.Food Allergies"] = foodAllergies.join(', ');
                patientData["Allergy.Other Allergies"] = otherAllergies.join(', ');
                patientData["Allergy.All Side Effects"] = allSideEffects.join(', ');
                patientData["Allergy.Drug Side Effects"] = drugSideEffects.join(', ');
                patientData["Allergy.Food Side Effects"] = foodSideEffects.join(', ');
                patientData["Allergy.Other Side Effects"] = otherSideEffects.join(', ');

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildTriageData(patientData, filter, fields) {
            var defer = $q.defer();
            $http.post('/emergency/triage/getdetails', {
                patientuid: filter.patientuid,
                patientvisituid: filter.patientvisituid,
                ispatientbanner: true,
            }).then(function successCallback(response) {
                var data = response.data;
                if (!data.triagedetails || !data.triagedetails.length) return defer.resolve();
                var triage = data.triagedetails[0];
                if (!triage || !triage._id) return defer.resolve();

                var chiefCompliant = [];
                if (triage.cchpiuid && triage.cchpiuid.cchpis && triage.cchpiuid.cchpis.length) {
                    triage.cchpiuid.cchpis.forEach(function(item) {
                        if (item.chiefcomplaint) {
                            chiefCompliant.push(item.chiefcomplaint);
                        }

                        if (item.cchpimasteruid && item.cchpimasteruid.name) {
                            chiefCompliant.push(item.cchpimasteruid.name);
                        }
                    });
                }

                patientData["Triage.Chief Complaints"] = chiefCompliant.join(', ');
                patientData["Triage.Present Illness"] = triage.cchpiuid && triage.cchpiuid.presentillness || '';
                patientData["Triage.ESI Level"] = triage.emergencyleveluid && triage.emergencyleveluid.valuedescription || '';
                patientData["Triage.Trauma"] = triage.traumatypeuid && triage.traumatypeuid.valuedescription || '';
                patientData["Triage.GCS Eye"] = triage.gcseyemovementuid && triage.gcseyemovementuid.valuedescription || '';
                patientData["Triage.GCS Motor"] = triage.gcsmotoruid && triage.gcsmotoruid.valuedescription || '';
                patientData["Triage.GCS Verbal"] = triage.gcsverbaluid && triage.gcsverbaluid.valuedescription || '';
                patientData["Triage.GCS Conciousness"] = triage.conciousnessuid && triage.conciousnessuid.valuedescription || '';

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildOrRecordData(patientData, filter, fields) {
            var defer = $q.defer();
            $http.post('/operatingroom/orrecord/getdetail', {
                patientuid: filter.patientuid,
                patientvisituid: filter.patientvisituid,
                limit: 1,
                isipdsummarytab: true,
                loadDiagnosis: (fields.indexOf('Pre-operative Diagnosis') > -1 || fields.indexOf('Post-operative Diagnosis') > -1)
            }).then(function successCallback(response) {
                var data = response.data;
                if (!data.orrecord || !data.orrecord.length) return defer.resolve();
                var orrecord = data.orrecord[0];
                if (!orrecord || !orrecord._id) return defer.resolve();

                var procedures = [];
                var equipments = [];
                var surgeons = [];
                var anaesthetist = [];
                var primarySurgeons = [];
                var secondarySurgeons = [];
                var orCareTeams = [];
                var assistNurse = [];
                var circulateNurse = [];
                var scrubNurse = [];
                var implantitemdetails = [];
                var preOpDiagnosis = [];
                var postOpDiagnosis = [];

                if (orrecord.procedures) {
                    orrecord.procedures.forEach(function(ritem) {
                        if (ritem.procedureuid && ritem.procedureuid.name)
                            procedures.push(ritem.procedureuid.name);
                    });
                }

                if (orrecord.equipmentdetails) {
                    orrecord.equipmentdetails.forEach(function(ritem) {
                        if (ritem.locationuid && ritem.locationuid.name)
                            equipments.push(ritem.locationuid.name);
                    });
                }

                if (orrecord.surgeons) {
                    orrecord.surgeons.forEach(function(ritem) {
                        if (!ritem.careprovideruid || !ritem.careprovideruid.name || !ritem.roleuid || !ritem.roleuid.relatedvalue) return;

                        surgeons.push(ritem.careprovideruid.name);
                        if (ritem.roleuid.relatedvalue == 'P')
                            primarySurgeons.push(ritem.careprovideruid.name);
                        else if (ritem.roleuid.relatedvalue == 'S')
                            secondarySurgeons.push(ritem.careprovideruid.name);
                    });
                }

                if (orrecord.anaesthetistdetails) {
                    orrecord.anaesthetistdetails.forEach(function(ritem) {
                        if (ritem.anaesthetistuid && ritem.anaesthetistuid.name)
                            anaesthetist.push(ritem.anaesthetistuid.name);
                    });
                }

                if (orrecord.nursedetails) {
                    orrecord.nursedetails.forEach(function(ritem) {
                        if (!ritem.nurseuid || !ritem.nurseuid.name || !ritem.typeuid || !ritem.typeuid.relatedvalue) return;

                        orCareTeams.push(ritem.nurseuid.name);
                        if (ritem.typeuid.relatedvalue == 'ASSISTANT NURSE')
                            assistNurse.push(ritem.nurseuid.name);
                        else if (ritem.typeuid.relatedvalue == 'CIRCULATE NURSE')
                            circulateNurse.push(ritem.nurseuid.name);
                        else if (ritem.typeuid.relatedvalue == 'SCRUB NURSE')
                            scrubNurse.push(ritem.nurseuid.name);
                    });
                }

                if (orrecord.implantitemdetails) {
                    orrecord.implantitemdetails.forEach(function(ritem) {
                        if (ritem.itemmasteruid && ritem.itemmasteruid.name)
                            implantitemdetails.push(ritem.itemmasteruid.name);
                    });
                }

                if (data.diagnosis && data.diagnosis.length) {
                    data.diagnosis.forEach(function(diitem) {
                        if (!diitem.diagnosis || !diitem.diagnosis.length) return;
                        diitem.diagnosis.forEach(function(sditem) {
                            if (!sditem.problemuid || !sditem.encounterstageuid) return;
                            if (sditem.encounterstageuid.valuecode == 'ENTSTG3')
                                preOpDiagnosis.push(sditem.problemuid.code + ' - ' + sditem.problemuid.name);
                            if (sditem.encounterstageuid.valuecode == 'ENTSTG4')
                                postOpDiagnosis.push(sditem.problemuid.code + ' - ' + sditem.problemuid.name);
                        });
                    });
                }

                patientData["OR Record.Operating Room"] = orrecord.operatingroomuid && orrecord.operatingroomuid.name;
                patientData["OR Record.Theatre In Date"] = getDateString(orrecord.theatreindate);
                patientData["OR Record.Theatre In Time"] = getTimeString(orrecord.theatreindate);
                patientData["OR Record.Theatre In Date & Time"] = getDateAndTimeString(orrecord.theatreindate);
                patientData["OR Record.Theatre Out Date"] = getDateString(orrecord.theatreoutdate);
                patientData["OR Record.Theatre Out Time"] = getTimeString(orrecord.theatreoutdate);
                patientData["OR Record.Theatre Out Date & Time"] = getDateAndTimeString(orrecord.theatreoutdate);
                patientData["OR Record.Anaesthesia Start Date"] = getDateString(orrecord.anaesthesiastartdate);
                patientData["OR Record.Anaesthesia Start Time"] = getTimeString(orrecord.anaesthesiastartdate);
                patientData["OR Record.Anaesthesia Start Date & Time"] = getDateAndTimeString(orrecord.anaesthesiastartdate);
                patientData["OR Record.Anaesthesia End Date"] = getDateString(orrecord.anaesthesiaenddate);
                patientData["OR Record.Anaesthesia End Time"] = getTimeString(orrecord.anaesthesiaenddate);
                patientData["OR Record.Anaesthesia End Date & Time"] = getDateAndTimeString(orrecord.anaesthesiaenddate);
                patientData["OR Record.Recovery Bay Start Date"] = getDateString(orrecord.recoverybaystartdate);
                patientData["OR Record.Recovery Bay Start Time"] = getTimeString(orrecord.recoverybaystartdate);
                patientData["OR Record.Recovery Bay Start Date & Time"] = getDateAndTimeString(orrecord.recoverybaystartdate);
                patientData["OR Record.Recovery Bay End Date"] = getDateString(orrecord.recoverybayenddate);
                patientData["OR Record.Recovery Bay End Time"] = getTimeString(orrecord.recoverybayenddate);
                patientData["OR Record.Recovery Bay End Date & Time"] = getDateAndTimeString(orrecord.recoverybayenddate);
                patientData["OR Record.Procedure Start Date"] = getDateString(orrecord.procedurestartdate);
                patientData["OR Record.Procedure Start Time"] = getTimeString(orrecord.procedurestartdate);
                patientData["OR Record.Procedure Start Date & Time"] = getDateAndTimeString(orrecord.procedurestartdate);
                patientData["OR Record.Procedure End Date"] = getDateString(orrecord.procedureenddate);
                patientData["OR Record.Procedure End Time"] = getTimeString(orrecord.procedureenddate);
                patientData["OR Record.Procedure End Date & Time"] = getDateAndTimeString(orrecord.procedureenddate);
                patientData["OR Record.Reason For Procedure"] = orrecord.reasonforprocedure;
                patientData["OR Record.Procedure Free Text"] = orrecord.proceduretext;
                patientData["OR Record.Procedures"] = procedures.join(', ');
                patientData["OR Record.Surgeon Notes"] = orrecord.surgeonnotes;
                patientData["OR Record.Equipments"] = equipments.join(', ');
                patientData["OR Record.Tourniquets"] = orrecord.tourniquestdetails && orrecord.tourniquestdetails.tourniquestpressureuid && orrecord.tourniquestdetails.tourniquestpressureuid.valuedescription;
                patientData["OR Record.All Surgeons"] = surgeons.join(', ');
                patientData["OR Record.Primary Surgeons"] = primarySurgeons.join(', ');
                patientData["OR Record.Secondary Surgeons"] = secondarySurgeons.join(', ');
                patientData["OR Record.All Anaesthetist"] = anaesthetist.join(', ');
                patientData["OR Record.OR Care Teams"] = orCareTeams.join(', ');
                patientData["OR Record.Assistant Nurse"] = assistNurse.join(', ');
                patientData["OR Record.Circulate Nurse"] = circulateNurse.join(', ');
                patientData["OR Record.Scrub Nurse"] = scrubNurse.join(', ');
                patientData["OR Record.Status"] = orrecord.procedurestatusuid && orrecord.procedurestatusuid.valuedescription;
                patientData["OR Record.Planning Type"] = orrecord.planningtypeuid && orrecord.planningtypeuid.valuedescription;
                patientData["OR Record.Criticality"] = orrecord.criticalityuid && orrecord.criticalityuid.valuedescription;
                patientData["OR Record.Sponge Count"] = orrecord.spongedetails && orrecord.spongedetails.spongecountuid && orrecord.spongedetails.spongecountuid.valuedescription;
                patientData["OR Record.Wound Type"] = orrecord.wounddetails && orrecord.wounddetails.woundtypeuid && orrecord.wounddetails.woundtypeuid.valuedescription;
                patientData["OR Record.Implant Details"] = implantitemdetails.join(', ');
                patientData["OR Record.Implant Details Free Text"] = orrecord.implantdetails;
                patientData["OR Record.Pre-operative Diagnosis"] = preOpDiagnosis.join(', ');
                patientData["OR Record.Post-operative Diagnosis"] = postOpDiagnosis.join(', ');

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildEmergencyData(patientData, filter, fields) {
            var defer = $q.defer();
            $http.post('/emergency/emergencydetail/getdetail', {
                patientuid: filter.patientuid,
                patientvisituid: filter.patientvisituid
            }).then(function successCallback(response) {
                var data = response.data;
                if (!data.emergencydetail || !data.emergencydetail) return defer.resolve();
                var emergencydetail = data.emergencydetail;

                var incidentdate = '';
                var incidenttime = '';
                if (!!emergencydetail.incidentdate)
                    incidentdate = getDateString(emergencydetail.incidentdate);
                if (!!emergencydetail.incidenttime)
                    // incidenttime = moment(emergencydetail.incidenttime).format('HH:mm');

                patientData["Emergency.Incident Date"] = incidentdate;
                patientData["Emergency.Incident Time"] = incidenttime;

                defer.resolve();
            }, function errorCallback(errresponse) {
                var data = errresponse.data;
                defer.resolve();
            });
            return defer.promise;
        }

        function buildOtherData(patientData) {
            var defer = $q.defer();
            patientData["Others.Page No"] = '{{page}}';
            patientData["Others.Total Pages"] = '{{pages}}';
            $timeout(function() {
                defer.resolve();
            });
            return defer.promise;
        }

        return obj;
    });

})();