/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/Workplace"
], function (opaTest) {
	"use strict";

	QUnit.module("Renewable Workplace");

	opaTest("RIN OTC", function (Given, When, Then) {
		// Arrangements
		// Given.iStartMyApp();
		Given.iStartMyAppInAFrame("../../index.html");

		// Assertions
		Then.onTheWorkPlacePage.iShouldSeeTheSideNavigationAndDebitNodeIsSelected();
		When.onTheWorkPlacePage.iSelectRINOTCNode();
		Then.onTheWorkPlacePage.iShouldSeeRINOTCPage();
		When.onTheWorkPlacePage.iPressGoButton();
		Then.onTheWorkPlacePage.iShouldSeeRINOTRelatedData();

		When.onTheWorkPlacePage.iSelectEMTSNode();
		Then.onTheWorkPlacePage.iShouldSeeEMTSPage();
		When.onTheWorkPlacePage.iPressGoButton();
		Then.onTheWorkPlacePage.iShouldSeeEMTSRelatedData();

		//Cleanup
		Then.iTeardownMyApp();
	});
});
