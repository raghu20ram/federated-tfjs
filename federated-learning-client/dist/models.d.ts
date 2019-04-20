import { FederatedModel, FederatedTfModel } from './common';
export interface FederatedClientModel extends FederatedModel {
    isFederatedClientModel: boolean;
    setup(): Promise<void>;
}
export declare class FederatedClientTfModel extends FederatedTfModel implements FederatedClientModel {
    isFederatedClientModel: boolean;
    setup(): Promise<void>;
}
export declare function isFederatedClientModel(model: any): model is FederatedClientModel;
