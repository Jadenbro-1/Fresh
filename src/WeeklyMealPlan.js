import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useMealPlan } from './MealPlanContext';

const { width: screenWidth } = Dimensions.get('window');

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyMealPlan = () => {
  const { mealPlans, setMealPlans, addMealsToDay, removeMealFromDay } = useMealPlan();
  const navigation = useNavigation();
  const route = useRoute();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    if (route.params?.selectedRecipes) {
      const { selectedRecipes, day } = route.params;
      addMealsToDay(day, selectedRecipes);
    }
  }, [route.params?.selectedRecipes]);

  const fetchAIMenuRecipes = async () => {
    try {
      const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/ai-menu'); // Adjust to your backend URL
      return response.data;
    } catch (error) {
      console.error('Error fetching AI Menu recipes:', error.message);
      return [];
    }
  };

  const handleCraft = async () => {
    const aiMenuRecipes = await fetchAIMenuRecipes();
    const breakfastRecipes = aiMenuRecipes.filter(recipe => recipe.category === 'Breakfast');
    const lunchRecipes = aiMenuRecipes.filter(recipe => recipe.category === 'Lunch');
    const dinnerRecipes = aiMenuRecipes.filter(recipe => recipe.category === 'Dinner');

    const getRandomRecipe = (recipes) => recipes[Math.floor(Math.random() * recipes.length)];

    const newMealPlans = {};

    daysOfWeek.forEach(day => {
      const selectedRecipes = [
        getRandomRecipe(breakfastRecipes),
        getRandomRecipe(lunchRecipes),
        getRandomRecipe(dinnerRecipes)
      ];
      newMealPlans[day] = selectedRecipes;
    });

    setMealPlans(newMealPlans);
    setDropdownVisible(false);
  };

  const handleClearAll = () => {
    const emptyMealPlans = {};
    daysOfWeek.forEach(day => {
      emptyMealPlans[day] = [];
    });
    setMealPlans(emptyMealPlans);
  };

  const renderMeal = (meal, day, index) => (
    <View key={index} style={styles.mealContainer}>
      <Image source={{ uri: meal.image }} style={styles.mealImage} />
      <TouchableOpacity onPress={() => navigation.navigate('RecipeDetails', { recipeId: meal.id })} style={styles.mealTitleContainer}>
        <Text style={styles.mealTitle}>{meal.title}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeMealFromDay(day, meal)}>
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDay = (day) => (
    <View key={day} style={styles.dayContainer}>
      <Text style={styles.dayTitle}>{day}</Text>
      {mealPlans[day].map((meal, index) => renderMeal(meal, day, index))}
      <TouchableOpacity style={styles.addButtonSmall} onPress={() => navigation.navigate('MealPlanner', { day })}>
        <Text style={styles.addButtonTextSmall}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Meal Plan</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleClearAll}>
            <Image source={require('../assets/trash.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
            <Image source={require('../assets/optimize.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Store')}>
            <Image source={require('../assets/addingredients.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={[styles.filterButton, inStock && styles.filterButtonActive]} onPress={() => setInStock(!inStock)}>
            <Text style={[styles.filterButtonText, inStock && styles.filterButtonTextActive]}>In Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.craftButton} onPress={handleCraft}>
            <Text style={styles.craftButtonText}>Craft</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.background}>
        <View style={styles.content}>
          {daysOfWeek.map(renderDay)}
        </View>
      </ScrollView>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Pantry')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/pantry.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Pantry</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('GroceryPlanner')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/shop.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Shopping List</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('WeeklyMealPlan')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/plan.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Planner</Text>
          </View>
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
  safeAreaTop: {
    backgroundColor: '#4CAF50',
  },
  background: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    width: screenWidth,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 10,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    position: 'absolute',
    top: 125,
    right: 0,
    zIndex: 1,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#000',
    fontSize: 16,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  craftButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  craftButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  content: {
    paddingBottom: 60,
  },
  dayContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomColor: '#BBB',
    borderBottomWidth: 3,
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  mealContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  addButtonSmall: {
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonTextSmall: {
    fontSize: 20,
    color: '#ffffff',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
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
  },
  navItem: {
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

export default WeeklyMealPlan;
