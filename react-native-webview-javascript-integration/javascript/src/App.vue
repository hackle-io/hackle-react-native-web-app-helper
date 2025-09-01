<script setup>

import { PropertyOperationsBuilder } from '@hackler/javascript-sdk'
import { 
  hackleClient
 } from './hackleClient'

</script>

<template>
  <div>
    <section style="display:flex;flex-direction: column;gap:8px;">
      <button @click="remoteConfig">
        RemoteConfig
      </button>
      <button @click="variation">
        Variation
      </button>
      <button @click="variationDetail">
        VariationDetail
      </button>
      <button @click="isFeatureOn">
        IsFeatureOn
      </button>
      <button @click="featureFlagDetail">
        FeatureFlagDetail
      </button>
      <button @click="getSessionId">
        GetSessionId
      </button>
      <button @click="setUser">
        setUser
      </button>
      <button @click="setUserId">
        setUserId
      </button>
      <button @click="setDeviceId">
        setDeviceId
      </button>
      <button @click="setUserProperty">
        setUserProperty
      </button>
      <button @click="updateUserProperties">
        updateUserProperties
      </button>
      <button @click="resetUser">
        resetUser
      </button>
      <button @click="getUser">
        GetUser
      </button>
      <button @click="track">
        Track
      </button>
      <button @click="showUserExplorer">
        ShowUserExplorer
      </button>
      <button @click="fetch">
        Fetch
      </button>
    </section>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<script>
export default {
  methods: {
    async remoteConfig() {
      const rc = hackleClient.remoteConfig()
      const result = await rc.get("rn_webview_test", "testing-rich")

      alert(`RC - ${JSON.stringify(result)}`)
    },
    async variation() {
      const detail = await hackleClient.variation(360)
      alert(`실험 - ${JSON.stringify(detail)}`)
    },
    async variationDetail() {
      const detail = await hackleClient.variationDetail(360)
      alert(`실험상세 - ${JSON.stringify(detail)}`)
    },
    async featureFlagDetail() {
      const detail = await hackleClient.featureFlagDetail(47)
      alert(`FF - ${JSON.stringify(detail)}`)
    },
    async isFeatureOn() {
      const on = await hackleClient.isFeatureOn(47)
      alert(`FF - ${JSON.stringify(on)}`)
    },
    async getSessionId() {
      const user = await hackleClient.getSessionId()
      alert(`SESSION ID - ${JSON.stringify(user)}`)
    },
    async setUser() {
      const user = await hackleClient.setUser({ id: "rich-peter-test"})
      alert(`SET USER - ${JSON.stringify(user)}`)
    },
    async setUserId() {
      const user = await hackleClient.setUserId("dorst-organizer")
      alert(`SET USER ID - ${JSON.stringify(user)}`)
    },
    async setDeviceId() {
      const user = await hackleClient.setDeviceId("vid-building")
      alert(`SET DEVICE ID - ${JSON.stringify(user)}`)
    },
    async setUserProperty() {
      const user = await hackleClient.setUserProperty('isHungry', true)
      alert(`SET USER PROPERTY - ${JSON.stringify(user)}`)
    },
    async resetUser() {
      const user = await hackleClient.resetUser()
      alert(`RESET USER - ${JSON.stringify(user)}`)
    },
    async track() {
      const event = await hackleClient.track({
        key: "rn_webview_test",
        properties: {
          buildingNo: 2,
        }
      })
      alert(`TRACK - ${JSON.stringify(event)}`)
    },
    async getUser() {
      const user = await hackleClient.getUser()
      alert(`user - ${JSON.stringify(user)}`)
    },
    async showUserExplorer() {
      const show = await hackleClient.showUserExplorer()
      alert(`SHOW USER EXPLORER - ${JSON.stringify(show)}`)
    },
    async fetch() {
      const show = await hackleClient.fetch()
      alert(`fetch - ${JSON.stringify(show)}`)
    },
    async updateUserProperties() {
      const operations = new PropertyOperationsBuilder().set('hi', 1234)
                                                        .set('gender', 'M')      
                                                        .set('rich', 'man')
                                                        .setOnce('birth', '09-16')
                                                        .setOnce('age', 999)
                                                        .build()

      const property = await hackleClient.updateUserProperties(operations)
      alert(`updateProperties - ${JSON.stringify(property)}`)
    }
  }
}
</script>
