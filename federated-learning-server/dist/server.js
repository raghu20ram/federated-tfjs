"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var path = require("path");
var io = require("socket.io");
var abstract_server_1 = require("./abstract_server");
var models_1 = require("./models");
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(server, model, config) {
        var _this = this;
        var ioServer = server;
        if (server instanceof http.Server || server instanceof https.Server) {
            ioServer = io(server);
        }
        var fedModel = model;
        if (!abstract_server_1.isFederatedServerModel(model)) {
            var defaultDir = path.resolve(process.cwd() + "/saved-models");
            var modelDir = config.modelDir || defaultDir;
            var compileConfig = config.modelCompileConfig || {};
            fedModel = new models_1.FederatedServerTfModel(modelDir, model, compileConfig);
        }
        if (!config.verbose) {
            config.verbose = (!!process.env.VERBOSE);
        }
        _this = _super.call(this, ioServer, fedModel, config) || this;
        return _this;
    }
    return Server;
}(abstract_server_1.AbstractServer));
exports.Server = Server;
//# sourceMappingURL=server.js.map