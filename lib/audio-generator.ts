export class AudioGenerator {
  private sampleRate = 44100
  private bitDepth = 16

  generateMeditationBell(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    // WAV header
    this.writeWAVHeader(view, numSamples)

    // Generate bell sound with harmonics
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Fundamental frequency (440 Hz) + harmonics
      sample += Math.sin(2 * Math.PI * 440 * time) * 0.5
      sample += Math.sin(2 * Math.PI * 880 * time) * 0.3
      sample += Math.sin(2 * Math.PI * 1320 * time) * 0.2

      // Apply exponential decay envelope
      const envelope = Math.exp(-time * 2)
      sample *= envelope

      // Convert to 16-bit PCM
      const pcmSample = Math.max(-1, Math.min(1, sample)) * 32767
      view.setInt16(44 + i * 2, pcmSample, true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateAmbientSound(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    // Generate ambient sound with multiple sine waves
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Multiple frequency layers for ambient effect
      sample += Math.sin(2 * Math.PI * 220 * time) * 0.3
      sample += Math.sin(2 * Math.PI * 330 * time) * 0.2
      sample += Math.sin(2 * Math.PI * 110 * time) * 0.4
      sample += Math.sin(2 * Math.PI * 165 * time) * 0.1

      // Add some noise for texture
      sample += (Math.random() - 0.5) * 0.05

      // Gentle fade in/out
      const fadeTime = Math.min(time, duration - time, 2)
      const fadeEnvelope = Math.min(1, fadeTime / 2)
      sample *= fadeEnvelope

      const pcmSample = Math.max(-1, Math.min(1, sample)) * 32767
      view.setInt16(44 + i * 2, pcmSample, true)
    }

    const blob = new Blob([buffer], { type: "audio/wav" })
    return URL.createObjectURL(blob)
  }

  generateNatureSound(duration: number): string {
    const numSamples = Math.floor(this.sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    this.writeWAVHeader(view, numSamples)

    // Generate nature-like sounds (wind, birds)
    for (let i = 0; i < numSamples; i++) {
      const time = i / this.sampleRate
      let sample = 0

      // Wind-like noise
      sample += (Math.random() - 0.5) * 0.3

      // Bird-like chirps (random frequency modulation)
      if (Math.random() < 0.001) {
        const chirpFreq = 800 + Math.random() * 1200
        sample += Math.sin(2 * Math.PI * chirpFreq * time) * 0.2
      }

      // Low frequency rumble
      sample += Math.sin(2 * Math.PI * 60 * time) * 0.1

      const pcmSample = Math.max(-1, Math.min(1, sample)) * 32767
      view.setInt16(44 + i * 2, pcmSample, true)
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
