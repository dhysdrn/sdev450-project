import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';  // Correct import
import Groq from "groq-sdk";

// Initialize Groq client (replace process.env.GROQ_API_KEY with your actual API key)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default function App() {
  const [response, setResponse] = useState("");  // Store API response
  const [loading, setLoading] = useState(false); // Loading state for the request
  const [input, setInput] = useState("");        // User input for the chat message
  const [isRecording, setIsRecording] = useState(false); // For voice recording control

  // Function to fetch chat completion from Groq API
  const fetchChatCompletion = async () => {
    setLoading(true);
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: input || "Explain the importance of fast language models", // Default prompt if no input
          },
        ],
        model: "llama3-8b-8192",
      });
      setResponse(chatCompletion.choices[0]?.message?.content || "No response received");
    } catch (error) {
      setResponse("Error fetching data: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#250152", "#000"]} // Gradient colors
      start={{ x: 0, y: 0 }}       // Start position of the gradient
      end={{ x: 1, y: 1 }}         // End position of the gradient
      style={styles.container}     // Apply gradient to the container
    >
      <View style={styles.topHalf}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Replace with pet image URL
          style={styles.petImage}
        />
        <Text style={styles.petName}>Your Virtual Pet</Text>
      </View>

      <View style={styles.bottomHalf}>
        <View style={styles.chatBox}>
          <Text style={styles.chatText}>{response || "Chat messages appear here..."}</Text>
        </View>

        <View style={styles.controls}>
          {/* Start/Stop voice recognition */}
          <TouchableOpacity
            onPress={() => setIsRecording(prev => !prev)}
            style={styles.voiceButton}
          >
            <Text style={styles.buttonText}>{isRecording ? "Stop Listening" : "Start Listening"}</Text>
          </TouchableOpacity>

          {/* Input box for user to type their message */}
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message here"
          />

          {/* Button to trigger API call */}
          <TouchableOpacity onPress={fetchChatCompletion} style={styles.sendButton}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent", // Ensure background is transparent to show gradient
  },
  topHalf: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6f7ff",
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
    color: "#333",
  },
  bottomHalf: {
    flex: 1,
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
    marginRight: 10,
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
});
