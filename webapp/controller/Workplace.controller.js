sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    function (Controller, Filter, FilterOperator, JSONModel, MessageBox, Fragment) {
        "use strict";

        return Controller.extend("zfsrenewwrkplc.controller.Workplace", {
            onInit: function () {
                const oDebitVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oDebitVisualFiltersModel, "DebitVisualFiltersModel");

                const oOTCVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oOTCVisualFiltersModel, "OTCVisualFiltersModel");

                const oEMTSVisualFiltersModel = new JSONModel({ filters: [] });
                this.getView()?.setModel(oEMTSVisualFiltersModel, "EMTSVisualFiltersModel");

                const oLogModel = new JSONModel();
                this.getView()?.setModel(oLogModel, "Logs");

                const oComments = new JSONModel({
                    "internal": [{
                        "sender": "Sender 1",
                        "text": "Internal Comment 1",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 2",
                        "text": "Internal Comment 2",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 3",
                        "text": "Internal Comment 3",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 1",
                        "text": "Internal Comment 4",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    }, {
                        "sender": "Sender 2",
                        "text": "Internal Comment 5",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 3",
                        "text": "Internal Comment 6",
                        "Date": new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 2",
                        "text": "Internal Comment 7",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    },
                    {
                        "sender": "Sender 3",
                        "text": "Internal Comment 8",
                        "Date":new Date().toLocaleDateString() +" at "+ new Date().toLocaleTimeString()
                    }],
                    "external": [{
                        "sender": "Sender 1",
                        "text": "External Comment 1"
                    },
                    {
                        "sender": "Sender 2",
                        "text": "External Comment 2"
                    },
                    {
                        "sender": "Sender 3",
                        "text": "External Comment 3"
                    },
                    {
                        "sender": "Sender 1",
                        "text": "External Comment 4"
                    }, {
                        "sender": "Sender 2",
                        "text": "External Comment 5"
                    },
                    {
                        "sender": "Sender 3",
                        "text": "External Comment 6"
                    },
                    {
                        "sender": "Sender 2",
                        "text": "External Comment 7"
                    },
                    {
                        "sender": "Sender 3",
                        "text": "External Comment 8"
                    }]
                });
                this.getView()?.setModel(oComments, "comments");

                this.getUserInfo();
            },
            getI18nText: function (sProperty) {
                return this.getOwnerComponent().getModel("i18n")?.getProperty(sProperty);
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
                            name: "zfsrenewwrkplc.fragment.DisplayLog",
                            controller: this,
                        }).then((oDialog) => {
                            oView?.addDependent(oDialog);
                            this.oDisplayLog = oDialog;
                            return this.oDisplayLog;
                        });
                    }
                    this.oDisplayLog._searchField.setVisible(false);
                    let oModel = this.getOwnerComponent().getModel();
                    this.getView().setBusy(true);
                    oModel.read("/GetLogs", {
                        filters: [
                            new Filter("object", FilterOperator.EQ, oSelectedObjectID),
                            new Filter("messageClass", FilterOperator.EQ, '01'),
                        ],
                        success: function (oData) {
                            this.getView().getModel("Logs").setSizeLimit(oData.results.length);
                            oData.results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                            this.getView().getModel("Logs").setData(oData.results);
                            this.oDisplayLog.setModel(this.getView().getModel("Logs"));
                            this.getView().setBusy(false);
                            this.oDisplayLog.open();
                        }.bind(this),
                        error: function () {
                            this.getView().setBusy(false);
                            MessageBox.error(this.getI18nText("unableFetchLogs"));
                        }.bind(this)
                    });
                } else {
                    MessageBox.error(this.getI18nText("selectAtleastOneRow"));
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
                this.onToggleBetweenCompactAndVisualFilters(undefined, "compact");
            },

            onPostInventory: function (sTableID) {
                let oTable = this.getView()?.byId(sTableID).getTable();
                if (oTable.getSelectedIndices().length > 0) {
                    let oSelectedObjectID = oTable.getContextByIndex(oTable.getSelectedIndices()[0])?.getProperty("ID");
                    let sRegulationQuantity = oTable.getContextByIndex(oTable.getSelectedIndices()[0])?.getProperty("regulationQuantity");
                    if (sRegulationQuantity <= 0) {
                        this.unSelectRowFromTable();
                        MessageBox.error(this.getI18nText("zeroRegulationQty"));
                        return;
                    }
                    let oDataModel = this.getView()?.getModel();
                    const that = this;
                    this.getView().setBusy(true);
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
                                            that.makeSmartTableRebind(sTableID);
                                            that.getView().setBusy(false);
                                        }
                                    });
                                } else {
                                    MessageBox.error(oDataReceived.postToInventory.message, {
                                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                        onClose: () => {
                                            that.unSelectRowFromTable();
                                            that.getView().setBusy(false);
                                        }
                                    });
                                }
                            }
                        },
                        error: function (oErrorReceived) {
                            if (oErrorReceived.responseText) {
                                MessageBox.error(oErrorReceived.responseText, {
                                    styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                    onClose: () => {
                                        that.unSelectRowFromTable();
                                        that.getView().setBusy(false);
                                    }
                                });
                            }
                        }
                    });

                } else {
                    // const sWarningText = this.oResourceBundle.getText("warningText") || "Please select atleast one row to see the logs";
                    MessageBox.error(this.getI18nText("noRow"));
                }
            },
            onReverseInventory: function (sTableID) {
                let oDebitTable = this.getView().byId(sTableID).getTable();
                if (oDebitTable.getSelectedIndices().length > 0) {
                    const oSelectedContext = oDebitTable.getContextByIndex(oDebitTable.getSelectedIndices()[0]);
                    // let oReverseData = {          
                    //     "MaterialDoc": oSelectedContext.getProperty("fuelOnwardMaterialalDocumentNumber"),
                    //     "ReverseMaterialDoc": oSelectedContext.getProperty("fuelReversalMaterialalDocumentNumber"),
                    //     "ReverseMaterialDocItem": oSelectedContext.getProperty("fuelReversalMaterialentItemNumber"),
                    //     "ReverseMaterialDocYear": oSelectedContext.getProperty("fuelReversalMaterialialDocumentYear")
                    // };
                    // let oParams ={};
                    let oSelectedObjectID = oSelectedContext.getProperty("ID");
                    let sRegulationQuantity = oSelectedContext.getProperty("regulationQuantity");
                    if (sRegulationQuantity <= 0) {
                        this.unSelectRowFromTable();
                        MessageBox.error(this.getI18nText("zeroRegulationQty"));
                        return;
                    }
                    // oParams.reverse=JSON.stringify(oReverseData);
                    let oDataModel = this.getView()?.getModel();
                    const that = this;
                    this.getView().setBusy(true);
                    oDataModel.callFunction("/processReverseInvPost", {
                        method: "POST",
                        urlParameters: {
                            "objectKey": oSelectedObjectID
                        },
                        success: function (oDataReceived) {
                            if (oDataReceived.processReverseInvPost.messageType && oDataReceived.processReverseInvPost.message) {
                                if (oDataReceived.processReverseInvPost.messageType === 'S') {
                                    MessageBox.success(oDataReceived.processReverseInvPost.message, {
                                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                        onClose: () => {
                                            that.unSelectRowFromTable();
                                            that.makeSmartTableRebind(sTableID);
                                            that.getView().setBusy(false);
                                        }
                                    });
                                } else {
                                    MessageBox.error(oDataReceived.processReverseInvPost.message, {
                                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                        onClose: () => {
                                            that.unSelectRowFromTable();
                                            that.getView().setBusy(false);
                                        }
                                    });
                                }
                            }
                        },
                        error: function (oErrorReceived) {
                            if (oErrorReceived.responseText) {
                                MessageBox.error(oErrorReceived.responseText, {
                                    styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer",
                                    onClose: () => {
                                        that.unSelectRowFromTable();
                                        that.getView().setBusy(false);
                                    }
                                });
                            }
                        }
                    });

                } else {
                    // const sWarningText = this.oResourceBundle.getText("warningText") || "Please select atleast one row to see the logs";
                    MessageBox.error(this.getI18nText("noRow"));
                }
            },
            unSelectRowFromTable: function () {
                ["idDebitTable", "idEMTSTable", "idOTCTable"].forEach(function (sId) {
                    this.byId(sId).setSelectedIndex(-1);
                }.bind(this));
            },
            makeSmartTableRebind: function (sID) {
                let oSmartTable = this.getView()?.byId(sID);
                oSmartTable.rebindTable();
            },
            onToggleBetweenCompactAndVisualFilters: function (oEvent, sKey) {
                let oIDMapping = {
                    'idEMTSDynamicPage': ["idEMTSVisualFilter", "idEMTSSmartFilterBar"],
                    'idOTCDynamicPage': ["idOTCVisualFilter", "idOTCSmartFilterBar"],
                    'idDebitDynamicPage': ["idDebitVisualFilter", "idDebitSmartFilterBar"],
                    'idRINRFDynamicPage': ["idRINRFVisualFilter", "idRINRFSmartFilterBar"],
                    'idMADJDynamicPage': ["idMADJVisualFilter", "idMADJSmartFilterBar"]
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
                let sSubObjectScenerios = this.getView()?.byId("idDebitSubObjectScenerio").getSelectedKeys();
                let oDocumentDate = this.getView()?.byId("idDebitDocumentRangeSelection").getDOMValue();
                if (oDocumentDate && oDocumentDate.length > 0) {
                    let oValue1 = oDocumentDate.split(" - ")[0];
                    let oValue2 = oDocumentDate.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "documentDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
                if (sSubObjectScenerios.length > 0) {
                    sSubObjectScenerios.forEach((sSubObjectScenerio) => {
                        oBindingParams.filters?.push(new Filter({
                            path: "subObjectScenario",
                            operator: FilterOperator.EQ,
                            value1: sSubObjectScenerio
                        }));
                    })
                }

            },
            onEMTSBeforeRebindTable: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams")
                let oTransferDate = this.getView()?.byId("idEMTSTransferDateRangeSelection").getDOMValue();
                let oSubmissionDate = this.getView()?.byId("idEMTSsubmissionDateRangeSelection").getDOMValue();
                let oRINYear = this.getView()?.byId("idEMTSVintageYear").getDOMValue();
                // let sMatchUnMatch = this.getView()?.byId("idEMTSMatchUnMatch").getSelectedKey();
                // if (sMatchUnMatch !== 'All') {
                //     let sOperator = sMatchUnMatch.split("_")[0];
                //     let andOrBoolean = sMatchUnMatch.split("_")[1] === 'and' ? true : false ; 
                //     let aFilters= [new Filter({
                //         path: "reconcilliationGroupID",
                //         operator: sOperator,
                //         value1: null
                //     }),new Filter({
                //         path: "reconcilliationGroupID",
                //         operator: sOperator,
                //         value1: ''
                //     })];  
                //     oBindingParams.filters?.push(new Filter({
                //         filters: aFilters,
                //         and: andOrBoolean,
                //     }));
                // }
                if (oRINYear && oRINYear.length > 0) {
                    let oValue1 = oRINYear.split(" - ")[0];
                    let oValue2 = oRINYear.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "vintageYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oTransferDate && oTransferDate.length > 0) {
                    let oValue1 = oTransferDate.split(" - ")[0];
                    let oValue2 = oTransferDate.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "transferDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
                if (oSubmissionDate && oSubmissionDate.length > 0) {
                    let oValue1 = oSubmissionDate.split(" - ")[0];
                    let oValue2 = oSubmissionDate.split(" - ")[1] || oValue1;
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
                let oDocumentDate = this.getView()?.byId("idOTCDocumentRangeSelection").getDOMValue();
                let oComplianceYear = this.getView()?.byId("idOTCComplianceYear").getDOMValue();
                let sSubObjectScenerios = this.getView()?.byId("idRINSubObjectScenerio").getSelectedKeys();
                // let sMatchUnMatch = this.getView()?.byId("idMatchUnMatch").getSelectedKey();
                // if (sMatchUnMatch !== 'All') {
                //     let sOperator = sMatchUnMatch.split("_")[0];
                //     let andOrBoolean = sMatchUnMatch.split("_")[1] === 'and' ? true : false ; 
                //     let aFilters= [new Filter({
                //         path: "reconcilliationGroupID",
                //         operator: sOperator,
                //         value1: null
                //     }),new Filter({
                //         path: "reconcilliationGroupID",
                //         operator: sOperator,
                //         value1: ''
                //     })];  
                //     oBindingParams.filters?.push(new Filter({
                //         filters: aFilters,
                //         and: andOrBoolean,
                //     }));
                // }
                if (oVintageYear && oVintageYear.length > 0) {
                    let oValue1 = oVintageYear.split(" - ")[0];
                    let oValue2 = oVintageYear.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "vintageYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oComplianceYear && oComplianceYear.length > 0) {
                    let oValue1 = oComplianceYear.split(" - ")[0];
                    let oValue2 = oComplianceYear.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "renewablesDocumentComplianceYear",
                        operator: FilterOperator.BT,
                        value1: oValue1,
                        value2: oValue2
                    }));
                }
                if (oDocumentDate && oDocumentDate.length > 0) {
                    let oValue1 = oDocumentDate.split(" - ")[0];
                    let oValue2 = oVintageYear.split(" - ")[1] || oValue1;
                    oBindingParams.filters?.push(new Filter({
                        path: "documentDate",
                        operator: FilterOperator.BT,
                        value1: new Date(oValue1),
                        value2: new Date(oValue2)
                    }));
                }
                if (sSubObjectScenerios.length > 0) {
                    sSubObjectScenerios.forEach((sSubObjectScenerio) => {
                        oBindingParams.filters?.push(new Filter({
                            path: "subObjectScenario",
                            operator: FilterOperator.EQ,
                            value1: sSubObjectScenerio
                        }));
                    })
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
            },
            getUserInfo: function () {
                const url = this.getBaseURL() + "/user-api/attributes";
                var oUserInfoModel = new JSONModel();
                // var mock = {
                //     firstname: "FirstName",
                //     lastname: "LastName"
                // }; 
                oUserInfoModel.loadData(url);
                oUserInfoModel.dataLoaded()
                    .then(() => {
                        this.getView().setModel(oUserInfoModel, "userInfo")
                        // this.getView().getModel('userInfo').setData(mock);
                        if (!oUserInfoModel.getData().firstname || !oUserInfoModel.getData().lastname) {
                            this.getView().getModel('userInfo').setProperty("/visible", false);
                        } else {
                            this.getView().getModel('userInfo').setProperty("/visible", true);
                        }
                    })
                    .catch(() => {
                        // oModel.setData(mock);
                        this.getView().setModel(oUserInfoModel, "userInfo");
                        this.getView().getModel('userInfo').setProperty("/visible", false);
                    });
            },

            getBaseURL: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                return appModulePath;
            },
            onOpenComments: function () {
                let oEMTSTable = this.getView().byId("idEMTSTable");
                // if (oEMTSTable.getSelectedIndices().length === 0) {
                //     MessageBox.error(this.getI18nText("selectAtleastOneRow"));
                //     return;
                // }
                var oView = this.getView();
                // create Dialog
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zfsrenewwrkplc.fragment.Comments",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    }.bind(this));
                }
                this._pDialog.then(function (oDialog) {
                    let nSelectedIndex = oEMTSTable.getSelectedIndices()[0];
                    let sSelectedObjectContext = oEMTSTable.getContextByIndex(nSelectedIndex);
                    let sSelectedPath = sSelectedObjectContext.getPath();
                    oDialog.bindElement(sSelectedPath);
                    oDialog.open();
                });
            },
            onCommentsClose: function (oEvent) {
                this.onCancel();
                this.unSelectRowFromTable();
                oEvent.getSource().getParent().getParent().getParent().close();
            },
            onEdit: function () {
                this.getView().byId("idDisplayForm").setVisible(false);
                this.getView().byId("idEdit").setVisible(false);
                this.getView().byId("idEditForm").setVisible(true);
                this.getView().byId("idCancel").setVisible(true);
                this.getView().byId("idSave").setVisible(true);
            },
            onCancel: function () {
                this.getView().byId("idDisplayForm").setVisible(true);
                this.getView().byId("idEdit").setVisible(true);
                this.getView().byId("idEditForm").setVisible(false);
                this.getView().byId("idCancel").setVisible(false);
                this.getView().byId("idSave").setVisible(false);
            },
            onEditInternalComment:function (oEvent) {
                debugger
                let oSelectedItem=oEvent.getSource().getParent();         
                let sCommentInSelectItem=oSelectedItem.getText();
                let oList = oSelectedItem.getParent();
                oList.setSelectedItem(oSelectedItem);
                oSelectedItem.setHighlight("Information");
                this.getView().byId("idInternalCommentInput").setValue(sCommentInSelectItem);

                
            }

        });
    });
