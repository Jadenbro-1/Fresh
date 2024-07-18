import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Animated, Dimensions, PanResponder } from 'react-native';
import axios from 'axios';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');

const MyProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          navigation.navigate('Pantry');
        }
      },
    })
  ).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/user/1'); // Replace '1' with the actual user ID
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        setError('Failed to fetch user data');
      }
    };

    const fetchMediaData = async () => {
      try {
        const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/media');
        const data = response.data.map((video) => ({
          ...video,
          url: video.url.startsWith('http') ? video.url.replace('http://', 'https://') : video.url,
        }));
        setVideos(data);
      } catch (error) {
        console.error('Error fetching media:', error.message);
        setError('Failed to fetch media');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchMediaData();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      const interval = setInterval(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 500, useNativeDriver: true }),
        ]).start();
      }, 10000); // Change video every 5 seconds
      return () => clearInterval(interval);
    }
  }, [videos, opacityAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoThumbnailContainer}
      onPress={() => navigation.navigate('VideoPlayer', {
        videoUrl: item.url,
        username: `${user.first_name}-${user.last_name}`,
        profilePic: user.profile_pic_url,
        description: item.description || 'No description available',
        comments: item.comments || [],
        isFavorite: item.isFavorite || false,
        isSubscribed: item.isSubscribed || false,
      })}
    >
      {item.url ? (
        <Video
          source={{ uri: item.url }}
          style={styles.videoThumbnail}
          resizeMode="cover"
          repeat={false}
          paused={true}
          onError={(error) => console.log(`Error loading video ${item.media_id}:`, error)}
          onLoadStart={() => console.log(`Loading video ${item.media_id}: ${item.url}`)}
        />
      ) : (
        <Text style={styles.invalidVideoText}>Invalid video URL</Text>
      )}
      <View style={styles.videoInfoContainer}>
        <Text style={styles.videoDishName}>Dish Name</Text>
        <Text style={styles.videoDishType}>Dish Type</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (!user) {
      return null;
    }

    return (
      <View>
        <View style={styles.collageContainer}>
          {videos.length > 0 && (
            <Animated.View style={[styles.collageOverlay, { opacity: opacityAnim }]}>
              <Video
                source={{ uri: videos[currentVideoIndex].url }}
                style={styles.collageVideo}
                resizeMode="cover"
                repeat
                muted
              />
              <View style={styles.overlay} />
            </Animated.View>
          )}
          <View style={styles.headerContent}>
            <Image
              style={styles.profileImage}
              source={require('/Users/jadenbrozynski/fresh/assets/profilepic.jpg')}
            />
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.userHandle}>@{user.first_name.toLowerCase()}-{user.last_name.toLowerCase()}</Text>
            <Text style={styles.userRole}>Amateur Chef</Text>
            <Text style={styles.userDescription}>Hi! I'm {user.first_name}, a passionate amateur chef who loves to experiment with new recipes and share them with the world. Follow my culinary adventures!</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>150</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>150.7k</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>4.9 ★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.subscribeButton}>
                <Text style={styles.buttonText}>Subscribe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.buttonText}>Follow</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{user.bio}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {user && (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.media_id.toString()}
          numColumns={2}
          key={2}  // This forces a fresh render when the number of columns changes
          style={styles.videoList}
        />
      )}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Image source={require('/Users/jadenbrozynski/fresh/assets/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MealPlanner')}>
          <Image source={require('/Users/jadenbrozynski/fresh/assets/meal.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Upload')}>
          <Image source={require('/Users/jadenbrozynski/fresh/assets/upload.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Nutritionist')}>
          <Image source={require('/Users/jadenbrozynski/fresh/assets/nutrition.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('/Users/jadenbrozynski/fresh/assets/profile.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  errorText: {
    color: '#ff4d4d',
  },
  collageContainer: {
    width: '100%',
    height: 500, // Adjust the height as needed
    backgroundColor: '#000',
  },
  collageOverlay: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collageVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay to make text readable
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderColor: '#00c853',
    borderWidth: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userHandle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  userDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 16,
    color: '#00c853',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  subscribeButton: {
    width: '45%',
    height: 40,
    backgroundColor: '#00c853',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  followButton: {
    width: '45%',
    height: 40,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  description: {
    width: '90%',
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  videoList: {
    width: '100%',
  },
  videoThumbnailContainer: {
    flex: 1,
    margin: 5,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#333',
    borderWidth: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: 150,
  },
  videoInfoContainer: {
    padding: 5,
    backgroundColor: '#121212',
  },
  videoDishName: {
    color: '#fff',
    fontSize: 14,
  },
  videoDishType: {
    color: '#ccc',
    fontSize: 12,
    fontStyle: 'italic',
  },
  invalidVideoText: {
    color: 'white',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 25,
    height: 25,
    tintColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyProfile;
