import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { createSpeechPipelineRuntime } from '../services/speech/pipeline-runtime'

export const useSpeechRuntimeStore = defineStore('speech-runtime', () => {
  const runtime = createSpeechPipelineRuntime()
  const activePlaybackCount = ref(0)
  const isPlaying = computed(() => activePlaybackCount.value > 0)
  let playbackBindingsRegistered = false

  function openIntent(options?: Parameters<typeof runtime.openIntent>[0]) {
    return runtime.openIntent(options)
  }

  async function registerHost(pipeline: Parameters<typeof runtime.registerHost>[0]) {
    await runtime.registerHost(pipeline)

    if (playbackBindingsRegistered)
      return

    playbackBindingsRegistered = true

    pipeline.on('onPlaybackStart', () => {
      activePlaybackCount.value += 1
    })

    const clearPlayback = () => {
      activePlaybackCount.value = Math.max(0, activePlaybackCount.value - 1)
    }

    pipeline.on('onPlaybackEnd', clearPlayback)
    pipeline.on('onPlaybackInterrupt', clearPlayback)
    pipeline.on('onPlaybackReject', clearPlayback)
  }

  function isHost() {
    return runtime.isHost()
  }

  async function dispose() {
    await runtime.dispose()
    activePlaybackCount.value = 0
    playbackBindingsRegistered = false
  }

  return {
    activePlaybackCount,
    isPlaying,
    openIntent,
    registerHost,
    isHost,
    dispose,
  }
})
