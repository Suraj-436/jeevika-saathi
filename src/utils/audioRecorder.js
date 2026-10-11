// src/utils/audioRecorder.js
// High-fidelity in-browser 16kHz 16-bit mono WAV recorder for Bhashini ASR.
// Works seamlessly in all modern browsers without external dependencies.

/**
 * Creates a standard 44-byte RIFF/WAVE header for 16-bit PCM mono audio.
 */
function createWavHeader(dataLength, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  // File length minus 8
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(8, 'WAVE');
  // Format chunk identifier
  writeString(12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // Channel count (1 = Mono)
  view.setUint16(22, 1, true);
  // Sample rate (16000 Hz)
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * channels * bytesPerSample = 16000 * 1 * 2 = 32000)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channels * bytesPerSample = 2)
  view.setUint16(32, 2, true);
  // Bits per sample (16 bits)
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(36, 'data');
  // Data chunk length
  view.setUint32(40, dataLength, true);

  return new Uint8Array(buffer);
}

/**
 * Converts Float32Array PCM samples to 16-bit signed integer PCM.
 */
function floatTo16BitPCM(floatSamples) {
  const output = new Int16Array(floatSamples.length);
  for (let i = 0; i < floatSamples.length; i++) {
    const s = Math.max(-1, Math.min(1, floatSamples[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return new Uint8Array(output.buffer);
}

/**
 * AudioRecorder class for capturing 16kHz mono audio.
 */
export class AudioRecorder {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    this.recordedSamples = [];
    this.isRecording = false;
  }

  /**
   * Request microphone permission and begin recording.
   */
  async start() {
    if (this.isRecording) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone audio capture is not supported in this browser.');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone access was denied. Please allow microphone permission in your browser or use the keyboard.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No microphone device found on your system.');
      } else {
        throw new Error(`Microphone initialization error: ${err.message}`);
      }
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: 16000 });
    const sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

    // Buffer size 4096, 1 input channel, 1 output channel
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.recordedSamples = [];

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this.recordedSamples.push(new Float32Array(inputData));
    };

    sourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  /**
   * Stop recording and return the recorded 16kHz mono WAV as a base64 string.
   */
  async stop() {
    if (!this.isRecording) return null;
    this.isRecording = false;

    // Disconnect and release audio nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }

    // Merge captured audio buffers
    let totalLength = 0;
    for (const chunk of this.recordedSamples) {
      totalLength += chunk.length;
    }

    if (totalLength === 0) {
      return null;
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.recordedSamples) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert Float32 samples to 16-bit PCM bytes
    const pcmBytes = floatTo16BitPCM(merged);
    const wavHeader = createWavHeader(pcmBytes.length, 16000);

    // Combine header and PCM payload
    const wavFile = new Uint8Array(wavHeader.length + pcmBytes.length);
    wavFile.set(wavHeader, 0);
    wavFile.set(pcmBytes, wavHeader.length);

    // Convert to base64
    let binary = '';
    const bytes = wavFile;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 8192) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, len)));
    }
    const base64 = window.btoa(binary);

    return {
      base64,
      durationSec: totalLength / 16000,
      byteLength: wavFile.byteLength
    };
  }

  cancel() {
    this.isRecording = false;
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor.onaudioprocess = null;
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    this.recordedSamples = [];
  }
}
