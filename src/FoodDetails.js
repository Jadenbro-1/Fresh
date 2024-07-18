import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const foodImages = {
  "Apple": require('../assets/apple.png'),
  "Banana": require('../assets/banana.png'),
  "Carrot": require('../assets/carrot.png'),
  "Strawberry": require('../assets/strawberry.png'),
  "White Rice": require('../assets/white-rice.png'),
  "Sourdough Bread": require('../assets/sourdough-bread.png'),
  "Beef": require('../assets/beef.png'),
  "Egg": require('../assets/egg.png'),
  "Milk": require('../assets/milk.png'),
  "Cheese": require('../assets/cheese.png'),
};

const FoodDetails = ({ route }) => {
  const { item, expirationDate } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image style={styles.image} source={foodImages[item]} resizeMode="contain" />
      <Text style={styles.title}>{item}</Text>
      <Text style={styles.expirationDate}>Expiration Date: {expirationDate}</Text>
      <Text style={styles.sectionTitle}>Nutritional Facts:</Text>
      {/* Add nutritional facts details here */}
      <Text style={styles.sectionTitle}>Allergens:</Text>
      {/* Add allergens details here */}
      <Text style={styles.sectionTitle}>Other Information:</Text>
      {/* Add other relevant information here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center',
    marginBottom: 10,
  },
  expirationDate: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
});

export default FoodDetails;
