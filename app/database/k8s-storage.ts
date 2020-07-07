import fs from "fs"

import { CoreV1Api, KubeConfig } from "@kubernetes/client-node"
import { Chat, StorageEngine } from "@app/database"

export class KubernetesStorageEngine implements StorageEngine {
  private api: CoreV1Api
  private namespace: string

  public constructor(private configmap: string) {
    const k8sConfig = new KubeConfig()
    k8sConfig.loadFromDefault()

    this.api = k8sConfig.makeApiClient(CoreV1Api)
    this.namespace = fs.readFileSync(
      "/var/run/secrets/kubernetes.io/serviceaccount/namespace",
      "utf8"
    )
  }

  public async check(): Promise<void> {
    try {
      await this.read()
    } catch (err) {
      console.log(
        `Unable to open ConfigMap ${this.configmap} in namespace ${this.namespace}`
      )
      console.log(err)
      return Promise.reject()
    }
  }

  public async read(): Promise<Chat[]> {
    const result = await this.api.readNamespacedConfigMap(
      this.configmap,
      this.namespace
    )
    return result?.body?.data?.chats ? JSON.parse(result.body.data.chats) : []
  }

  public async write(chats: Chat[]): Promise<void> {
    await this.api.patchNamespacedConfigMap(
      this.configmap,
      this.namespace,
      { data: { chats: JSON.stringify(chats) } },
      undefined,
      undefined,
      undefined,
      undefined,
      { headers: { "content-type": "application/strategic-merge-patch+json" } }
    )
  }
}
