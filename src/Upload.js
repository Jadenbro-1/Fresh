import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import Video from 'react-native-video';
import { Picker } from '@react-native-picker/picker';

const Upload = ({ navigation, user }) => {
  const [videoUri, setVideoUri] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const selectVideo = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'video' });
      if (result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting video:', err);
      Alert.alert('Error', 'Error selecting video. Please try again.');
    }
  };

  const selectImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Error selecting image. Please try again.');
    }
  };

  const uploadMedia = async () => {
    let videoProgress = 0;
    let imageProgress = 0;

    try {
      const videoData = new FormData();
      videoData.append('file', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'videoUpload.mp4',
      });
      videoData.append('upload_preset', 'ml_default');

      const videoResponse = await axios.post('https://api.cloudinary.com/v1_1/dsogljpr4/video/upload', videoData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          videoProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((videoProgress + imageProgress) / 2);
        },
      });

      const imageData = new FormData();
      imageData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'imageUpload.jpg',
      });
      imageData.append('upload_preset', 'ml_default');

      const imageResponse = await axios.post('https://api.cloudinary.com/v1_1/dsogljpr4/image/upload', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          imageProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((videoProgress + imageProgress) / 2);
        },
      });

      return {
        videoUrl: videoResponse.data.secure_url,
        videoPublicId: videoResponse.data.public_id,
        imageUrl: imageResponse.data.secure_url,
        imagePublicId: imageResponse.data.public_id,
      };
    } catch (err) {
      console.error('Error uploading media:', err);
      throw new Error('Media upload failed');
    }
  };

  const uploadRecipe = async () => {
    if (!videoUri || !imageUri || !description || !title || !prepTime || !cookTime || !ingredients.length || !instructions.length || !category || !cuisine) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const mediaData = await uploadMedia();

      console.log('Uploading recipe with userId:', user.id); // Log user ID
      console.log('Payload:', {
        title,
        description,
        prep_time: parseFloat(prepTime),
        cook_time: parseFloat(cookTime),
        ingredients,
        instructions,
        category,
        cuisine,
        imageUri: mediaData.imageUrl,
        videoUri: mediaData.videoUrl,
        userId: user.id, // Use user.id directly
        tags,
      });

      await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/upload', {
        title,
        description,
        prep_time: parseFloat(prepTime),
        cook_time: parseFloat(cookTime),
        ingredients,
        instructions,
        category,
        cuisine,
        imageUri: mediaData.imageUrl,
        videoUri: mediaData.videoUrl,
        userId: user.id, // Use user.id directly
        tags,
      });

      Alert.alert('Success', 'Upload successful!');
      resetForm();
      navigation.navigate('Home');
    } catch (err) {
      console.error('Error uploading recipe:', err.response ? err.response.data : err.message);
      Alert.alert('Error', `Error uploading recipe: ${err.response ? err.response.data.error : err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setVideoUri(null);
    setImageUri(null);
    setDescription('');
    setTitle('');
    setPrepTime('');
    setCookTime('');
    setIngredients(['']);
    setInstructions(['']);
    setCategory('');
    setCuisine('');
    setTags('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} disabled={isUploading}>
            <Text style={styles.goBack}>⇤</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
        </View>

        <View style={styles.mediaContainer}>
          <TouchableOpacity style={styles.selectButton} onPress={selectVideo} disabled={isUploading}>
            <Text style={styles.selectButtonText}>Select Video</Text>
          </TouchableOpacity>
          {videoUri && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUri }}
                style={styles.video}
                resizeMode="cover"
                repeat
              />
            </View>
          )}

          <TouchableOpacity style={styles.selectButton} onPress={selectImage} disabled={isUploading}>
            <Text style={styles.selectButtonText}>Select Image</Text>
          </TouchableOpacity>
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>
          )}
        </View>

        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{`Upload Progress: ${uploadProgress}%`}</Text>
            <ActivityIndicator size="large" color="#1DA1F2" />
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          editable={!isUploading}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!isUploading}
        />
        <View style={styles.timeContainer}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Prep Time (mins)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={prepTime}
            onChangeText={setPrepTime}
            editable={!isUploading}
          />
          <TextInput
            style={[styles.input, styles.timeInput]}
            placeholder="Cook Time (mins)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={cookTime}
            onChangeText={setCookTime}
            editable={!isUploading}
          />
        </View>

        <Text style={styles.label}>Ingredients</Text>
        {ingredients.map((ingredient, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Ingredient ${index + 1}`}
            placeholderTextColor="#888"
            value={ingredient}
            onChangeText={(value) => handleIngredientChange(index, value)}
            editable={!isUploading}
          />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient} disabled={isUploading}>
          <Text style={styles.addButtonText}>+ Add Ingredient</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Instructions</Text>
        {instructions.map((instruction, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Step ${index + 1}`}
            placeholderTextColor="#888"
            value={instruction}
            onChangeText={(value) => handleInstructionChange(index, value)}
            editable={!isUploading}
          />
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddInstruction} disabled={isUploading}>
          <Text style={styles.addButtonText}>+ Add Step</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            style={styles.picker}
            onValueChange={(itemValue) => setCategory(itemValue)}
            enabled={!isUploading}
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Dinner" value="Dinner" />
            <Picker.Item label="Snack" value="Snack" />
          </Picker>
        </View>

        <Text style={styles.label}>Cuisine</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cuisine}
            style={styles.picker}
            onValueChange={(itemValue) => setCuisine(itemValue)}
            enabled={!isUploading}
          >
            <Picker.Item label="Select Cuisine" value="" />
            <Picker.Item label="Italian" value="Italian" />
            <Picker.Item label="Chinese" value="Chinese" />
            <Picker.Item label="Indian" value="Indian" />
            <Picker.Item label="American" value="American" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Tags (comma separated)"
          placeholderTextColor="#888"
          value={tags}
          onChangeText={setTags}
          editable={!isUploading}
        />
      </ScrollView>
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadRecipe} disabled={isUploading}>
          <Text style={styles.uploadButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingBottom: 80, // Extra padding for the upload button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  goBack: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  selectButton: {
    backgroundColor: '#1DA1F2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    color: '#1DA1F2',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#333',
    color: '#fff',
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 0.48,
  },
  label: {
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1DA1F2',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    height: 175,
  },
  picker: {
    width: '100%',
    color: '#fff',
  },
  uploadButtonContainer: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#1DA1F2',
    padding: 15,
    borderRadius: 50,
    width: '50%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Upload;
