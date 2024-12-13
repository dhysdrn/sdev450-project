import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';  
import Ionicons from '@expo/vector-icons/Ionicons';
import Groq from "groq-sdk";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION } from '@env';

// Initialize Groq client (replace process.env.GROQ_API_KEY with your actual API key)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default function App() {
  const [response, setResponse] = useState("");  // Store API response
  const [loading, setLoading] = useState(false); // Loading state for the request
  const [input, setInput] = useState("");        // User input for the chat message
  const [isRecording, setIsRecording] = useState(false); // For voice recording control
  const [companionName, setCompanionName] = useState(""); // Companion name
  const [isNaming, setIsNaming] = useState(true); // Whether the user is naming the pet
  const [happiness, setHappiness] = useState(50); // Happiness level of the pet
  const [love, setLove] = useState(50);           // Love level of the pet
  const [memory, setMemory] = useState<Record<string, string>>({}); // Memory object for storing user-provided information

  const subscriptionKey = AZURE_SPEECH_API_KEY;
  const serviceRegion = AZURE_SPEECH_REGION;

  const adjustEmotion = (type: "happiness" | "love", value: number): void => {
    if (type === "happiness") {
      setHappiness((prev) => Math.min(100, Math.max(0, prev + value)));
    } else if (type === "love") {
      setLove((prev) => Math.min(100, Math.max(0, prev + value)));
    }
  };
  
  const updateMemory = (message: string): void => {
    const keyValueRegex = /my (.+?) is (.+)/i; // Pattern to capture "my <key> is <value>"
    const match = message.match(keyValueRegex);
    if (match) {
      const key = match[1].toLowerCase(); // e.g., "favorite food"
      const value = match[2];            // e.g., "pizza"
      setMemory((prev) => ({ ...prev, [key]: value })); // Update memory
    }
  };
  
  const fetchChatCompletion = async (action: string, customMessage: string | null = null): Promise<void> => {
    setLoading(true);
    try {
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        {
          role: "system",
          content: `You are ${companionName}, a playful and emotionally intelligent pet. Respond dynamically and track your happiness and love.`,
        },
        {
          role: "user",
          content: customMessage || `The user chose to ${action}. How do you feel?`,
        },
      ];
  
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama3-8b-8192",
      });
  
      const assistantResponse = chatCompletion.choices[0]?.message?.content || "No response from your companion.";
      setResponse(assistantResponse);
  
      // Adjust emotions based on action
      if (action === "feed") adjustEmotion("happiness", 10);
      if (action === "play") adjustEmotion("happiness", 15);
      if (action === "sleep") adjustEmotion("happiness", 5);
      if (action === "clean") adjustEmotion("love", 10);
      if (action === "love") adjustEmotion("love", 20);
  
      // Deduct emotions for specific behaviors
      if (customMessage?.toLowerCase().includes("ignore")) adjustEmotion("happiness", -15);
      if (customMessage?.toLowerCase().includes("bad")) adjustEmotion("love", -10);
      if (customMessage?.toLowerCase().includes("hate")) adjustEmotion("love", -20);
  
    } catch (error: any) {
      console.error("Error fetching response:", error);
      setResponse("Error fetching response: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const startSpeechRecognition = async () => {
    setIsRecording(true);
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        setInput(result.text); // Display transcription in the input box
        fetchChatCompletion("speak", result.text);
        setIsRecording(false);
      },
      (err) => {
        setResponse(`Speech recognition failed: ${err}`);
        setIsRecording(false);
      }
    );
  };

  const handleNameSubmit = () => {
    if (companionName.trim()) {
      setIsNaming(false);
      setResponse(`Say hello to ${companionName}, your new companion!`);
    }
  };

  const handleSend = () => {
    fetchChatCompletion("send", input);
    setInput("");
  };

  return (
    <LinearGradient
      colors={["#250152", "#000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {isNaming ? (
        <View style={styles.nameContainer}>
          <Text style={styles.promptText}>Enter your pet's name:</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Companion Name"
            value={companionName}
            onChangeText={setCompanionName}
          />
          <TouchableOpacity style={styles.nameSubmitButton} onPress={handleNameSubmit}>
            <Text style={styles.buttonText}>Confirm Name</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.topHalf}>
            <Image source={require('../assets/pet.png')} style={styles.petImage} />

            <Text style={styles.petName}>{companionName}</Text>
 
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Happiness: {happiness}</Text>
              <Text style={styles.progressText}>Love: {love}</Text>
            </View>


            <View style={styles.chatBox}>
              {loading && <Text style={styles.loadingText}>{companionName} is thinking...</Text>}
              <Text style={styles.chatText}>{response}</Text>
            </View>
          </View>

          <View style={styles.bottomHalf}>
            <View style={styles.controls}>
              <TouchableOpacity onPress={startSpeechRecognition} style={styles.voiceButton}>
                <Text style={styles.buttonText}>{isRecording ? "Listening..." : "Start Listening"}</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message here"
              />

              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Text style={styles.buttonText}>Send</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menu}>
              <TouchableOpacity style={styles.menuButton} onPress={() => fetchChatCompletion('feed')}>
                <Ionicons name="fast-food-outline" size={30} color="#ff6f61" />
                <Text style={styles.buttonLabel}>Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => fetchChatCompletion('play')}>
                <Ionicons name="game-controller-outline" size={30} color="#ffcc00" />
                <Text style={styles.buttonLabel}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => fetchChatCompletion('sleep')}>
                <Ionicons name="bed-outline" size={30} color="#6b9fff" />
                <Text style={styles.buttonLabel}>Sleep</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => fetchChatCompletion('clean')}>
                <Ionicons name="water" size={30} color="#a4df6c" />
                <Text style={styles.buttonLabel}>Clean</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuButton} onPress={() => fetchChatCompletion('love')}>
                <Ionicons name="heart" size={30} color="#ff69b4" />
                <Text style={styles.buttonLabel}>Love</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  promptText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
  },
  nameInput: {
    height: 40,
    width: "80%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  nameSubmitButton: {
    backgroundColor: "#28a745",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  topHalf: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  progressContainer: {
    width: '80%',
    marginVertical: 10,
  },
  progressText: {
    color: "#fff", // White color
    fontSize: 16,  // Optional, adjust size as needed
    fontWeight: "bold", // Optional, makes it more readable
    marginBottom: 5, // Optional, adds spacing between lines
  },
  
  bottomHalf: {
    flex: 1.1,
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chatText: {
    color: "#666",
    fontStyle: "italic",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginHorizontal: 5,
  },
  sendButton: {
    backgroundColor: "#28a745",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  voiceButton: {
    backgroundColor: "#17a2b8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 50,
  },
  menuButton: {
    backgroundColor: "#fbe7f4",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonLabel: {
    marginTop: 5,
    color: "#444",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingText: {
    color: "#aaa",
    fontStyle: "italic",
    textAlign: "center",
  },
});
