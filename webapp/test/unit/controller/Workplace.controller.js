/*global QUnit*/

sap.ui.define([
	"zfsrenewwrkplc/controller/Workplace.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Workplace Controller");

	QUnit.test("I should test the Workplace controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
