/// <reference types="node" />
import * as http from 'http';
import * as https from 'https';
import * as io from 'socket.io';
import { AbstractServer, FederatedServerConfig, FederatedServerModel } from './abstract_server';
import { AsyncTfModel } from './common';
export declare class Server extends AbstractServer {
    constructor(server: http.Server | https.Server | io.Server, model: AsyncTfModel | FederatedServerModel, config: FederatedServerConfig);
}
