<script setup lang="ts">
import type { SpeechProvider } from '@xsai-ext/providers/utils'

import {
  SpeechPlayground,
  SpeechProviderSettings,
} from '@proj-airi/stage-ui/components'
import { useSpeechStore } from '@proj-airi/stage-ui/stores/modules/speech'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { FieldInput, FieldTextArea } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

const providerId = 'qwen3-tts'
const defaultModel = 'qwen3-tts'

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

// Local server — no API key required
const apiKeyConfigured = true

const instructText = ref(
  (providers.value[providerId]?.instructText as string | undefined) ?? '',
)
const language = ref(
  (providers.value[providerId]?.language as string | undefined) ?? 'Korean',
)

watch(instructText, (val) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}
  providers.value[providerId].instructText = val
})

watch(language, (val) => {
  if (!providers.value[providerId])
    providers.value[providerId] = {}
  providers.value[providerId].language = val
})

const availableVoices = computed(() => {
  return speechStore.availableVoices[providerId] || []
})

onMounted(async () => {
  await speechStore.loadVoicesForProvider(providerId)
})

async function handleGenerateSpeech(input: string, voiceId: string) {
  const provider = await providersStore.getProviderInstance(providerId) as SpeechProvider
  if (!provider)
    throw new Error('Failed to initialize speech provider')

  const providerConfig = providersStore.getProviderConfig(providerId)
  const model = (providerConfig.model as string | undefined) || defaultModel

  const options = {
    ...providerConfig,
    // Pass instruct_text only when non-empty so the server switches to Instruct mode
    instruct_text: instructText.value || undefined,
    language: language.value,
  }

  return await speechStore.speech(provider, model, input, voiceId, options)
}
</script>

<template>
  <SpeechProviderSettings :provider-id="providerId" :default-model="defaultModel">
    <template #basic-settings>
      <div :class="['flex flex-col gap-4']">
        <FieldInput
          v-model="language"
          label="언어 (Language)"
          description="생성할 음성의 언어 (예: Korean, English, Japanese)"
          placeholder="Korean"
        />
        <FieldTextArea
          v-model="instructText"
          label="🎨 음성 스타일 프롬프트 (Instruct Text)"
          description="자연어로 목소리 스타일을 묘사하세요. 비워두면 선택한 화자(Voice)를 사용합니다."
          placeholder="예: 말하는 사람은 젊은 여성으로, 밝고 활기차게 말하며 친근한 톤을 사용합니다"
          :rows="4"
        />
      </div>
    </template>

    <template #playground>
      <SpeechPlayground
        :available-voices="availableVoices"
        :generate-speech="handleGenerateSpeech"
        :api-key-configured="apiKeyConfigured"
        :use-ssml="false"
        default-text="안녕하세요! 저는 Qwen3 TTS입니다."
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
