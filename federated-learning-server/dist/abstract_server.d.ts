import { Server as IOServer } from 'socket.io';
import { ClientHyperparams, DownloadMsg, FederatedCompileConfig, FederatedModel, FederatedTfModel, SerializedVariable, ServerHyperparams, UploadCallback, VersionCallback } from './common';
export declare type FederatedServerConfig = {
    clientHyperparams?: ClientHyperparams;
    serverHyperparams?: ServerHyperparams;
    updatesPerVersion?: number;
    modelDir?: string;
    modelCompileConfig?: FederatedCompileConfig;
    verbose?: boolean;
};
export interface FederatedServerModel extends FederatedModel {
    isFederatedServerModel: boolean;
    version: string;
    setup(): Promise<void>;
    save(): Promise<void>;
}
export declare function isFederatedServerModel(model: any): model is FederatedServerModel;
export declare class FederatedServerInMemoryModel extends FederatedTfModel implements FederatedServerModel {
    isFederatedServerModel: boolean;
    version: string;
    setup(): Promise<void>;
    save(): Promise<void>;
}
export declare class AbstractServer {
    model: FederatedServerModel;
    clientHyperparams: ClientHyperparams;
    serverHyperparams: ServerHyperparams;
    downloadMsg: DownloadMsg;
    server: IOServer;
    numClients: number;
    numUpdates: number;
    updates: SerializedVariable[][];
    updating: boolean;
    versionCallbacks: VersionCallback[];
    uploadCallbacks: UploadCallback[];
    verbose: boolean;
    constructor(webServer: IOServer, model: FederatedServerModel, config: FederatedServerConfig);
    setup(): Promise<void>;
    private shouldUpdate;
    onNewVersion(callback: VersionCallback): void;
    onUpload(callback: UploadCallback): void;
    private computeDownloadMsg;
    private updateModel;
    private log;
    private time;
    private performCallbacks;
}
