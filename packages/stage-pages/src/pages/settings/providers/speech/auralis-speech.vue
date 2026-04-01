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
import { FieldInput, FieldRange, InputFile } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const providerId = 'auralis-speech'
const defaultModel = 'xttsv2'
const defaultVoiceSettings = {
  speed: 1.0,
}

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

const files = ref<File[]>([])

const availableVoices = computed(() => speechStore.availableVoices[providerId] || [])

const apiKeyConfigured = computed(() => {
  const config = providers.value[providerId]
  const speakerFiles = Array.isArray(config?.speakerFiles) ? config.speakerFiles : []
  return typeof config?.baseUrl === 'string' && config.baseUrl.length > 0 && speakerFiles.length > 0
})

const model = computed({
  get: () => providers.value[providerId]?.model as string | undefined || defaultModel,
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].model = value
  },
})

const language = computed({
  get: () => providers.value[providerId]?.language as string | undefined || 'auto',
  set: (value) => {
    if (!providers.value[providerId])
      providers.value[providerId] = {}
    providers.value[providerId].language = value
  },
})

const speed = ref<number>((providers.value[providerId] as any)?.speed || defaultVoiceSettings.speed)

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

watch(files, async (newFiles) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}

  const encodedFiles = await Promise.all(newFiles.map(async file => arrayBufferToBase64(await file.arrayBuffer())))
  providers.value[providerId].speakerFiles = encodedFiles
  providers.value[providerId].speakerFileNames = newFiles.map(file => file.name)

  await speechStore.loadVoicesForProvider(providerId)
})

watch(speed, (value) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}
  providers.value[providerId].speed = value
})

async function handleGenerateSpeech(input: string, voiceId: string, _useSSML: boolean) {
  const provider = await providersStore.getProviderInstance<SpeechProvider>(providerId)
  if (!provider) {
    throw new Error('Failed to initialize Auralis provider')
  }

  const providerConfig = providersStore.getProviderConfig(providerId)

  return await speechStore.speech(
    provider,
    model.value,
    input,
    voiceId || 'reference',
    {
      ...providerConfig,
      speed: speed.value,
      language: language.value,
    },
  )
}
</script>

<template>
  <SpeechProviderSettings
    :provider-id="providerId"
    :default-model="defaultModel"
    :additional-settings="defaultVoiceSettings"
    :show-api-key-input="false"
    :show-base-url-input="false"
  >
    <template #basic-settings>
      <Alert type="info">
        <template #title>
          Auralis uses reference audio files
        </template>
        Upload one or more clean Korean voice samples. AIRI will send them with every speech request.
      </Alert>

      <ProviderBaseUrlInput
        v-model="providers[providerId].baseUrl as string"
        placeholder="http://localhost:8000/v1/"
        required
      />

      <div class="mt-4 flex flex-col gap-4">
        <div class="text-sm text-neutral-500 dark:text-neutral-400">
          Reference audio files
        </div>
        <InputFile v-model="files" accept="audio/*,.wav,.mp3,.m4a,.flac" multiple>
          <template #default="{ isDragging }">
            <div class="flex flex-col items-center justify-center gap-2 py-4">
              <div class="text-5xl" :class="[isDragging ? 'i-solar:upload-minimalistic-bold text-primary-500' : 'i-solar:music-note-2-bold-duotone text-neutral-400 dark:text-neutral-500']" />
              <div class="text-center text-sm text-neutral-500 dark:text-neutral-400">
                {{ isDragging ? 'Drop Korean voice samples here' : 'Click or drag Korean voice samples here' }}
              </div>
            </div>
          </template>
        </InputFile>

        <div
          v-if="Array.isArray(providers[providerId]?.speakerFileNames) && providers[providerId]?.speakerFileNames.length > 0"
          class="rounded-xl bg-neutral-100/70 p-3 text-sm text-neutral-600 dark:bg-neutral-900/60 dark:text-neutral-300"
        >
          {{ (providers[providerId]?.speakerFileNames as string[]).join(', ') }}
        </div>
      </div>
    </template>

    <template #voice-settings>
      <FieldInput
        v-model="model"
        label="Model"
        description="Auralis model name exposed by the server"
        placeholder="xttsv2"
      />
      <FieldInput
        v-model="language"
        label="Language"
        description="Use auto for automatic detection, or ko for Korean-only synthesis"
        placeholder="auto"
      />
      <FieldRange
        v-model="speed"
        label="Speed"
        description="Adjust the final output speed after synthesis"
        :min="0.5"
        :max="2.0"
        :step="0.01"
      />
    </template>

    <template #advanced-settings />

    <template #playground>
      <SpeechPlayground
        :available-voices="availableVoices"
        :generate-speech="handleGenerateSpeech"
        :api-key-configured="apiKeyConfigured"
        configuration-error-message="Set the base URL and upload at least one reference audio file to test the voice."
        default-text="안녕, 오늘도 기다리고 있었어."
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
