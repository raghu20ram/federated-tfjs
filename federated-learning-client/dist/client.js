"use strict";
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
var socketProxy = require("socket.io-client");
var uuid = require("uuid/v4");
var common_1 = require("./common");
var models_1 = require("./models");
var socketio = socketProxy.default || socketProxy;
var CONNECTION_TIMEOUT = 10 * 1000;
var UPLOAD_TIMEOUT = 5 * 1000;
var COOKIE_NAME = 'federated-learner-uuid';
var YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;
var Client = (function () {
    function Client(server, model, config) {
        var _this = this;
        this.server = server;
        if (models_1.isFederatedClientModel(model)) {
            this.model = model;
        }
        else {
            var compileConfig = (config || {}).modelCompileConfig || {};
            this.model = new models_1.FederatedClientTfModel(model, compileConfig);
        }
        this.uploadCallbacks = [];
        this.versionCallbacks = [function (v1, v2) {
                _this.log("Updated model: " + v1 + " -> " + v2);
            }];
        this.versionUpdateCounts = {};
        this.verbose = (config || {}).verbose;
        this.sendMetrics = (config || {}).sendMetrics;
        if ((config || {}).clientId) {
            this.clientId = config.clientId;
        }
        else if (getCookie(COOKIE_NAME)) {
            this.clientId = getCookie(COOKIE_NAME);
        }
        else {
            this.clientId = uuid();
            setCookie(COOKIE_NAME, this.clientId);
        }
        this.hyperparams = (config || {}).hyperparams || {};
    }
    Client.prototype.modelVersion = function () {
        return this.msg == null ? 'unsynced' : this.msg.model.version;
    };
    Client.prototype.onNewVersion = function (callback) {
        this.versionCallbacks.push(callback);
    };
    Client.prototype.onUpload = function (callback) {
        this.uploadCallbacks.push(callback);
    };
    Client.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newVersion;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.time('Initial model setup', function () { return __awaiter(_this, void 0, void 0, function () {
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
                        _a.sent();
                        this.x = tf.tensor([], [0].concat(this.model.inputShape));
                        this.y = tf.tensor([], [0].concat(this.model.outputShape));
                        return [4, this.time('Download weights from server', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = this;
                                            return [4, this.connectTo(this.server)];
                                        case 1:
                                            _a.msg = _b.sent();
                                            return [2];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        this.setVars(this.msg.model.vars);
                        newVersion = this.modelVersion();
                        this.versionUpdateCounts[newVersion] = 0;
                        this.versionCallbacks.forEach(function (cb) { return cb(null, newVersion); });
                        this.socket.on(common_1.Events.Download, function (msg) {
                            var oldVersion = _this.modelVersion();
                            var newVersion = msg.model.version;
                            _this.msg = msg;
                            _this.setVars(msg.model.vars);
                            _this.versionUpdateCounts[newVersion] = 0;
                            _this.versionCallbacks.forEach(function (cb) { return cb(oldVersion, newVersion); });
                        });
                        return [2];
                }
            });
        });
    };
    Client.prototype.dispose = function () {
        this.socket.disconnect();
        this.log('Disconnected');
    };
    Client.prototype.federatedUpdate = function (x, y) {
        return __awaiter(this, void 0, void 0, function () {
            var xNew, yNew, examplesPerUpdate, _loop_1, this_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        xNew = addRows(this.x, x, this.model.inputShape);
                        yNew = addRows(this.y, y, this.model.outputShape);
                        tf.dispose([this.x, this.y]);
                        this.x = xNew;
                        this.y = yNew;
                        examplesPerUpdate = this.hyperparam('examplesPerUpdate');
                        _loop_1 = function () {
                            var modelVersion, xTrain, yTrain, fitConfig, metrics, stdDev, newVars, newTensors, uploadMsg, xRest, yRest;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        modelVersion = this_1.modelVersion();
                                        xTrain = sliceWithEmptyTensors(this_1.x, 0, examplesPerUpdate);
                                        yTrain = sliceWithEmptyTensors(this_1.y, 0, examplesPerUpdate);
                                        fitConfig = {
                                            epochs: this_1.hyperparam('epochs'),
                                            batchSize: this_1.hyperparam('batchSize'),
                                            learningRate: this_1.hyperparam('learningRate')
                                        };
                                        metrics = null;
                                        if (this_1.sendMetrics) {
                                            metrics = this_1.model.evaluate(xTrain, yTrain);
                                        }
                                        return [4, this_1.time('Fit model', function () { return __awaiter(_this, void 0, void 0, function () {
                                                var err_1;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            _a.trys.push([0, 2, , 3]);
                                                            return [4, this.model.fit(xTrain, yTrain, fitConfig)];
                                                        case 1:
                                                            _a.sent();
                                                            return [3, 3];
                                                        case 2:
                                                            err_1 = _a.sent();
                                                            console.error(err_1);
                                                            throw err_1;
                                                        case 3: return [2];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _a.sent();
                                        stdDev = this_1.hyperparam('weightNoiseStddev');
                                        newVars = void 0;
                                        if (!stdDev) return [3, 3];
                                        newTensors = tf.tidy(function () {
                                            return _this.model.getVars().map(function (v) {
                                                return v.add(tf.randomNormal(v.shape, 0, stdDev));
                                            });
                                        });
                                        return [4, common_1.serializeVars(newTensors)];
                                    case 2:
                                        newVars = _a.sent();
                                        tf.dispose(newTensors);
                                        return [3, 5];
                                    case 3: return [4, common_1.serializeVars(this_1.model.getVars())];
                                    case 4:
                                        newVars = _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        this_1.setVars(this_1.msg.model.vars);
                                        uploadMsg = {
                                            model: { version: modelVersion, vars: newVars },
                                            clientId: this_1.clientId,
                                        };
                                        if (this_1.sendMetrics) {
                                            uploadMsg.metrics = metrics;
                                        }
                                        return [4, this_1.time('Upload weights to server', function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4, this.uploadVars(uploadMsg)];
                                                        case 1:
                                                            _a.sent();
                                                            return [2];
                                                    }
                                                });
                                            }); })];
                                    case 6:
                                        _a.sent();
                                        this_1.uploadCallbacks.forEach(function (cb) { return cb(uploadMsg); });
                                        this_1.versionUpdateCounts[modelVersion] += 1;
                                        tf.dispose([xTrain, yTrain]);
                                        xRest = sliceWithEmptyTensors(this_1.x, examplesPerUpdate);
                                        yRest = sliceWithEmptyTensors(this_1.y, examplesPerUpdate);
                                        tf.dispose([this_1.x, this_1.y]);
                                        this_1.x = xRest;
                                        this_1.y = yRest;
                                        return [2];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.x.shape[0] >= examplesPerUpdate)) return [3, 3];
                        return [5, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3, 1];
                    case 3: return [2];
                }
            });
        });
    };
    Client.prototype.evaluate = function (x, y) {
        return this.model.evaluate(x, y);
    };
    Client.prototype.predict = function (x) {
        return this.model.predict(x);
    };
    Object.defineProperty(Client.prototype, "inputShape", {
        get: function () {
            return this.model.inputShape;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "outputShape", {
        get: function () {
            return this.model.outputShape;
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.numUpdates = function () {
        var _this = this;
        var numTotal = 0;
        Object.keys(this.versionUpdateCounts).forEach(function (k) {
            numTotal += _this.versionUpdateCounts[k];
        });
        return numTotal;
    };
    Client.prototype.numVersions = function () {
        return Object.keys(this.versionUpdateCounts).length;
    };
    Client.prototype.numExamples = function () {
        return this.x.shape[0];
    };
    Client.prototype.hyperparam = function (key) {
        return (this.hyperparams[key] || this.msg.hyperparams[key] ||
            common_1.DEFAULT_CLIENT_HYPERPARAMS[key]);
    };
    Client.prototype.numExamplesPerUpdate = function () {
        return this.hyperparam('examplesPerUpdate');
    };
    Client.prototype.numExamplesRemaining = function () {
        return this.numExamplesPerUpdate() - this.numExamples();
    };
    Client.prototype.uploadVars = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var prom;
            var _this = this;
            return __generator(this, function (_a) {
                prom = new Promise(function (resolve, reject) {
                    var rejectTimer = setTimeout(function () { return reject("uploadVars timed out"); }, UPLOAD_TIMEOUT);
                    _this.socket.emit(common_1.Events.Upload, msg, function () {
                        clearTimeout(rejectTimer);
                        resolve();
                    });
                });
                return [2, prom];
            });
        });
    };
    Client.prototype.setVars = function (newVars) {
        var _this = this;
        tf.tidy(function () {
            _this.model.setVars(newVars.map(function (v) { return common_1.deserializeVar(v); }));
        });
    };
    Client.prototype.connectTo = function (server) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof server === 'string') {
                    this.socket = socketio(server);
                }
                else {
                    this.socket = server();
                }
                return [2, fromEvent(this.socket, common_1.Events.Download, CONNECTION_TIMEOUT)];
            });
        });
    };
    Client.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.verbose) {
            console.log.apply(console, ['Federated Client:'].concat(args));
        }
    };
    Client.prototype.time = function (msg, action) {
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
    return Client;
}());
exports.Client = Client;
function fromEvent(emitter, eventName, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, new Promise(function (resolve, reject) {
                    var rejectTimer = setTimeout(function () { return reject(eventName + " event timed out"); }, timeout);
                    var listener = function (evtArgs) {
                        emitter.removeListener(eventName, listener);
                        clearTimeout(rejectTimer);
                        resolve(evtArgs);
                    };
                    emitter.on(eventName, listener);
                })];
        });
    });
}
function concatWithEmptyTensors(a, b) {
    if (a.shape[0] === 0) {
        return b.clone();
    }
    else if (b.shape[0] === 0) {
        return a.clone();
    }
    else {
        return a.concat(b);
    }
}
function sliceWithEmptyTensors(a, begin, size) {
    if (begin >= a.shape[0]) {
        return tf.tensor([], [0].concat(a.shape.slice(1)));
    }
    else {
        return a.slice(begin, size);
    }
}
function addRows(existing, newEls, unitShape) {
    if (tf.util.arraysEqual(newEls.shape, unitShape)) {
        return tf.tidy(function () { return concatWithEmptyTensors(existing, tf.expandDims(newEls)); });
    }
    else {
        tf.util.assertShapesMatch(newEls.shape.slice(1), unitShape);
        return tf.tidy(function () { return concatWithEmptyTensors(existing, newEls); });
    }
}
function getCookie(name) {
    if (typeof document === 'undefined') {
        return null;
    }
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}
function setCookie(name, value) {
    if (typeof document === 'undefined') {
        return;
    }
    var d = new Date();
    d.setTime(d.getTime() + YEAR_IN_MS);
    document.cookie = name + '=' + value + ';path=/;expires=' + d.toUTCString();
}
//# sourceMappingURL=client.js.map