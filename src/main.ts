import * as core from '@actions/core'
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientCredentialsAuthProvider } from './auth'
import { Settings } from './common/settings'
import { CertificateKind, KEY_NAME_PREFIX } from './common/types'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const settings = new Settings()
    await settings.validate()
    const client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        settings.tenantId,
        settings.clientId,
        settings.clientSecret
      ),
      defaultVersion: 'beta'
    })

    for (const p of settings.policyKeys ?? []) {
      let graph_path = 'trustFramework/keySets'
      try {
        // Create in case it does not already exist
        await client.api(graph_path).create({
          id: p.name
        })
      } catch (error) {
        if (error instanceof Error) core.debug(error.message)
      }
      if (p.options === 'generate') {
        graph_path = `trustFramework/keySets/${KEY_NAME_PREFIX}${p.name}/generateKey`
      } else if (p.options === 'manual') {
        graph_path = `trustFramework/keySets/${KEY_NAME_PREFIX}${p.name}/uploadSecret`
      } else if (p.options === 'upload') {
        graph_path = `trustFramework/keySets/${KEY_NAME_PREFIX}${p.name}/${p.certificateKind === CertificateKind.PKCS12 ? 'uploadPkcs12' : 'uploadCertificate'}`
      }
      await client.api(graph_path).post(p.toJson())
    }

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
    core.info('Secret created successfully using Microsoft Graph')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
