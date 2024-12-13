# PetAmigo Development Documentation

## Project Overview
**PetAmigo** is an interactive companion app developed in React Native using Expo. The app focuses on creating a playful and emotionally responsive digital pet that users can name, interact with, and care for. PetAmigo is designed to adapt its behavior based on user actions, fostering a unique connection between the user and their virtual pet.

The primary goal of PetAmigo is to provide an engaging and fun experience by simulating realistic pet interactions through dynamic responses and emotional tracking. The app keeps track of the pet’s happiness and love levels, allowing users to observe how their actions influence the pet’s mood.

---

## Development Journey

### **Project Initialization**
I began the project by setting up a React Native environment using Expo. It was an easy and straightforward way to get the app up and running quickly. My main goal at this stage was to lay down the basic structure so I could add features step by step.

**Key Steps:**
- Initialized the project using the Expo CLI.
- Set up the folder structure to maintain code organization and scalability.

---

### **Core Features Implementation**

#### 1. **Naming the Pet**
The first feature I worked on was allowing users to name their virtual pet. This created a personal connection right from the start and set the tone for user engagement. The app initially prompts the user to name their pet and stores this information for use throughout the session.

#### 2. **Interactive Actions**
I implemented action buttons that let users perform specific actions, such as:
- **Feed**: Increases the pet’s happiness.
- **Play**: Boosts both happiness and love.
- **Clean**: Enhances love by showing care.
- **Sleep**: Slightly restores happiness.
- **Love**: Significantly improves the love level.

These actions dynamically adjust the pet’s emotional state, which is displayed to the user.

#### 3. **Emotional Tracking**
The app tracks two primary emotional states: **happiness** and **love**. I designed a system that adjusts these values based on user interactions. Positive actions boost these levels, while negative inputs or neglect reduce them.

---

### **Visual Design**
To create an appealing interface, I incorporated visually engaging elements:
- **Gradient Backgrounds**: Used `LinearGradient` to create a polished look.
- **Dynamic Feedback**: The app displays real-time updates to the pet’s emotions, ensuring the user remains connected to the pet’s well-being.
- **Icons for Actions**: Used `Ionicons` to represent actions with easily recognizable visuals.

---

### **AI-Driven Responses**
To make PetAmigo’s interactions dynamic, I integrated AI-generated responses. The responses simulate realistic conversations and adapt based on the user’s actions. I ensured the pet’s dialogue reflects its emotional state, creating a richer user experience.

---

### **Challenges Faced**
1. **Emotion Balancing**: : I wasn’t able to implement voice features with Azure. I tried using Expo Speech, but it didn’t work, likely because it’s not compatible with Expo Go. I believe it would work in an emulator, but I wasn’t able to set that up.
2. **Time Constraints**: Balancing feature implementation and polishing the app’s user experience within the project timeline.
3. **Integrating Dynamic Responses**: Ensuring the AI-generated responses matched the tone and personality of the pet required iterative testing.
4. **Learning React Native**: One of the biggest challenges was learning React Native while working on this project. It was completely new to me, and its complexity made the development process quite difficult at times. Understanding the framework and applying it to build the app involved a steep learning curve.

---

### **Lessons Learned**
1. **Iterative Development**: Breaking down features into smaller, testable components helped streamline the process.
2. **User-Centric Design**: I focused on making the app fun and enjoyable for users, which shaped many of my design choices.
3. **Leveraging Expo**: Using Expo’s tools simplified many aspects of development, from testing to deployment.

---

## Future Plans
- Introduce persistent memory to retain the pet’s state across sessions.
- Add animations and more interactive features to enhance user engagement.
- Expand the range of pet emotions for a deeper simulation.
- Actually implement speech into it
---

