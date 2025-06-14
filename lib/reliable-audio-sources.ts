import { audioGenerator } from "./audio-generator"

export interface ReliableAudioTrack {
  track_id: string
  title: string
  artist: string
  genre: string
  language: string
  duration: number
  artwork: string
  sources: AudioSource[]
  mood: string
  category: string
}

export interface AudioSource {
  url: string
  format: "wav" | "mp3" | "ogg"
  quality: "high" | "medium" | "low"
  description: string
  generated: boolean
}

let cachedTracks: ReliableAudioTrack[] | null = null

// Generate reliable audio sources that don't depend on external URLs
export function generateReliableAudioSources(): { [key: string]: string } {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      meditation_1: '/placeholder-audio.mp3',
      meditation_2: '/placeholder-audio.mp3',
      devotional_1: '/placeholder-audio.mp3',
      classical_1: '/placeholder-audio.mp3',
      energetic_1: '/placeholder-audio.mp3',
      calm_1: '/placeholder-audio.mp3',
      spiritual_1: '/placeholder-audio.mp3',
      healing_1: '/placeholder-audio.mp3'
    }
  }

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const sources: { [key: string]: string } = {}

    // Generate different audio tracks
    const trackConfigs = [
      { id: 'meditation_1', frequency: 220, duration: 30, type: 'sine' as OscillatorType },
      { id: 'meditation_2', frequency: 174, duration: 25, type: 'sine' as OscillatorType },
      { id: 'devotional_1', frequency: 432, duration: 28, type: 'triangle' as OscillatorType },
      { id: 'classical_1', frequency: 528, duration: 35, type: 'sine' as OscillatorType },
      { id: 'energetic_1', frequency: 741, duration: 20, type: 'square' as OscillatorType },
      { id: 'calm_1', frequency: 396, duration: 40, type: 'sine' as OscillatorType },
      { id: 'spiritual_1', frequency: 852, duration: 32, type: 'triangle' as OscillatorType },
      { id: 'healing_1', frequency: 963, duration: 45, type: 'sine' as OscillatorType }
    ]

    trackConfigs.forEach(config => {
      try {
        //const buffer = generateAudioBuffer(audioContext, config.frequency, config.duration, config.type)
        //sources[config.id] = audioBufferToDataURL(buffer)
        sources[config.id] = createToneAudioDataURL(config.frequency, config.duration)
      } catch (error) {
        console.warn(`Failed to generate audio for ${config.id}:`, error)
        sources[config.id] = createToneAudioDataURL(config.frequency, config.duration)
      }
    })

    return sources
  } catch (error) {
    console.warn('Failed to create audio context:', error)
    // Fallback to tone generator
    return {
      meditation_1: createToneAudioDataURL(220, 30),
      meditation_2: createToneAudioDataURL(174, 25),
      devotional_1: createToneAudioDataURL(432, 28),
      classical_1: createToneAudioDataURL(528, 35),
      energetic_1: createToneAudioDataURL(741, 20),
      calm_1: createToneAudioDataURL(396, 40),
      spiritual_1: createToneAudioDataURL(852, 32),
      healing_1: createToneAudioDataURL(963, 45)
    }
  }
}

