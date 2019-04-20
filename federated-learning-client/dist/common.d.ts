import * as tf from '@tensorflow/tfjs';
import { LayerVariable, ModelCompileConfig, Tensor, Variable } from '@tensorflow/tfjs';
export declare type VarList = Array<Tensor | Variable | LayerVariable>;
export declare type SerializedVariable = {
    dtype: tf.DataType;
    shape: number[];
    data: ArrayBuffer;
};
export declare const dtypeToTypedArrayCtor: {
    'float32': Float32ArrayConstructor;
    'int32': Int32ArrayConstructor;
    'bool': Uint8ArrayConstructor;
};
export declare function serializeVar(variable: tf.Tensor): Promise<SerializedVariable>;
export declare function serializeVars(vars: VarList): Promise<SerializedVariable[]>;
export declare function stackSerialized(vars: SerializedVariable[][]): {
    dtype: "float32" | "int32" | "bool";
    shape: number[];
    data: ArrayBuffer;
}[];
export declare function deserializeVars(vars: SerializedVariable[]): tf.Tensor<tf.Rank>[];
export declare function serializedToArray(serialized: SerializedVariable): Int32Array | Uint8Array | Float32Array;
export declare function deserializeVar(serialized: SerializedVariable): tf.Tensor;
export declare type LossOrMetricFn = (yTrue: Tensor, yPred: Tensor) => Tensor;
export declare type TfModelCallback = () => Promise<tf.Model>;
export declare type AsyncTfModel = string | tf.Model | TfModelCallback;
export declare type VersionCallback = (oldVersion: string, newVersion: string) => void;
export declare type UploadCallback = (msg: UploadMsg) => void;
export declare enum Events {
    Download = "downloadVars",
    Upload = "uploadVars"
}
export declare type ModelMsg = {
    version: string;
    vars: SerializedVariable[];
};
export declare type UploadMsg = {
    model: ModelMsg;
    clientId: string;
    metrics?: number[];
};
export declare type DownloadMsg = {
    model: ModelMsg;
    hyperparams: ClientHyperparams;
};
export declare type FederatedFitConfig = {
    learningRate?: number;
    epochs?: number;
    batchSize?: number;
};
export declare type FederatedCompileConfig = {
    loss?: string | LossOrMetricFn;
    metrics?: string[];
};
export declare type ClientHyperparams = {
    batchSize?: number;
    learningRate?: number;
    epochs?: number;
    examplesPerUpdate?: number;
    weightNoiseStddev?: number;
};
export declare type ServerHyperparams = {
    aggregation?: string;
    minUpdatesPerVersion?: number;
};
export declare const DEFAULT_CLIENT_HYPERPARAMS: ClientHyperparams;
export declare const DEFAULT_SERVER_HYPERPARAMS: ServerHyperparams;
export declare function clientHyperparams(hps?: ClientHyperparams): ClientHyperparams;
export declare function serverHyperparams(hps?: ServerHyperparams): ServerHyperparams;
export declare function fetchModel(asyncModel: AsyncTfModel): Promise<tf.Model>;
export interface FederatedModel {
    fit(x: Tensor, y: Tensor, config?: FederatedFitConfig): Promise<void>;
    predict(x: Tensor): Tensor;
    evaluate(x: Tensor, y: Tensor): number[];
    getVars(): Tensor[];
    setVars(vals: Tensor[]): void;
    inputShape: number[];
    outputShape: number[];
}
export declare class FederatedTfModel implements FederatedModel {
    model: tf.Model;
    compileConfig: ModelCompileConfig;
    private _initialModel;
    constructor(initialModel?: AsyncTfModel, config?: FederatedCompileConfig);
    fetchInitial(): Promise<void>;
    fit(x: Tensor, y: Tensor, config?: FederatedFitConfig): Promise<void>;
    predict(x: Tensor): tf.Tensor<tf.Rank>;
    evaluate(x: Tensor, y: Tensor): number[];
    getVars(): tf.Tensor[];
    setVars(vals: tf.Tensor[]): void;
    readonly inputShape: number[];
    readonly outputShape: number[];
}
export declare class FederatedDynamicModel implements FederatedModel {
    isFederatedClientModel: boolean;
    version: string;
    vars: tf.Variable[];
    predict: (inputs: tf.Tensor) => tf.Tensor;
    loss: (labels: tf.Tensor, preds: tf.Tensor) => tf.Scalar;
    optimizer: tf.SGDOptimizer;
    inputShape: number[];
    outputShape: number[];
    constructor(args: {
        vars: tf.Variable[];
        predict: (inputs: tf.Tensor) => tf.Tensor;
        loss: (labels: tf.Tensor, preds: tf.Tensor) => tf.Scalar;
        inputShape: number[];
        outputShape: number[];
    });
    setup(): Promise<void>;
    fit(x: tf.Tensor, y: tf.Tensor, config?: FederatedFitConfig): Promise<void>;
    evaluate(x: tf.Tensor, y: tf.Tensor): number[];
    getVars(): tf.Variable<tf.Rank>[];
    setVars(vals: tf.Tensor[]): void;
}
