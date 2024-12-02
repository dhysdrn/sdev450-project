import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';  
import Ionicons from '@expo/vector-icons/Ionicons';
import Groq from "groq-sdk";

// Initialize Groq client (replace process.env.GROQ_API_KEY with your actual API key)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default function App() {
  const [response, setResponse] = useState("");  // Store API response
  const [loading, setLoading] = useState(false); // Loading state for the request
  const [input, setInput] = useState("");        // User input for the chat message
  const [isRecording, setIsRecording] = useState(false); // For voice recording control

  // Function to fetch chat completion from Groq API
  const fetchChatCompletion = async (action: string) => {
    setLoading(true); // Show a spinner or loading text
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are Kiko, a playful pet responding dynamically. Be cute, caring, and informative.",
          },
          {
            role: "user",
            content: input || `The user chose to ${action}. How does Kiko react?`,
          },
        ],
        model: "llama3-8b-8192",
      });
  
      setResponse(chatCompletion.choices[0]?.message?.content || "No response from Kiko");
    } catch (error) {
      setResponse("Error fetching Kiko's response: " + error);
    } finally {
      setLoading(false);
    }
  };
  const handleSend = () => {
    // Call fetchChatCompletion with 'send' action
    fetchChatCompletion('send');
    
    // Clear the input box
    setInput("");
    
    // Dismiss the keyboard
    // Keyboard.dismiss();
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
        <View style={styles.chatBox}>
        {loading && <Text style={{ textAlign: 'center', color: 'gray' }}>Kiko is thinking...</Text>}
          // chat response
        <Text style={styles.chatText}>{response || "Chat messages appear here..."}</Text>
        </View>
      </View>

      <View style={styles.bottomHalf}>
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
          <TouchableOpacity
            onPress={handleSend} // Call handleSend to send message and clear input
            style={styles.sendButton}
          >
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
    marginRight: 5,
    marginLeft:5,
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
// 