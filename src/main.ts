import core from '@actions/core';
import fs from 'fs';
(global as any).fetch = require('node-fetch'); // Polyfill for graph client
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientCredentialsAuthProvider } from './auth';
import { ActionConfig } from './common/action-config';

async function main() {
    try {
        let graph_path = "trustFramework/keySets";
        const actionConfig = new ActionConfig();
        actionConfig.validate();
        const client = Client.initWithMiddleware({
            authProvider: new ClientCredentialsAuthProvider(actionConfig.tenantId, actionConfig.clientId, actionConfig.clientSecret),
            defaultVersion: "beta"
        });

        try {
            // Create in case it does not already exist
            await client.api(graph_path).create({
                id: actionConfig.name
            });
        } catch { }

        let body: { [key: string]: any } = {};
        if(actionConfig.options === 'generate') {
            graph_path = `trustFramework/keySets/${actionConfig.name}/generateSecret`;
            body['use'] = ActionConfig.keyUseName.get(actionConfig.keyUse);
            body['kty'] = actionConfig.keyType;
        }
        else if(actionConfig.options === 'manual') {
            graph_path = `trustFramework/keySets/${actionConfig.name}/uploadSecret`;
            body['use'] = ActionConfig.keyUseName.get(actionConfig.keyUse);
            body['k'] = actionConfig.secret;
        }
        else {
            graph_path = `trustFramework/keySets/${actionConfig.name}/uploadPkcs12`;
            let buffer = Buffer.from(fs.readFileSync(actionConfig.filePath));
            let fileBase64 = buffer.toString("base64");
            body['key'] = fileBase64;
            body['password'] = actionConfig.password;
            core.info("Uploading certificate using Microsoft Graph");
        }
        body['nbf'] = 99;
        body['exp'] = 99;
        // Then upload the secret
        await client.api(graph_path).post(body);

        core.info("Secret created successfully using Microsoft Graph");
    } catch (error: any) {
        core.setFailed(`Action failed with error: ${error}.`);
        core.debug(error.stack);
    }
}

main();
