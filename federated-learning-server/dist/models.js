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
require("./fetch_polyfill");
var tf = require("@tensorflow/tfjs");
var fs = require("fs");
var util_1 = require("util");
var common_1 = require("./common");
var readdir = util_1.promisify(fs.readdir);
var exists = util_1.promisify(fs.exists);
var mkdir = util_1.promisify(fs.mkdir);
var writeFile = util_1.promisify(fs.writeFile);
var readFile = util_1.promisify(fs.readFile);
var symlink = util_1.promisify(fs.symlink);
var unlink = util_1.promisify(fs.unlink);
var readlink = util_1.promisify(fs.readlink);
function forceSymlink(src, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, existingLink;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 7]);
                    return [4, symlink(src, dest, 'dir')];
                case 1:
                    _a.sent();
                    return [3, 7];
                case 2:
                    err_1 = _a.sent();
                    if (err_1.code !== 'EEXIST') {
                        throw err_1;
                    }
                    return [4, readlink(dest)];
                case 3:
                    existingLink = _a.sent();
                    if (!(src !== existingLink)) return [3, 6];
                    return [4, unlink(dest)];
                case 4:
                    _a.sent();
                    return [4, symlink(src, dest, 'dir')];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [3, 7];
                case 7: return [2];
            }
        });
    });
}
var FederatedServerTfModel = (function (_super) {
    __extends(FederatedServerTfModel, _super);
    function FederatedServerTfModel(saveDir, initialModel, config) {
        var _this = _super.call(this, initialModel, config) || this;
        _this.isFederatedServerModel = true;
        _this.saveDir = saveDir;
        return _this;
    }
    FederatedServerTfModel.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var last;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, exists(this.saveDir)];
                    case 1:
                        if (!!(_a.sent())) return [3, 3];
                        return [4, mkdir(this.saveDir)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4, this.last()];
                    case 4:
                        last = _a.sent();
                        if (!last) return [3, 6];
                        return [4, this.load(last)];
                    case 5:
                        _a.sent();
                        return [3, 9];
                    case 6:
                        tf.ENV.set('IS_BROWSER', true);
                        return [4, this.fetchInitial()];
                    case 7:
                        _a.sent();
                        tf.ENV.set('IS_BROWSER', false);
                        return [4, this.save()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2];
                }
            });
        });
    };
    FederatedServerTfModel.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models, idx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, readdir(this.saveDir)];
                    case 1:
                        models = _a.sent();
                        idx = models.indexOf('current');
                        if (idx >= 0) {
                            models.splice(idx);
                        }
                        models.sort();
                        return [2, models];
                }
            });
        });
    };
    FederatedServerTfModel.prototype.last = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.list()];
                    case 1:
                        models = _a.sent();
                        if (models.length) {
                            return [2, models[models.length - 1]];
                        }
                        else {
                            return [2, null];
                        }
                        return [2];
                }
            });
        });
    };
    FederatedServerTfModel.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var version, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        version = new Date().getTime().toString();
                        this.version = version;
                        url = "file://" + this.saveDir + "/" + version;
                        return [4, this.model.save(url)];
                    case 1:
                        _a.sent();
                        return [4, forceSymlink(this.saveDir + "/" + version, this.saveDir + "/current")];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    FederatedServerTfModel.prototype.load = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var url, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = "file://" + this.saveDir + "/" + version + "/model.json";
                        this.version = version;
                        _a = this;
                        return [4, tf.loadModel(url)];
                    case 1:
                        _a.model = _b.sent();
                        this.model.compile(this.compileConfig);
                        return [4, forceSymlink(this.saveDir + "/" + version, this.saveDir + "/current")];
                    case 2:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    return FederatedServerTfModel;
}(common_1.FederatedTfModel));
exports.FederatedServerTfModel = FederatedServerTfModel;
var FederatedServerDynamicModel = (function (_super) {
    __extends(FederatedServerDynamicModel, _super);
    function FederatedServerDynamicModel(args) {
        var _this = _super.call(this, args) || this;
        _this.version = '';
        _this.isFederatedServerModel = true;
        _this.saveDir = args.saveDir;
        _this.save();
        return _this;
    }
    FederatedServerDynamicModel.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var last;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, exists(this.saveDir)];
                    case 1:
                        if (!!(_a.sent())) return [3, 3];
                        return [4, mkdir(this.saveDir)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4, this.last()];
                    case 4:
                        last = _a.sent();
                        if (!last) return [3, 6];
                        return [4, this.load(last)];
                    case 5:
                        _a.sent();
                        return [3, 8];
                    case 6: return [4, this.save()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2];
                }
            });
        });
    };
    FederatedServerDynamicModel.prototype.list = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, readdir(this.saveDir)];
                    case 1:
                        models = _a.sent();
                        models.sort();
                        return [2, models];
                }
            });
        });
    };
    FederatedServerDynamicModel.prototype.last = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.list()];
                    case 1:
                        models = _a.sent();
                        if (models.length) {
                            return [2, models[models.length - 1]];
                        }
                        else {
                            return [2, null];
                        }
                        return [2];
                }
            });
        });
    };
    FederatedServerDynamicModel.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var version, path, jsonPath, binPath, _a, data, json;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        version = new Date().getTime().toString();
                        this.version = version;
                        path = this.saveDir + "/" + version + "/";
                        return [4, mkdir(path)];
                    case 1:
                        _b.sent();
                        jsonPath = path + "/meta.json";
                        binPath = path + "/data.bin";
                        return [4, flatSerialize(this.vars)];
                    case 2:
                        _a = _b.sent(), data = _a.data, json = _a.json;
                        return [4, writeFile(jsonPath, JSON.stringify(json))];
                    case 3:
                        _b.sent();
                        return [4, writeFile(binPath, data)];
                    case 4:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    FederatedServerDynamicModel.prototype.load = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var path, jsonPath, binPath, json, _a, _b, data;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        path = this.saveDir + "/" + version + "/";
                        jsonPath = path + "/meta.json";
                        binPath = path + "/data.bin";
                        _b = (_a = JSON).parse;
                        return [4, readFile(jsonPath, { encoding: 'utf8' })];
                    case 1:
                        json = _b.apply(_a, [_c.sent()]);
                        return [4, readFile(binPath)];
                    case 2:
                        data = _c.sent();
                        return [2, flatDeserialize({ data: data, json: json })];
                }
            });
        });
    };
    return FederatedServerDynamicModel;
}(common_1.FederatedDynamicModel));
exports.FederatedServerDynamicModel = FederatedServerDynamicModel;
function unview(a) {
    if (ArrayBuffer.isView(a)) {
        return a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength);
    }
    else {
        return a;
    }
}
function flatSerialize(tensors) {
    return __awaiter(this, void 0, void 0, function () {
        var meta, datas, totBytes, dataArr, cursor, byteOffsets, _i, datas_1, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    meta = tensors.map(function (_a) {
                        var shape = _a.shape, dtype = _a.dtype;
                        return ({ shape: shape, dtype: dtype });
                    });
                    return [4, Promise.all(tensors.map(function (t) { return t.data().then(unview); }))];
                case 1:
                    datas = _a.sent();
                    totBytes = datas.map(function (_a) {
                        var byteLength = _a.byteLength;
                        return byteLength;
                    }).reduce(function (x, y) { return x + y; });
                    dataArr = new Uint8Array(totBytes);
                    cursor = 0;
                    byteOffsets = [];
                    for (_i = 0, datas_1 = datas; _i < datas_1.length; _i++) {
                        buf = datas_1[_i];
                        dataArr.set(new Uint8Array(buf), cursor);
                        byteOffsets.push(cursor);
                        cursor += buf.byteLength;
                    }
                    return [2, { data: dataArr, json: { meta: meta, byteOffsets: byteOffsets } }];
            }
        });
    });
}
exports.flatSerialize = flatSerialize;
function flatDeserialize(_a) {
    var data = _a.data, _b = _a.json, meta = _b.meta, byteOffsets = _b.byteOffsets;
    var numels = meta.map(function (_a) {
        var shape = _a.shape;
        return shape.reduce(function (x, y) { return x * y; }, 1);
    });
    var tensors = meta.map(function (_a, i) {
        var shape = _a.shape, dtype = _a.dtype;
        var ctor = common_1.dtypeToTypedArrayCtor[dtype];
        var arr = new ctor(data.buffer, byteOffsets[i], numels[i]);
        return tf.tensor(arr, shape, dtype);
    });
    return tensors;
}
exports.flatDeserialize = flatDeserialize;
//# sourceMappingURL=models.js.map