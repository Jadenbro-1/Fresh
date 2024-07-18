import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');

const RecipeDetails = () => {
  const route = useRoute();
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await axios.get(`https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${recipeId}`);
        setRecipe(response.data);

        const nutritionResponse = await axios.get(`https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/nutrients/${recipeId}`);
        setNutrition(nutritionResponse.data);
      } catch (error) {
        console.error('Error fetching recipe details:', error.message);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]);

  if (!recipe) {
    return <Text>Loading...</Text>;
  }

  const handleStartCooking = () => {
    navigation.navigate('StartCooking', { recipe });
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const renderStockStatus = (ingredient) => {
    // Dummy stock status for demonstration
    const stockStatus = {
      "In Stock": { color: '#32CD32', text: "In Stock" },
      "Low Stock": { color: '#FFA500', text: "Low Stock" },
      "No Stock": { color: '#FF4D4D', text: "No Stock" },
    };
    const status = stockStatus["In Stock"]; // Change this to actual stock status logic

    return (
      <View style={styles.stockContainer}>
        <Text style={styles.stockText}>{status.text}</Text>
        <View style={[styles.stockDot, { backgroundColor: status.color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{recipe.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image style={styles.image} source={{ uri: recipe.image }} />
        <Text style={styles.description}>{recipe.description}</Text>
        <View style={[styles.section, styles.timeContainer]}>
          <View style={styles.line} />
          <Text style={styles.subTitle}>Time & Yields</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Preparation Time:</Text>
            <Text style={styles.timeText}>{recipe.prep_time} mins</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Cooking Time:</Text>
            <Text style={styles.timeText}>{recipe.cook_time} mins</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Total Yields:</Text>
            <Text style={styles.timeText}>{recipe.yields}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Rating:</Text>
            <Text style={styles.timeText}>{recipe.ratings}</Text>
          </View>
        </View>
        <View style={[styles.section, styles.ingredientsContainer]}>
          <View style={styles.line} />
          <Text style={styles.subTitle}>Ingredients</Text>
          {recipe.ingredients.split('\n').map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientText}>• {ingredient}</Text>
              {renderStockStatus(ingredient)}
            </View>
          ))}
        </View>
        <View style={[styles.section, styles.instructionsContainer]}>
          <View style={styles.line} />
          <Text style={styles.subTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{recipe.instructions}</Text>
        </View>
        <View style={[styles.section, styles.nutritionContainer]}>
          <View style={styles.line} />
          <Text style={styles.subTitle}>Nutritional Information</Text>
          {nutrition ? (
            <View style={styles.nutritionDetails}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Calories:</Text>
                <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Carbs:</Text>
                <Text style={styles.nutritionValue}>{nutrition.carbohydrateContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Cholesterol:</Text>
                <Text style={styles.nutritionValue}>{nutrition.cholesterolContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Fiber:</Text>
                <Text style={styles.nutritionValue}>{nutrition.fiberContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Protein:</Text>
                <Text style={styles.nutritionValue}>{nutrition.proteinContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Saturated Fat:</Text>
                <Text style={styles.nutritionValue}>{nutrition.saturatedFatContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Sodium:</Text>
                <Text style={styles.nutritionValue}>{nutrition.sodiumContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Sugar:</Text>
                <Text style={styles.nutritionValue}>{nutrition.sugarContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Fat:</Text>
                <Text style={styles.nutritionValue}>{nutrition.fatContent}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionTitle}>Unsaturated Fat:</Text>
                <Text style={styles.nutritionValue}>{nutrition.unsaturatedFatContent}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noNutritionText}>No nutritional information available</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
          <Image source={require('../assets/back.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartCooking} style={styles.navButton}>
          <Image source={require('../assets/cook.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Cook</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavoriteToggle} style={styles.navButton}>
          <Image source={isFavorite ? require('../assets/favorite.png') : require('../assets/star.png')} style={styles.navIcon} />
          <Text style={styles.navText}>Favorite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    width: screenWidth,
    height: 125,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // Ensure the header reaches the top
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
  },
  line: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  section: {
    marginBottom: 20,
  },
  timeContainer: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#777',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  ingredientsList: {
    flexDirection: 'column',
    paddingLeft: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    maxWidth: '70%',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
  },
  stockText: {
    fontSize: 16,
    color: '#777',
    marginRight: 5,
  },
  stockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  nutritionContainer: {
    marginBottom: 60,
  },
  nutritionDetails: {
    marginTop: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionValue: {
    fontSize: 16,
    color: '#777',
  },
  noNutritionText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
  },
  navBar: {
    width: screenWidth,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navText: {
    fontSize: 12,
    color: '#333333',
    marginTop: 5,
  },
});

export default RecipeDetails;
