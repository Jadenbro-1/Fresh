import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import axios from 'axios';
import VideoBackground from './VideoBackground';

const screenWidth = Dimensions.get('window').width;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/login', { email, password });
      if (response.data) {
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid username or password.');
    }
  };

  return (
    <VideoBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please login to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#000"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#000"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </VideoBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 200, // Adjust this value to position the content lower
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    opacity: 0.7,
    color: '#ffffff',
    marginBottom: 10,
    fontFamily: 'Arial',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 30,
    opacity: 0.5,
    fontFamily: 'Arial',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  input: {
    width: screenWidth * 0.8,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    width: screenWidth * 0.5,
    height: 50,
    backgroundColor: '#00796b',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  registerButton: {
    width: screenWidth * 0.5,
    height: 50,
    borderColor: '#00796b',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  registerButtonText: {
    color: '#00796b',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});

export default Login;


