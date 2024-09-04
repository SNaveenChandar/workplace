sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5,Press,PropertyStrictEquals) {
	"use strict";
	var sViewName = "Workplace";
	
	Opa5.createPageObjects({
		onTheWorkPlacePage: {

			actions: {
				iSelectRINOTCNode() {
                    return this.waitFor({
                        id:"sideNavigation",
                        viewName: sViewName,
                        success: function (oSelect) {
							oSelect.fireItemSelect({"item":oSelect.getItem().getItems()[1].getItems()[0]});
                            Opa5.assert.ok(true,"RIN OTC is Selected");
                        },
                        errorMessage: "Could not find RIN OTC Node"
                    });
                },
                iSelectEMTSNode() {
                    return this.waitFor({
                        id:"sideNavigation",
                        viewName: sViewName,
                        success: function (oSelect) {
							oSelect.fireItemSelect({"item":oSelect.getItem().getItems()[1].getItems()[1]});
                            Opa5.assert.ok(true,"EMTS is Selected");
                        },
                        errorMessage: "Could not find EMTS Node"
                    });
                },
				iPressGoButton:function(){
                    return this.waitFor({
                        //id: "container-zcomfsrenwpl---Main--smartFilterBar-btnGo",
                        controlType: "sap.m.Button",
                        viewName: sViewName,
                        matchers : new PropertyStrictEquals({
                            name : "text",
                            value: "Go"
                      }),
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true,"Go is pressed");
                        },
                        errorMessage: "Go is not pressed"
                    });
                }
			},

			assertions: {

				iShouldSeeTheSideNavigationAndDebitNodeIsSelected: function () {
                    return this.waitFor({
                        id: "sideNavigation",
                        viewName: sViewName,
                        success: function (oControl) {
                            Opa5.assert.strictEqual('idDebitDynamicPage',oControl.getSelectedKey(),"Side Navigation is available and by default Debit is selected");
                        },
                        errorMessage: "Did not find the side navigation"
                    });
                },
				iShouldSeeRINOTCPage: function () {
                    return this.waitFor({
                        id: "idOTCSmartFilterBar",
                        viewName: sViewName,
                        success: function (oControl) {
							Opa5.assert.ok(true,"RIN OTC View is Displayed");
                        },
                        errorMessage: "Did not find the RIN OTC View"
                    });
                },
                iShouldSeeEMTSPage: function () {
                    return this.waitFor({
                        id: "idEMTSSmartFilterBar",
                        viewName: sViewName,
                        success: function (oControl) {
							Opa5.assert.ok(true,"EMTS View is Displayed");
                        },
                        errorMessage: "Did not find the EMTS View"
                    });
                },
				iShouldSeeRINOTRelatedData: function () {
                    return this.waitFor({
                        id: "idOTCTable",
                        viewName: sViewName,
                        success: function (oControl) {
							let sText=oControl.getRows()[0].getCells()[1].getText()
							Opa5.assert.ok(true,"RIN OTC View Data is available");
                        },
                        errorMessage: "Did not find the RIN OTC Data"
                    });
                },
                iShouldSeeEMTSRelatedData: function () {
                    return this.waitFor({
                        id: "idEMTSTable",
                        viewName: sViewName,
                        success: function (oControl) {
							let sText=oControl.getRows()[0].getCells()[1].getText()
							Opa5.assert.ok(true,"EMTS View Data is available");
                        },
                        errorMessage: "Did not find the EMTS Data"
                    });
                }
				
			}
		}
	});

});
