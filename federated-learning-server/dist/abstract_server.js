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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs");
var common_1 = require("./common");
function isFederatedServerModel(model) {
    return model && model.isFederatedServerModel;
}
exports.isFederatedServerModel = isFederatedServerModel;
var FederatedServerInMemoryModel = (function (_super) {
    __extends(FederatedServerInMemoryModel, _super);
    function FederatedServerInMemoryModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isFederatedServerModel = true;
        return _this;
    }
    FederatedServerInMemoryModel.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isBrowser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isBrowser = tf.ENV.get('IS_BROWSER');
                        tf.ENV.set('IS_BROWSER', true);
                        return [4, this.fetchInitial()];
                    case 1:
                        _a.sent();
                        tf.ENV.set('IS_BROWSER', isBrowser);
                        return [4, this.save()];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    FederatedServerInMemoryModel.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.version = new Date().getTime().toString();
                return [2];
            });
        });
    };
    return FederatedServerInMemoryModel;
}(common_1.FederatedTfModel));
exports.FederatedServerInMemoryModel = FederatedServerInMemoryModel;
var AbstractServer = (function () {
    function AbstractServer(webServer, model, config) {
        var _this = this;
        this.numClients = 0;
        this.numUpdates = 0;
        this.updates = [];
        this.updating = false;
        this.server = webServer;
        this.model = model;
        this.verbose = (!!config.verbose) || false;
        this.clientHyperparams = common_1.clientHyperparams(config.clientHyperparams || {});
        this.serverHyperparams = common_1.serverHyperparams(config.serverHyperparams || {});
        this.downloadMsg = null;
        this.uploadCallbacks = [];
        this.versionCallbacks = [function (v1, v2) {
                _this.log("updated model: " + v1 + " -> " + v2);
            }];
    }
    AbstractServer.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.time('setting up model', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.model.setup()];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); })];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4, this.computeDownloadMsg()];
                    case 2:
                        _a.downloadMsg = _b.sent();
                        return [4, this.performCallbacks()];
                    case 3:
                        _b.sent();
                        this.server.on('connection', function (socket) {
                            _this.numClients++;
                            _this.log("connection: " + _this.numClients + " clients");
                            socket.on('disconnect', function () {
                                _this.numClients--;
                                _this.log("disconnection: " + _this.numClients + " clients");
                            });
                            socket.emit(common_1.Events.Download, _this.downloadMsg);
                            socket.on(common_1.Events.Upload, function (msg, ack) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            ack(true);
                                            if (!(msg.model.version === this.model.version && !this.updating)) return [3, 3];
                                            this.log("new update from " + msg.clientId);
                                            this.updates.push(msg.model.vars);
                                            this.numUpdates++;
                                            return [4, this.time('upload callbacks', function () { return __awaiter(_this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        this.uploadCallbacks.forEach(function (c) { return c(msg); });
                                                        return [2];
                                                    });
                                                }); })];
                                        case 1:
                                            _a.sent();
                                            if (!this.shouldUpdate()) return [3, 3];
                                            return [4, this.updateModel()];
                                        case 2:
                                            _a.sent();
                                            this.server.sockets.emit(common_1.Events.Download, this.downloadMsg);
                                            _a.label = 3;
                                        case 3: return [2];
                                    }
                                });
                            }); });
                        });
                        return [2];
                }
            });
        });
    };
    AbstractServer.prototype.shouldUpdate = function () {
        var numUpdates = this.numUpdates;
        return (numUpdates >= this.serverHyperparams.minUpdatesPerVersion);
    };
    AbstractServer.prototype.onNewVersion = function (callback) {
        this.versionCallbacks.push(callback);
    };
    AbstractServer.prototype.onUpload = function (callback) {
        this.uploadCallbacks.push(callback);
    };
    AbstractServer.prototype.computeDownloadMsg = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = {};
                        _b = {};
                        return [4, common_1.serializeVars(this.model.getVars())];
                    case 1: return [2, (_a.model = (_b.vars = _c.sent(),
                            _b.version = this.model.version,
                            _b),
                            _a.hyperparams = this.clientHyperparams,
                            _a)];
                }
            });
        });
    };
    AbstractServer.prototype.updateModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldVersion, aggregation, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.updating = true;
                        oldVersion = this.model.version;
                        aggregation = this.serverHyperparams.aggregation;
                        return [4, this.time('computing new weights', function () { return __awaiter(_this, void 0, void 0, function () {
                                var newWeights;
                                var _this = this;
                                return __generator(this, function (_a) {
                                    newWeights = tf.tidy(function () {
                                        var stacked = common_1.stackSerialized(_this.updates);
                                        var updates = common_1.deserializeVars(stacked);
                                        if (aggregation === 'mean') {
                                            return updates.map(function (update) { return update.mean(0); });
                                        }
                                        else {
                                            throw new Error("unsupported aggregation " + aggregation);
                                        }
                                    });
                                    this.model.setVars(newWeights);
                                    tf.dispose(newWeights);
                                    return [2];
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        this.model.save();
                        _a = this;
                        return [4, this.computeDownloadMsg()];
                    case 2:
                        _a.downloadMsg = _b.sent();
                        this.updates = [];
                        this.numUpdates = 0;
                        this.updating = false;
                        this.performCallbacks(oldVersion);
                        return [2];
                }
            });
        });
    };
    AbstractServer.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.verbose) {
            console.log.apply(console, ['Federated Server:'].concat(args));
        }
    };
    AbstractServer.prototype.time = function (msg, action) {
        return __awaiter(this, void 0, void 0, function () {
            var t1, t2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t1 = new Date().getTime();
                        return [4, action()];
                    case 1:
                        _a.sent();
                        t2 = new Date().getTime();
                        this.log(msg + " took " + (t2 - t1) + "ms");
                        return [2];
                }
            });
        });
    };
    AbstractServer.prototype.performCallbacks = function (oldVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.time('performing callbacks', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                this.versionCallbacks.forEach(function (c) { return c(oldVersion, _this.model.version); });
                                return [2];
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    return AbstractServer;
}());
exports.AbstractServer = AbstractServer;
//# sourceMappingURL=abstract_server.js.map