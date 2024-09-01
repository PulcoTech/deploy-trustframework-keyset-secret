import * as core from '@actions/core'
import fs from 'fs'
import { Client } from '@microsoft/microsoft-graph-client'
import { ActionConfig } from './common/action-config'
import { ClientCredentialsAuthProvider } from './auth'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    let graph_path = 'trustFramework/keySets'
    const actionConfig = new ActionConfig()
    actionConfig.validate()
    const client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        actionConfig.tenantId,
        actionConfig.clientId,
        actionConfig.clientSecret
      ),
      defaultVersion: 'beta'
    })

    try {
      // Create in case it does not already exist
      await client.api(graph_path).create({
        id: actionConfig.name
      })
    } catch {}

    let body: { [key: string]: any } = {}
    if (actionConfig.options === 'generate') {
      graph_path = `trustFramework/keySets/${actionConfig.name}/generateSecret`
      body['use'] = ActionConfig.keyUseName.get(actionConfig.keyUse)
      body['kty'] = actionConfig.keyType
    } else if (actionConfig.options === 'manual') {
      graph_path = `trustFramework/keySets/${actionConfig.name}/uploadSecret`
      body['use'] = ActionConfig.keyUseName.get(actionConfig.keyUse)
      body['k'] = actionConfig.secret
    } else {
      graph_path = `trustFramework/keySets/${actionConfig.name}/uploadPkcs12`
      let buffer = Buffer.from(fs.readFileSync(actionConfig.filePath))
      let fileBase64 = buffer.toString('base64')
      body['key'] = fileBase64
      body['password'] = actionConfig.password
      core.info('Uploading certificate using Microsoft Graph')
    }
    body['nbf'] = 99
    body['exp'] = 99
    // Then upload the secret
    await client.api(graph_path).post(body)
    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
    core.info('Secret created successfully using Microsoft Graph')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
