// speechService.ts
import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer'; // Import Buffer
import { AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION } from '@env';
import { Alert } from 'react-native';

// Polyfill Buffer
global.Buffer = global.Buffer || Buffer;

let recording: Audio.Recording | null = null;

// Define comprehensive recording options including 'web'
const recordingOptions = {
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4, // Corrected key name
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSample: 16,
    sampleRate: 44100,
    numberOfChannels: 2,
  },
};

/**
 * Request microphone permission if not granted.
 * Returns true if granted, false if not.
 */
async function getMicrophonePermission(): Promise<boolean> {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission", "Please grant permission to access microphone");
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * Start audio recording using the device microphone.
 */
export async function startRecording(): Promise<void> {
  const hasPermission = await getMicrophonePermission();
  if (!hasPermission) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();
  } catch (error) {
    console.log("Failed to start Recording", error);
    Alert.alert("Error", "Failed to start recording");
  }
}

/**
 * Stop the current recording and transcribe the audio via Groq's Speech-to-Text API.
 * Returns the recognized text.
 */
export async function stopRecordingAndTranscribe(): Promise<string> {
  if (!recording) {
    throw new Error("No recording in progress.");
  }

  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    if (!uri) throw new Error("No recording URI found.");

    // Transcribe the audio
    const transcript = await transcribeAudioFile(uri);

    return transcript;
  } catch (error) {
    console.log("Failed to stop Recording", error);
    Alert.alert("Error", "Failed to stop recording");
    throw error;
  } finally {
    recording = null; // Reset recording reference
  }
}

/**
 * Send audio to Groq's Speech-to-Text API for transcription.
 * @param uri The URI of the recorded audio file
 */
async function transcribeAudioFile(uri: string): Promise<string> {
  if (!AZURE_SPEECH_API_KEY || !AZURE_SPEECH_REGION) {
    throw new Error("Missing AZURE_SPEECH_API_KEY or AZURE_SPEECH_REGION in environment variables.");
  }

  try {
    // Read the recorded file as base64
    const fileData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

    // Convert base64 data to binary using Buffer
    const binaryData = Buffer.from(fileData, 'base64');

    // Define Groq's transcription API endpoint
    const endpoint = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

    const response = await axios.post(endpoint, binaryData, {
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_API_KEY,
        'Content-Type': 'audio/wav', // Ensure this matches the recorded format
      },
    });

    const result = response.data;
    if (result && result.DisplayText) {
      return result.DisplayText;
    } else {
      throw new Error("No text recognized.");
    }
  } catch (error) {
    console.log("Error transcribing audio:", error);
    throw error;
  }
}