// Create a minimal WAV file with silence
function createSilentAudioDataURL(durationSeconds: number): string {
  const sampleRate = 44100
  const numSamples = sampleRate * durationSeconds
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  // WAV header
  view.setUint32(0, 0x46464952, false) // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true) // file size
  view.setUint32(8, 0x45564157, false) // "WAVE"
  view.setUint32(12, 0x20746d66, false) // "fmt "
  view.setUint32(16, 16, true) // format chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, 1, true) // num channels
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  view.setUint32(36, 0x61746164, false) // "data"
  view.setUint32(40, numSamples * 2, true) // data size

  // Fill with silence (zeros)
  for (let i = 44; i < buffer.byteLength; i++) {
    view.setUint8(i, 0)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return 'data:audio/wav;base64,' + btoa(binary)
}

// Create a WAV file with a simple tone
function createToneAudioDataURL(frequency: number, durationSeconds: number): string {
  const sampleRate = 44100
  const numSamples = sampleRate * durationSeconds
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  // WAV header
  view.setUint32(0, 0x46464952, false) // "RIFF"
  view.setUint32(4, 36 + numSamples * 2, true) // file size
  view.setUint32(8, 0x45564157, false) // "WAVE"
  view.setUint32(12, 0x20746d66, false) // "fmt "
  view.setUint32(16, 16, true) // format chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, 1, true) // num channels
  view.setUint32(24, sampleRate, true) // sample rate
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  view.setUint32(36, 0x61746164, false) // "data"
  view.setUint32(40, numSamples * 2, true) // data size

  // Generate tone data
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.1 // Low volume
    const intSample = Math.round(sample * 32767)
    view.setInt16(44 + i * 2, intSample, true)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return 'data:audio/wav;base64,' + btoa(binary)
}

export function generateAudioBuffer(audioContext:AudioContext, frequency: number, duration: number, type: OscillatorType):AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const numSamples = duration * sampleRate;
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    channelData[i] = Math.sin(2 * Math.PI * frequency * time);
  }

  return buffer;
}

export function audioBufferToDataURL(audioBuffer: AudioBuffer): string {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  let pos = 0;

  // RIFF identifier
  writeString(view, pos, 'RIFF'); pos += 4;
  // file length - 8
  view.setUint32(pos, length - 8, true); pos += 4;
  // RIFF type
  writeString(view, pos, 'WAVE'); pos += 4;
  // format chunk identifier
  writeString(view, pos, 'fmt '); pos += 4;
  // format chunk length
  view.setUint32(pos, 16, true); pos += 4;
  // sample format (raw)
  view.setUint16(pos, 1, true); pos += 2;
  // channel count
  view.setUint16(pos, numberOfChannels, true); pos += 2;
  // sample rate
  view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
  // byte rate (sample rate * block align)
  view.setUint32(pos, audioBuffer.sampleRate * 2, true); pos += 4;
  // block align (channel count * bytes per sample)
  view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
  // bits per sample
  view.setUint16(pos, 16, true); pos += 2;
  // data chunk identifier
  writeString(view, pos, 'data'); pos += 4;
  // data chunk length
  view.setUint32(pos, audioBuffer.length * numberOfChannels * 2, true); pos += 4;

  // Write the samples to the data chunk
  floatTo16BitPCM(view, 44, audioBuffer);

  // Convert to base64
  const base64 = arrayBufferToBase64(buffer);
  return 'data:audio/wav;base64,' + base64;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: AudioBuffer) {
  const buffer = input.getChannelData(0);
  for (let i = 0; i < buffer.length; i++, offset += 2){
    const s = Math.max(-1, Math.min(1, buffer[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function arrayBufferToBase64( buffer: ArrayBuffer ) {
  let binary = '';
  const bytes = new Uint8Array( buffer );
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

export function getReliableAudioTracks(): ReliableAudioTrack[] {
  if (!cachedTracks) {
    cachedTracks = generateReliableAudioSources()
  }
  return cachedTracks
}

export function refreshAudioSources(): ReliableAudioTrack[] {
  cachedTracks = generateReliableAudioSources()
  return cachedTracks
}

export function getTestAudioSource(): AudioSource {
  return {
    url: audioGenerator.generateMeditationBell(30),
    format: "wav",
    quality: "high",
    description: "Test audio - 30 second meditation bell",
    generated: true,
  }
}

// Export the reliable audio tracks array
export const reliableAudioTracks = generateReliableAudioSources()

// Get fresh reliable audio tracks
export function getReliableAudioTracksSync(): ReliableAudioTrack[] {
  return generateReliableAudioSources()
}