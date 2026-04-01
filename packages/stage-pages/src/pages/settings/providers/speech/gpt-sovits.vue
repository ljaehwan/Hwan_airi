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
import { computed, onMounted, watch } from 'vue'

const providerId = 'gpt-sovits'
const defaultModel = 'gpt-sovits'

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

const availableVoices = computed(() => speechStore.availableVoices[providerId] || [])

const apiConfigured = computed(() => {
  const config = providers.value[providerId]
  return typeof config?.baseUrl === 'string'
    && config.baseUrl.trim().length > 0
    && typeof config?.refAudioPath === 'string'
    && config.refAudioPath.trim().length > 0
    && typeof config?.promptLang === 'string'
    && config.promptLang.trim().length > 0
    && typeof config?.textLang === 'string'
    && config.textLang.trim().length > 0
})

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

const refAudioPath = computed({
  get: () => providers.value[providerId]?.refAudioPath as string | undefined || '',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].refAudioPath = value
  },
})

const promptText = computed({
  get: () => providers.value[providerId]?.promptText as string | undefined || '',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].promptText = value
  },
})

const promptLang = computed({
  get: () => providers.value[providerId]?.promptLang as string | undefined || 'ko',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].promptLang = value
  },
})

const textLang = computed({
  get: () => providers.value[providerId]?.textLang as string | undefined || 'ko',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].textLang = value
  },
})

const textSplitMethod = computed({
  get: () => providers.value[providerId]?.textSplitMethod as string | undefined || 'cut5',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].textSplitMethod = value
  },
})

const speedFactor = computed({
  get: () => typeof providers.value[providerId]?.speedFactor === 'number' ? providers.value[providerId].speedFactor as number : 1,
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].speedFactor = value
  },
})

const topP = computed({
  get: () => typeof providers.value[providerId]?.topP === 'number' ? providers.value[providerId].topP as number : 1,
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].topP = value
  },
})

const temperature = computed({
  get: () => typeof providers.value[providerId]?.temperature === 'number' ? providers.value[providerId].temperature as number : 1,
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].temperature = value
  },
})

watch([
  refAudioPath,
  promptText,
  promptLang,
  textLang,
], async () => {
  await speechStore.loadVoicesForProvider(providerId)
})

onMounted(async () => {
  await speechStore.loadVoicesForProvider(providerId)
})

async function handleGenerateSpeech(input: string, voiceId: string, _useSSML: boolean) {
  const provider = await providersStore.getProviderInstance<SpeechProvider>(providerId)
  if (!provider) {
    throw new Error('Failed to initialize GPT-SoVITS provider')
  }

  const providerConfig = providersStore.getProviderConfig(providerId)

  return await speechStore.speech(
    provider,
    model.value,
    input,
    voiceId || 'reference',
    {
      ...providerConfig,
      refAudioPath: refAudioPath.value,
      promptText: promptText.value,
      promptLang: promptLang.value,
      textLang: textLang.value,
      textSplitMethod: textSplitMethod.value,
      speedFactor: speedFactor.value,
      topP: topP.value,
      temperature: temperature.value,
    },
  )
}
</script>

<template>
  <SpeechProviderSettings
    :provider-id="providerId"
    :default-model="defaultModel"
    :show-api-key-input="false"
    :show-base-url-input="false"
  >
    <template #basic-settings>
      <Alert type="info">
        <template #title>
          GPT-SoVITS uses a server-side reference file path
        </template>
        Mount a voice sample folder into the container, then enter the file path visible inside GPT-SoVITS. Korean usually works best with prompt and target text both set to ko.
      </Alert>

      <ProviderBaseUrlInput
        v-model="baseUrl"
        placeholder="http://localhost:9880/"
        required
      />

      <FieldInput
        v-model="refAudioPath"
        label="Reference Audio Path"
        description="Path inside the GPT-SoVITS container, for example /workspace/refs/airi-ko.wav"
        placeholder="/workspace/refs/airi-ko.wav"
      />

      <FieldInput
        v-model="promptText"
        label="Prompt Text"
        description="Transcript of the reference voice sample. Matching the audio improves pronunciation and timbre stability."
        placeholder="안녕하세요, 저는 AIRI입니다. 만나서 반가워요."
      />

      <div class="grid gap-4 md:grid-cols-2">
        <FieldInput
          v-model="promptLang"
          label="Prompt Language"
          description="Language code for the reference transcript"
          placeholder="ko"
        />

        <FieldInput
          v-model="textLang"
          label="Target Text Language"
          description="Language code for generated speech"
          placeholder="ko"
        />
      </div>
    </template>

    <template #voice-settings>
      <FieldInput
        v-model="model"
        label="Model"
        description="Display label used by AIRI for this endpoint"
        placeholder="gpt-sovits"
      />

      <FieldInput
        v-model="textSplitMethod"
        label="Text Split Method"
        description="Official GPT-SoVITS segmentation method, for example cut5 or cut0"
        placeholder="cut5"
      />

      <FieldRange
        v-model="speedFactor"
        label="Speed Factor"
        description="Controls output speed"
        :min="0.6"
        :max="1.4"
        :step="0.01"
      />

      <FieldRange
        v-model="temperature"
        label="Temperature"
        description="Higher values increase delivery variation"
        :min="0.1"
        :max="1.5"
        :step="0.01"
      />

      <FieldRange
        v-model="topP"
        label="Top P"
        description="Sampling control for tone stability"
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
        configuration-error-message="Set the Base URL, Reference Audio Path, Prompt Language, and Target Text Language first."
        default-text="안녕하세요. 오늘은 GPT-SoVITS로 한국어 음성을 테스트하고 있습니다."
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
