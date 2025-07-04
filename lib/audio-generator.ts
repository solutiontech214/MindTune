export class AudioGenerator {
  private sampleRate = 44100
  private bitDepth = 16

  generateMeditationBell(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    // WAV header
    this.writeWAVHeader(view, numSamples)

    // Generate bell sound with harmonics and gentle volume
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Fundamental frequency (440 Hz) + harmonics with reduced volume
      sample += Math.sin(2 * Math.PI * 440 * time) * 0.3
      sample += Math.sin(2 * Math.PI * 880 * time) * 0.2
      sample += Math.sin(2 * Math.PI * 1320 * time) * 0.1

      // Apply exponential decay envelope with longer sustain
      const envelope = Math.exp(-time * 1.5)
      sample *= envelope

      // Add gentle fade in for first 0.1 seconds
      if (time < 0.1) {
        sample *= time / 0.1
      }

      // Convert to 16-bit PCM with proper clamping
      const pcmSample = Math.max(-32767, Math.min(32767, sample * 32767))
      view.setInt16(44 + i * 2, Math.floor(pcmSample), true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateAmbientSound(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    // Generate ambient sound with multiple sine waves and better mixing
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Multiple frequency layers for ambient effect with reduced volume
      sample += Math.sin(2 * Math.PI * 220 * time) * 0.15
      sample += Math.sin(2 * Math.PI * 330 * time) * 0.12
      sample += Math.sin(2 * Math.PI * 110 * time) * 0.2
      sample += Math.sin(2 * Math.PI * 165 * time) * 0.08

      // Add subtle low-frequency oscillation
      sample += Math.sin(2 * Math.PI * 55 * time) * 0.1

      // Add very gentle noise for texture
      sample += (Math.random() - 0.5) * 0.02

      // Gentle fade in/out with better envelope
      const fadeTime = Math.min(time, duration - time, 3)
      const fadeEnvelope = Math.min(1, fadeTime / 3)
      sample *= fadeEnvelope

      // Convert to 16-bit PCM with proper clamping
      const pcmSample = Math.max(-32767, Math.min(32767, sample * 32767))
      view.setInt16(44 + i * 2, Math.floor(pcmSample), true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateNatureSound(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    let birdChirpPhase = 0
    let windPhase = 0

    // Generate nature-like sounds (wind, birds) with better control
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Gentle wind-like noise with filtering
      const windNoise = (Math.random() - 0.5) * 0.15
      windPhase += windNoise * 0.1
      sample += windPhase * 0.8

      // Periodic bird-like chirps with more natural timing
      if (Math.random() < 0.0005) {
        const chirpFreq = 1000 + Math.random() * 800
        birdChirpPhase = chirpFreq
      }

      if (birdChirpPhase > 0) {
        sample += Math.sin(2 * Math.PI * birdChirpPhase * time) * 0.15 * Math.exp(-time * 3)
        birdChirpPhase *= 0.999 // Gradually reduce chirp frequency
      }

      // Very low frequency nature ambience
      sample += Math.sin(2 * Math.PI * 40 * time) * 0.05
      sample += Math.sin(2 * Math.PI * 80 * time) * 0.03

      // Convert to 16-bit PCM with proper clamping
      const pcmSample = Math.max(-32767, Math.min(32767, sample * 32767))
      view.setInt16(44 + i * 2, Math.floor(pcmSample), true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateSilentAudio(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    // Fill with silence (zeros)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateTestTone(duration: number, frequency: number = 440): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    // Generate simple sine wave tone
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate

      // Simple sine wave with gentle volume
      let sample = Math.sin(2 * Math.PI * frequency * time) * 0.3

      // Add fade in/out to prevent clicks
      const fadeTime = 0.1 // 100ms fade
      if (time < fadeTime) {
        sample *= time / fadeTime
      } else if (time > duration - fadeTime) {
        sample *= (duration - time) / fadeTime
      }

      // Convert to 16-bit PCM
      const pcmSample = Math.max(-32767, Math.min(32767, sample * 32767))
      view.setInt16(44 + i * 2, Math.floor(pcmSample), true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  private writeWAVHeader(view: DataView, numSamples: number) {
    const byteRate = this.sampleRate * 2
    const blockAlign = 2
    const dataSize = numSamples * 2

    // RIFF header
    view.setUint32(0, 0x46464952, false) // "RIFF"
    view.setUint32(4, 36 + dataSize, true) // File size
    view.setUint32(8, 0x45564157, false) // "WAVE"

    // Format chunk
    view.setUint32(12, 0x20746d66, false) // "fmt "
    view.setUint32(16, 16, true) // Chunk size
    view.setUint16(20, 1, true) // Audio format (PCM)
    view.setUint16(22, 1, true) // Number of channels
    view.setUint32(24, this.sampleRate, true) // Sample rate
    view.setUint32(28, byteRate, true) // Byte rate
    view.setUint16(32, blockAlign, true) // Block align
    view.setUint16(34, this.bitDepth, true) // Bits per sample

    // Data chunk
    view.setUint32(36, 0x61746164, false) // "data"
    view.setUint32(40, dataSize, true) // Data size
  }
}

export const audioGenerator = new AudioGenerator()


export function generateAudioBuffer(
  context: AudioContext,
  frequency: number = 440,
  duration: number = 2,
  type: OscillatorType = 'sine'
): AudioBuffer {
  const sampleRate = context.sampleRate
  const frameCount = sampleRate * duration
  const buffer = context.createBuffer(2, frameCount, sampleRate) // Stereo

  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'sawtooth':
          sample = 2 * (frequency * t - Math.floor(frequency * t + 0.5))
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * (frequency * t - Math.floor(frequency * t + 0.5))) - 1
          break
      }

      // Apply envelope for smooth start/end
      const envelope = Math.min(t * 5, (duration - t) * 5, 1)
      channelData[i] = sample * envelope * 0.2 // Reduce volume
    }
  }

  return buffer
}

// Generate meditation-style audio with multiple harmonics
export function generateMeditationAudio(context: AudioContext, duration: number = 30): AudioBuffer {
  const sampleRate = context.sampleRate
  const frameCount = sampleRate * duration
  const buffer = context.createBuffer(2, frameCount, sampleRate) // Stereo

  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate

      // Combine multiple harmonics for rich sound
      let sample = 
        0.4 * Math.sin(2 * Math.PI * 220 * t) +  // Base frequency
        0.3 * Math.sin(2 * Math.PI * 330 * t) +  // Perfect fifth
        0.2 * Math.sin(2 * Math.PI * 440 * t) +  // Octave
        0.1 * Math.sin(2 * Math.PI * 660 * t)    // Higher harmonic

      // Apply slow amplitude modulation for breathing effect
      const modulation = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t)

      // Apply envelope
      const envelope = Math.min(t * 2, (duration - t) * 2, 1)

      // Add slight stereo variation
      const stereoVariation = channel === 0 ? 1 : 0.95

      channelData[i] = sample * envelope * modulation * 0.15 * stereoVariation
    }
  }

  return buffer
}

// Convert AudioBuffer to data URL for use as audio source
export function audioBufferToDataURL(buffer: AudioBuffer): string {
  const length = buffer.length
  const channels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate

  // Create WAV file data
  const arrayBuffer = new ArrayBuffer(44 + length * channels * 2)
  const view = new DataView(arrayBuffer)

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * channels * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * channels * 2, true)

  // Convert float samples to 16-bit PCM
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
  }

  // Convert to base64 data URL
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return 'data:audio/wav;base64,' + btoa(binary)
}