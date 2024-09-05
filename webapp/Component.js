/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "zfsrenewwrkplc/model/models",
        "sap/ui/model/json/JSONModel"
    ],
    function (UIComponent, Device, models,JSONModel) {
        "use strict";

        return UIComponent.extend("zfsrenewwrkplc.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: async function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                await this.getUserInfo();
            },
            getUserInfo: async function () {
                const url = "./user-api/attributes";
                var oUserInfoModel = new JSONModel();
                this.setModel(oUserInfoModel, "userInfo");
                oUserInfoModel.loadData(url);
                try {
                    await oUserInfoModel.dataLoaded();
                    if (!oUserInfoModel.getData().firstname || !oUserInfoModel.getData().lastname) {
                        this.getModel('userInfo').setProperty("/visible", false);
                        this.getModel('userInfo').setProperty("/tenantID", ["50"]);
                    } else {
                        this.getModel('userInfo').setProperty("/visible", true);
                        if(oUserInfoModel.getData().firstname === "Naveen"){
                            this.getModel('userInfo').setProperty("/tenantID", ["50"]);
                        }
                    };
                } catch (error) {
                    this.setModel(oUserInfoModel, "userInfo");
                    this.getModel('userInfo').setProperty("/visible", false);
                };
            },
            getBaseURL: function () {
                var appModulePath = window.location.pathname.split("/").slice(0, -1).join("/") + "/";
                return appModulePath;
            }
        })
    }
);