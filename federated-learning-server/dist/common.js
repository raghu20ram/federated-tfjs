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
exports.dtypeToTypedArrayCtor = {
    'float32': Float32Array,
    'int32': Int32Array,
    'bool': Uint8Array
};
function serializeVar(variable) {
    return __awaiter(this, void 0, void 0, function () {
        var data, copy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, variable.data()];
                case 1:
                    data = _a.sent();
                    copy = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                    return [2, { dtype: variable.dtype, shape: variable.shape.slice(), data: copy }];
            }
        });
    });
}
exports.serializeVar = serializeVar;
function serializeVars(vars) {
    return __awaiter(this, void 0, void 0, function () {
        var varsP;
        return __generator(this, function (_a) {
            varsP = [];
            vars.forEach(function (value, key) {
                var lv = value;
                if (lv.write != null) {
                    varsP.push(serializeVar(lv.read()));
                }
                else {
                    varsP.push(serializeVar(lv));
                }
            });
            return [2, Promise.all(varsP)];
        });
    });
}
exports.serializeVars = serializeVars;
function stackSerialized(vars) {
    var updateCount = vars.length;
    var weightCount = vars[0].length;
    var stackedVars = [];
    for (var wt = 0; wt < weightCount; wt++) {
        var singleVar = vars[0][wt];
        var byteLength = singleVar.data.byteLength;
        var stackedVar = new Uint8Array(byteLength * updateCount);
        for (var up = 0; up < updateCount; up++) {
            var update = vars[up][wt].data;
            stackedVar.set(new Uint8Array(update), up * byteLength);
        }
        stackedVars.push({
            dtype: singleVar.dtype,
            shape: [updateCount].concat(singleVar.shape),
            data: stackedVar.buffer.slice(stackedVar.byteOffset, stackedVar.byteOffset + stackedVar.byteLength)
        });
    }
    return stackedVars;
}
exports.stackSerialized = stackSerialized;
function deserializeVars(vars) {
    return vars.map(deserializeVar);
}
exports.deserializeVars = deserializeVars;
function serializedToArray(serialized) {
    var dtype = serialized.dtype, shape = serialized.shape, dataBuffer = serialized.data;
    var data;
    if (dataBuffer instanceof ArrayBuffer) {
        data = dataBuffer;
    }
    else if (dataBuffer instanceof Buffer) {
        var dataAsBuffer = dataBuffer;
        data = dataAsBuffer.buffer.slice(dataAsBuffer.byteOffset, dataAsBuffer.byteOffset + dataAsBuffer.byteLength);
    }
    var numel = shape.reduce(function (x, y) { return x * y; }, 1);
    var ctor = exports.dtypeToTypedArrayCtor[dtype];
    return new ctor(data, 0, numel);
}
exports.serializedToArray = serializedToArray;
function deserializeVar(serialized) {
    var array = serializedToArray(serialized);
    return tf.tensor(array, serialized.shape, serialized.dtype);
}
exports.deserializeVar = deserializeVar;
var Events;
(function (Events) {
    Events["Download"] = "downloadVars";
    Events["Upload"] = "uploadVars";
})(Events = exports.Events || (exports.Events = {}));
exports.DEFAULT_CLIENT_HYPERPARAMS = {
    examplesPerUpdate: 5,
    learningRate: 0.001,
    batchSize: 32,
    epochs: 5,
    weightNoiseStddev: 0
};
exports.DEFAULT_SERVER_HYPERPARAMS = {
    aggregation: 'mean',
    minUpdatesPerVersion: 20
};
function override(defaults, choices) {
    var result = {};
    for (var key in defaults) {
        result[key] = (choices || {})[key] || defaults[key];
    }
    for (var key in (choices || {})) {
        if (!(key in defaults)) {
            throw new Error("Unrecognized key \"" + key + "\"");
        }
    }
    return result;
}
function clientHyperparams(hps) {
    try {
        return override(exports.DEFAULT_CLIENT_HYPERPARAMS, hps);
    }
    catch (err) {
        throw new Error("Error setting clientHyperparams: " + err.message);
    }
}
exports.clientHyperparams = clientHyperparams;
function serverHyperparams(hps) {
    try {
        return override(exports.DEFAULT_SERVER_HYPERPARAMS, hps);
    }
    catch (err) {
        throw new Error("Error setting serverHyperparams: " + err.message);
    }
}
exports.serverHyperparams = serverHyperparams;
function fetchModel(asyncModel) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof asyncModel === 'string')) return [3, 2];
                    return [4, tf.loadModel(asyncModel)];
                case 1: return [2, _a.sent()];
                case 2:
                    if (!(typeof asyncModel === 'function')) return [3, 4];
                    return [4, asyncModel()];
                case 3: return [2, _a.sent()];
                case 4: return [2, asyncModel];
            }
        });
    });
}
exports.fetchModel = fetchModel;
var FederatedTfModel = (function () {
    function FederatedTfModel(initialModel, config) {
        this._initialModel = initialModel;
        this.compileConfig = {
            loss: config.loss || 'categoricalCrossentropy',
            metrics: config.metrics || ['accuracy'],
            optimizer: 'sgd'
        };
    }
    FederatedTfModel.prototype.fetchInitial = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._initialModel) return [3, 2];
                        _a = this;
                        return [4, fetchModel(this._initialModel)];
                    case 1:
                        _a.model = _b.sent();
                        this.model.compile(this.compileConfig);
                        return [3, 3];
                    case 2: throw new Error('no initial model provided!');
                    case 3: return [2];
                }
            });
        });
    };
    FederatedTfModel.prototype.fit = function (x, y, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config.learningRate) {
                            this.model.optimizer
                                .setLearningRate(config.learningRate);
                        }
                        return [4, this.model.fit(x, y, {
                                epochs: config.epochs || exports.DEFAULT_CLIENT_HYPERPARAMS.epochs,
                                batchSize: config.batchSize || exports.DEFAULT_CLIENT_HYPERPARAMS.batchSize
                            })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    FederatedTfModel.prototype.predict = function (x) {
        return this.model.predict(x);
    };
    FederatedTfModel.prototype.evaluate = function (x, y) {
        var _this = this;
        return tf.tidy(function () {
            var results = _this.model.evaluate(x, y);
            if (results instanceof Array) {
                return results.map(function (r) { return r.dataSync()[0]; });
            }
            else {
                return [results.dataSync()[0]];
            }
        });
    };
    FederatedTfModel.prototype.getVars = function () {
        return this.model.trainableWeights.map(function (v) { return v.read(); });
    };
    FederatedTfModel.prototype.setVars = function (vals) {
        for (var i = 0; i < vals.length; i++) {
            this.model.trainableWeights[i].write(vals[i]);
        }
    };
    Object.defineProperty(FederatedTfModel.prototype, "inputShape", {
        get: function () {
            return this.model.inputLayers[0].batchInputShape.slice(1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FederatedTfModel.prototype, "outputShape", {
        get: function () {
            return this.model.outputShape.slice(1);
        },
        enumerable: true,
        configurable: true
    });
    return FederatedTfModel;
}());
exports.FederatedTfModel = FederatedTfModel;
var FederatedDynamicModel = (function () {
    function FederatedDynamicModel(args) {
        this.isFederatedClientModel = true;
        this.vars = args.vars;
        this.predict = args.predict;
        this.loss = args.loss;
        this.optimizer = tf.train.sgd(exports.DEFAULT_CLIENT_HYPERPARAMS.learningRate);
        this.inputShape = args.inputShape;
        this.outputShape = args.outputShape;
    }
    FederatedDynamicModel.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, Promise.resolve()];
            });
        });
    };
    FederatedDynamicModel.prototype.fit = function (x, y, config) {
        return __awaiter(this, void 0, void 0, function () {
            var epochs, i, ret;
            var _this = this;
            return __generator(this, function (_a) {
                if (config.learningRate) {
                    this.optimizer.setLearningRate(config.learningRate);
                }
                epochs = (config && config.epochs) || 1;
                for (i = 0; i < epochs; i++) {
                    ret = this.optimizer.minimize(function () { return _this.loss(y, _this.predict(x)); });
                    tf.dispose(ret);
                }
                return [2];
            });
        });
    };
    FederatedDynamicModel.prototype.evaluate = function (x, y) {
        return Array.prototype.slice.call(this.loss(y, this.predict(x)).dataSync());
    };
    FederatedDynamicModel.prototype.getVars = function () {
        return this.vars;
    };
    FederatedDynamicModel.prototype.setVars = function (vals) {
        this.vars.forEach(function (v, i) {
            v.assign(vals[i]);
        });
    };
    return FederatedDynamicModel;
}());
exports.FederatedDynamicModel = FederatedDynamicModel;
//# sourceMappingURL=common.js.map