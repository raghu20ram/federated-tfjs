import './fetch_polyfill';
import * as tf from '@tensorflow/tfjs';
import { FederatedServerModel } from './abstract_server';
import { AsyncTfModel, FederatedCompileConfig, FederatedDynamicModel, FederatedTfModel } from './common';
export declare class FederatedServerTfModel extends FederatedTfModel implements FederatedServerModel {
    isFederatedServerModel: boolean;
    saveDir: string;
    version: string;
    constructor(saveDir: string, initialModel?: AsyncTfModel, config?: FederatedCompileConfig);
    setup(): Promise<void>;
    list(): Promise<string[]>;
    last(): Promise<string>;
    save(): Promise<void>;
    load(version: string): Promise<void>;
}
export declare class FederatedServerDynamicModel extends FederatedDynamicModel implements FederatedServerModel {
    saveDir: string;
    version: string;
    isFederatedServerModel: boolean;
    constructor(args: {
        saveDir: string;
        vars: tf.Variable[];
        predict: (inputs: tf.Tensor) => tf.Tensor;
        loss: (labels: tf.Tensor, preds: tf.Tensor) => tf.Scalar;
        optimizer: tf.Optimizer;
        inputShape: number[];
        outputShape: number[];
    });
    setup(): Promise<void>;
    list(): Promise<string[]>;
    last(): Promise<string>;
    save(): Promise<void>;
    load(version: string): Promise<tf.Tensor<tf.Rank>[]>;
}
export declare type FlatVars = {
    data: Uint8Array;
    json: {
        meta: Array<{
            shape: number[];
            dtype: 'float32' | 'int32' | 'bool';
        }>;
        byteOffsets: number[];
    };
};
export declare function flatSerialize(tensors: tf.Tensor[]): Promise<FlatVars>;
export declare function flatDeserialize({ data, json: { meta, byteOffsets } }: FlatVars): tf.Tensor<tf.Rank>[];
