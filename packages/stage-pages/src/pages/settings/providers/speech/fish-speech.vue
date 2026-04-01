<script setup lang="ts">
import type { SpeechProvider } from '@xsai-ext/providers/utils'

import {
  Alert,
  ProviderBaseUrlInput,
  SpeechPlayground,
  SpeechProviderSettings,
} from '@proj-airi/stage-ui/components'
import { useSpeechStore } from '@proj-airi/stage-ui/stores/modules/speech'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { FieldInput, FieldRange } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

const providerId = 'fish-speech'
const defaultModel = 's2-pro'

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

const apiConfigured = computed(() => typeof providers.value[providerId]?.baseUrl === 'string' && providers.value[providerId].baseUrl.trim().length > 0)
const availableVoices = computed(() => speechStore.availableVoices[providerId] || [])

const model = computed({
  get: () => providers.value[providerId]?.model as string | undefined || defaultModel,
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].model = value
  },
})

const baseUrl = computed({
  get: () => providers.value[providerId]?.baseUrl as string | undefined || '',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].baseUrl = value
  },
})

const referenceId = computed({
  get: () => providers.value[providerId]?.referenceId as string | undefined || '',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].referenceId = value
  },
})

const temperature = ref<number>((providers.value[providerId] as any)?.temperature || 0.8)
const topP = ref<number>((providers.value[providerId] as any)?.topP || 0.8)

watch(referenceId, async () => {
  await speechStore.loadVoicesForProvider(providerId)
})

watch(temperature, (value) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}
  providers.value[providerId].temperature = value
})

watch(topP, (value) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}
  providers.value[providerId].topP = value
})

onMounted(async () => {
  await speechStore.loadVoicesForProvider(providerId)
})

async function handleGenerateSpeech(input: string, voiceId: string, _useSSML: boolean) {
  const provider = await providersStore.getProviderInstance<SpeechProvider>(providerId)
  if (!provider) {
    throw new Error('Failed to initialize Fish Speech provider')
  }

  const providerConfig = providersStore.getProviderConfig(providerId)

  return await speechStore.speech(
    provider,
    model.value,
    input,
    voiceId || 'default',
    {
      ...providerConfig,
      referenceId: referenceId.value,
      temperature: temperature.value,
      topP: topP.value,
    },
  )
}
</script>

<template>
  <SpeechProviderSettings
    :provider-id="providerId"
    :default-model="defaultModel"
    :show-base-url-input="false"
  >
    <template #basic-settings>
      <Alert type="info">
        <template #title>
          Fish Speech inline style tags
        </template>
        Use tags directly in the text, for example: [soft feminine voice] 안녕하세요. [old narrator] 옛날 이야기를 들려드릴게요.
      </Alert>

      <ProviderBaseUrlInput
        v-model="baseUrl"
        placeholder="http://localhost:8080/v1/"
        required
      />

      <FieldInput
        v-model="referenceId"
        label="Reference ID"
        description="Optional saved Fish Speech reference id on the server"
        placeholder="my-korean-speaker"
      />
    </template>

    <template #voice-settings>
      <FieldInput
        v-model="model"
        label="Model"
        description="Fish Speech server model label used by AIRI"
        placeholder="s2-pro"
      />
      <FieldRange
        v-model="temperature"
        label="Temperature"
        description="Higher values add more variation to delivery"
        :min="0.1"
        :max="1.5"
        :step="0.01"
      />
      <FieldRange
        v-model="topP"
        label="Top P"
        description="Sampling control for expressiveness and stability"
        :min="0.1"
        :max="1.0"
        :step="0.01"
      />
    </template>

    <template #playground>
      <SpeechPlayground
        :available-voices="availableVoices"
        :generate-speech="handleGenerateSpeech"
        :api-key-configured="apiConfigured"
        configuration-error-message="Set the Fish Speech Base URL first."
        default-text="[soft feminine voice] 안녕하세요. 오늘은 기분이 참 좋네요."
      />
    </template>
  </SpeechProviderSettings>
</template>

<route lang="yaml">
  meta:
    layout: settings
    stageTransition:
      name: slide
</route>
