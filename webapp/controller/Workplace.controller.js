sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    function (Controller, Filter, FilterOperator, JSONModel, MessageBox, Fragment) {
        "use strict";

        return Controller.extend("poc.controller.Workplace", {
            onInit: function () {
                const oDebitVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oDebitVisualFiltersModel, "DebitVisualFiltersModel");

                const oOTCVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oOTCVisualFiltersModel, "OTCVisualFiltersModel");

                const oEMTSVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oEMTSVisualFiltersModel, "EMTSVisualFiltersModel");
            },
            onRowSelectionChange: function (oEvent) {

            },
            onDisplayLogs: async function (sId) {
                let oTable = this.getView()?.byId(sId);
                const oView = this.getView();
                if (oTable.getSelectedIndices().length > 0) {
                    let oSelectedObjectID = oTable.getContextByIndex(oTable.getSelectedIndices()[0])?.getProperty("objectId");
                    if (!this.oDisplayLog) {
                        this.oDisplayLog = await Fragment.load({
                            id: oView?.getId(),
                            name: "poc.fragment.DisplayLog",
                            controller: this,
                        }).then((oDialog) => {
                            oView?.addDependent(oDialog);
                            this.oDisplayLog = oDialog;
                            return this.oDisplayLog;
                        });
                    }
                    //@ts-ignore
                    this.oDisplayLog._searchField.setVisible(false);;
                    let oLogBindings = this.oDisplayLog.getBinding("items");
                    let aFilter = new Filter({
                        filters: [
                            new Filter("object", FilterOperator.EQ, oSelectedObjectID),
                            new Filter("messageClass", FilterOperator.EQ, '01'),
                        ],
                        and: true
                    });
                    oLogBindings.filter(aFilter);
                    this.oDisplayLog.open();
                } else {
                    MessageToast.show("Please select atleast one row to see the logs");
                }
            },
            onDisplayLogsDialogClose: function (oEvent) {
                this.unSelectRowFromTable();
            },
            onSelect: async function (oEvent) {
                var oItem = oEvent.getParameter("item");
                let sPageID = this.getView().createId(oItem.getKey());
                this.byId("pageContainer").to(sPageID);
                this.byId("idAdaptFilters").setSelectedKey("compact");
                this.onToggleBetweenCompactAndVisualFilters(undefined,"compact")
            },

            onPostInventory: function () {
                let oMainTable = this.getView()?.byId("RVO");
                if (oMainTable.getSelectedIndices().length > 0) {
                    let oSelectedObjectID = oMainTable.getContextByIndex(oMainTable.getSelectedIndices()[0])?.getProperty("ID");
                    let oDataModel = this.getView()?.getModel();
                    const that = this;
                    oDataModel.callFunction("/postToInventory", {
                        method: "POST",
                        urlParameters: {
                            "objectKey": oSelectedObjectID
                        },
                        success: function (oDataReceived) {
                            if (oDataReceived.postToInventory.messageType && oDataReceived.postToInventory.message) {
                                if (oDataReceived.postToInventory.messageType === 'S') {
                                    MessageBox.success(oDataReceived.postToInventory.message, {
                                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                        onClose: () => {
                                            that.unSelectRowFromTable();
                                            that.makeSmartTableRebind();
                                        }
                                    });
                                } else {
                                    MessageBox.error(oDataReceived.postToInventory.message, {
                                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                        onClose: () => {
                                            that.unSelectRowFromTable();
                                        }
                                    });
                                }
                            }
                        },
                        error: function (oErrorReceived) {
                            if (oErrorReceived.postToInventory.message) {
                                MessageBox.error(oErrorReceived.postToInventory.message, {
                                    styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
                                });
                            }
                        }
                    });

                } else {
                    // const sWarningText = this.oResourceBundle.getText("warningText") || "Please select atleast one row to see the logs";
                    MessageBox.error("Please select atleast one row to post inventory");
                }
            },
            onReverseInventory: function () {
                let oMainTable = this.getView().byId("RVO");
                if (oMainTable.getSelectedIndices().length > 0) {
                    const oSelectedContext = oMainTable.getContextByIndex(oMainTable.getSelectedIndices()[0]);
                    let oParams = {
                        "objectKey": oSelectedContext.getProperty("ID"),
                        "reverseData": {
                            "MaterialDoc": oSelectedContext.getProperty("fuelOnwardMaterialalDocumentNumber"),
                            "ReverseMaterialDoc": oSelectedContext.getProperty("fuelReversalMaterialalDocumentNumber"),
                            "ReverseMaterialDocItem": oSelectedContext.getProperty("fuelReversalMaterialentItemNumber"),
                            "ReverseMaterialDocYear": oSelectedContext.getProperty("fuelReversalMaterialialDocumentYear")
                        }
                    };
                    let oDataModel = this.getView()?.getModel();
                    const that = this;
                    // oDataModel.callFunction("/processReverseInvPost", {
                    //     method: "POST",
                    //     urlParameters: oParams,
                    //     success: function (oDataReceived) {
                    //         if (oDataReceived.postToInventory.messageType && oDataReceived.postToInventory.message) {
                    //             if (oDataReceived.postToInventory.messageType === 'S') {
                    //                 MessageBox.success(oDataReceived.postToInventory.message, {
                    //                     styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                    //                     onClose: () => {
                    //                         that.unSelectRowFromTable();
                    //                         that.makeSmartTableRebind();
                    //                     }
                    //                 });
                    //             } else {
                    //                 MessageBox.error(oDataReceived.postToInventory.message, {
                    //                     styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                    //                     onClose: () => {
                    //                         that.unSelectRowFromTable();
                    //                     }
                    //                 });
                    //             }
                    //         }
                    //     },
                    //     error: function (oErrorReceived) {
                    //         if (oErrorReceived.postToInventory.message) {
                    //             MessageBox.error(oErrorReceived.postToInventory.message, {
                    //                 styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
                    //             });
                    //         }
                    //     }
                    // });

                } else {
                    // const sWarningText = this.oResourceBundle.getText("warningText") || "Please select atleast one row to see the logs";
                    MessageBox.error("Please select atleast one row to reverse inventory");
                }
            },
            unSelectRowFromTable: function () {
                ["idDebitTable","idEMTSTable","idOTCTable"].forEach(function(sId){
                    this.byId(sId).setSelectedIndex(-1);
                }.bind(this));
            },
            makeSmartTableRebind: function () {
                let oSmartTable = this.getView()?.byId("smartTable");
                oSmartTable.rebindTable(true);
            },
            onToggleBetweenCompactAndVisualFilters: function (oEvent, sKey) {
                let oIDMapping = {
                    'idEMTSDynamicPage': ["idEMTSVisualFilter", "idEMTSSmartFilterBar"],
                    'idOTCDynamicPage': ["idOTCVisualFilter", "idOTCSmartFilterBar"],
                    'idDebitDynamicPage':["idDebitVisualFilter","idDebitSmartFilterBar"]
                }
                let oSelectedPageID = this.getView().byId("sideNavigation").getSelectedKey();
                let sVisualFilterID = oIDMapping[oSelectedPageID][0]
                let sFilterBarID = oIDMapping[oSelectedPageID][1];
                let sSelectedKey;
                if (oEvent) {
                    sSelectedKey = oEvent.getParameter("item")?.getKey();
                } else {
                    sSelectedKey = sKey;
                }

                if (sSelectedKey === "visual") {
                    this.getView().byId(sVisualFilterID).setVisible(true);
                    this.getView().byId(sFilterBarID).setVisible(false);
                } else {
                    this.getView().byId(sFilterBarID).setVisible(true);
                    this.getView().byId(sVisualFilterID).setVisible(false);
                }
            },
            onSideNavButtonPress: function () {
                var oToolPage = this.byId("toolPage");
                var bSideExpanded = oToolPage.getSideExpanded();

                this._setToggleButtonTooltip(bSideExpanded);

                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            },
            _setToggleButtonTooltip: function (bLarge) {
                var oToggleButton = this.byId('sideNavigationToggleButton');
                if (bLarge) {
                    oToggleButton.setTooltip('Large Size Navigation');
                } else {
                    oToggleButton.setTooltip('Small Size Navigation');
                }
            },
            onOTCSelectionChanged: function (oEvent, sKey) {
                let aSegments = oEvent.getParameter("selectedSegments");
                let oSmartTable = this.getView()?.byId("idOTCSmartTable");
                let oTable = oSmartTable?.getTable();
                let oBindings = oTable.getBinding("rows");
                let oFilterModel = this.getView()?.getModel("OTCVisualFiltersModel");
                let aExistingFilters = oFilterModel.getProperty("/filters");
                let aSelectedFilters = [];
                let aRemainingSelectedFilters = [];
                let aTotalSelectedVisualFilters = [];
                if (oEvent.getParameter("selected")) {
                    if (oBindings) {
                        aSegments.forEach((oSegement) => {
                            if (sKey) {
                                aSelectedFilters.push(new Filter(sKey, FilterOperator.EQ, oSegement.getBindingContext()?.getProperty(sKey)))
                            }
                        });
                    };
                    aTotalSelectedVisualFilters = aExistingFilters.concat(aSelectedFilters);
                } else {
                    let sLabelValue = oEvent.getParameter("segment")?.getBindingContext()?.getProperty(sKey);
                    aRemainingSelectedFilters = aExistingFilters.filter((oFilter) => {
                        if (!(oFilter.sPath === sKey && oFilter?.oValue1 === sLabelValue)) {
                            return oFilter;
                        }
                    })
                    aTotalSelectedVisualFilters = aRemainingSelectedFilters;
                };
                let aTotalUniqueVisualFilters = this.getUniqueFilters(aTotalSelectedVisualFilters);
                oFilterModel.setProperty("/filters", aTotalUniqueVisualFilters);
                oBindings.filter(aTotalUniqueVisualFilters.length === 0 ? [] : aTotalUniqueVisualFilters);
                // this.setValuesInCompactFilter(aTotalUniqueVisualFilters);

            },
            onDebitSelectionChanged: function (oEvent, sKey) {
                let aSegments = oEvent.getParameter("selectedSegments");
                let oSmartTable = this.getView()?.byId("idDebitSmartTable");
                let oTable = oSmartTable?.getTable();
                let oBindings = oTable.getBinding("rows");
                let oFilterModel = this.getView()?.getModel("DebitVisualFiltersModel");
                let aExistingFilters = oFilterModel.getProperty("/filters");
                let aSelectedFilters = [];
                let aRemainingSelectedFilters = [];
                let aTotalSelectedVisualFilters = [];
                if (oEvent.getParameter("selected")) {
                    if (oBindings) {
                        aSegments.forEach((oSegement) => {
                            if (sKey) {
                                aSelectedFilters.push(new Filter(sKey, FilterOperator.EQ, oSegement.getBindingContext()?.getProperty(sKey)))
                            }
                        });
                    };
                    aTotalSelectedVisualFilters = aExistingFilters.concat(aSelectedFilters);
                } else {
                    let sLabelValue = oEvent.getParameter("segment")?.getBindingContext()?.getProperty(sKey);
                    aRemainingSelectedFilters = aExistingFilters.filter((oFilter) => {
                        if (!(oFilter.sPath === sKey && oFilter?.oValue1 === sLabelValue)) {
                            return oFilter;
                        }
                    })
                    aTotalSelectedVisualFilters = aRemainingSelectedFilters;
                };
                let aTotalUniqueVisualFilters = this.getUniqueFilters(aTotalSelectedVisualFilters);
                oFilterModel.setProperty("/filters", aTotalUniqueVisualFilters);
                oBindings.filter(aTotalUniqueVisualFilters.length === 0 ? [] : aTotalUniqueVisualFilters);
            },

            onEMTSSelectionChanged: function (oEvent, sKey) {
                let aSegments = oEvent.getParameter("selectedSegments");
                let oSmartTable = this.getView()?.byId("idEMTSSmartTable");
                let oTable = oSmartTable?.getTable();
                let oBindings = oTable.getBinding("rows");
                let oFilterModel = this.getView()?.getModel("EMTSVisualFiltersModel");
                let aExistingFilters = oFilterModel.getProperty("/filters");
                let aSelectedFilters = [];
                let aRemainingSelectedFilters = [];
                let aTotalSelectedVisualFilters = [];
                if (oEvent.getParameter("selected")) {
                    if (oBindings) {
                        aSegments.forEach((oSegement) => {
                            if (sKey) {
                                aSelectedFilters.push(new Filter(sKey, FilterOperator.EQ, oSegement.getBindingContext()?.getProperty(sKey)))
                            }
                        });
                    };
                    aTotalSelectedVisualFilters = aExistingFilters.concat(aSelectedFilters);
                } else {
                    let sLabelValue = oEvent.getParameter("segment")?.getBindingContext()?.getProperty(sKey);
                    aRemainingSelectedFilters = aExistingFilters.filter((oFilter) => {
                        if (!(oFilter.sPath === sKey && oFilter?.oValue1 === sLabelValue)) {
                            return oFilter;
                        }
                    })
                    aTotalSelectedVisualFilters = aRemainingSelectedFilters;
                };
                let aTotalUniqueVisualFilters = this.getUniqueFilters(aTotalSelectedVisualFilters);
                oFilterModel.setProperty("/filters", aTotalUniqueVisualFilters);
                oBindings.filter(aTotalUniqueVisualFilters.length === 0 ? [] : aTotalUniqueVisualFilters);
            },
            onDebitBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
                let sSubObjectScenerio = this.getView()?.byId("idDebitSubObjectScenerio").getSelectedKey();
                let oDocumentDate = this.getView()?.byId("idDebitDocumentRangeSelection");
                if (oDocumentDate && oDocumentDate.length > 0) {
                    let oValue1 = oDocumentDate.split(" – ")[0];
                    let oValue2 = oVintageYear.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "documentDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
                if (sSubObjectScenerio) {
                    oBindingParams.filters?.push(new Filter({
                        path: "subObjectScenario",
                        operator: FilterOperator.EQ,
                        value1: sSubObjectScenerio
                    }));
                }
            },
            onEMTSBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
                let oTransferDate = this.getView()?.byId("idEMTSTransferDateRangeSelection");
                let oSubmissionDate = this.getView()?.byId("idEMTSsubmissionDateRangeSelection");
                let oRINYear = this.getView()?.byId("idEMTSVintageYear").getDOMValue();
                if (oRINYear && oRINYear.length > 0) {
                    let oValue1 = oRINYear.split(" – ")[0];
                    let oValue2 = oRINYear.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "vintageYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oTransferDate && oTransferDate.length > 0) {
                    let oValue1 = oTransferDate.split(" – ")[0];
                    let oValue2 = oTransferDate.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "transferDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
                if (oSubmissionDate && oSubmissionDate.length > 0) {
                    let oValue1 = oSubmissionDate.split(" – ")[0];
                    let oValue2 = oSubmissionDate.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "submissionDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
            },
            onMADJBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
                
            },
            onRINRFBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
            },
            onOTCBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
                let oVintageYear = this.getView()?.byId("idOTCVintageYear").getDOMValue();
                let oDocumentDate = this.getView()?.byId("idOTCDocumentRangeSelection");
                let oComplianceYear = this.getView()?.byId("idOTCComplianceYear").getDOMValue();
                if (oVintageYear && oVintageYear.length > 0) {
                    let oValue1 = oVintageYear.split(" – ")[0];
                    let oValue2 = oVintageYear.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "vintageYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oComplianceYear && oComplianceYear.length > 0) {
                    let oValue1 = oComplianceYear.split(" – ")[0];
                    let oValue2 = oComplianceYear.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "renewablesDocumentComplianceYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oDocumentDate && oDocumentDate.length > 0) {
                    let oValue1 = oDocumentDate.split(" – ")[0];
                    let oValue2 = oVintageYear.split(" – ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "documentDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
            },
            getUniqueFilters: function (aFilters) {
                const uniqueFiltersSet = new Set();
                aFilters.forEach(oFilter => {
                    const sFilterString = JSON.stringify(oFilter);
                    uniqueFiltersSet.add(sFilterString);
                });
                const aUniqueFiltersArray = Array.from(uniqueFiltersSet).map(filterString => JSON.parse(filterString));
                return aUniqueFiltersArray;
            }
        });
    });
