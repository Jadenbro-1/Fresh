import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { Card, Button, Menu, Provider } from 'react-native-paper';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const MealPlanner = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const recipesPerPage = 10;

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    try {
      const url = selectedCategory
        ? `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes/category?category=${selectedCategory}`
        : 'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes';
      const response = await axios.get(url);
      const sortedRecipes = response.data.sort((a, b) => b.ratings - a.ratings);
      setRecipes(sortedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
    }
  };

  const loadMoreRecipes = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const paginatedRecipes = recipes.slice(0, currentPage * recipesPerPage);

  const addToWeeklyMealPlan = (recipe) => {
    const { day } = route.params;
    navigation.navigate('WeeklyMealPlan', { selectedRecipes: [recipe], day });
  };

  const renderRecipeItem = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}>
        <View style={styles.imageContainer}>
          <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
          {item.ratings === 5 && (
            <View style={styles.ribbon}>
              <Text style={styles.ribbonText}>⭐ Premium</Text>
            </View>
          )}
        </View>
        <Card.Content>
          <Text style={styles.recipeName}>{item.title}</Text>
          <Text style={styles.recipeRating}>Rating: {item.ratings}</Text>
        </Card.Content>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={() => addToWeeklyMealPlan(item)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <Text style={styles.headerIcon}>{'«'}</Text>
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <Text style={styles.recipeCount}>{recipes.length} Recipes</Text>
      </View>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.headerButton}>
            <Text style={styles.headerIcon}>{'≡'}</Text>
          </TouchableOpacity>
        }
      >
        <Menu.Item onPress={() => setSelectedCategory('')} title="📖 Full Menu" />
        <Menu.Item onPress={fetchAIMenuRecipes} title="🤖 AI Menu" />
        <Menu.Item onPress={() => navigation.navigate('WeeklyMealPlan', { selectedRecipes: [], day: route.params?.day })} title="📅 Weekly Plan" />
        <Menu.Item onPress={() => setSelectedCategory('Breakfast')} title="🍳 Breakfast" />
        <Menu.Item onPress={() => setSelectedCategory('Lunch')} title="🥪 Lunch" />
        <Menu.Item onPress={() => setSelectedCategory('Dinner')} title="🍽 Dinner" />
        <Menu.Item onPress={() => setAdvancedFiltersVisible(!advancedFiltersVisible)} title="🔍 Advanced Filters" />
      </Menu>
    </View>
  );

  const renderAdvancedFilters = () => (
    <Menu
      visible={advancedFiltersVisible}
      onDismiss={() => setAdvancedFiltersVisible(false)}
      anchor={
        <TouchableOpacity onPress={() => setAdvancedFiltersVisible(true)} style={styles.headerButton}>
          <Text style={styles.headerIcon}>{'▼'}</Text>
        </TouchableOpacity>
      }
    >
      <Menu.Item onPress={() => handleCategorySelection('Appetizer')} title="Appetizer" />
      <Menu.Item onPress={() => handleCategorySelection('Beverage')} title="Beverage" />
      <Menu.Item onPress={() => handleCategorySelection('Bread')} title="Bread" />
      <Menu.Item onPress={() => handleCategorySelection('Brunch')} title="Brunch" />
      <Menu.Item onPress={() => handleCategorySelection('Dessert')} title="Dessert" />
      <Menu.Item onPress={() => handleCategorySelection('Drink')} title="Drink" />
      <Menu.Item onPress={() => handleCategorySelection('Pasta')} title="Pasta" />
      <Menu.Item onPress={() => handleCategorySelection('Pie')} title="Pie" />
      <Menu.Item onPress={() => handleCategorySelection('Salad')} title="Salad" />
      <Menu.Item onPress={() => handleCategorySelection('Side Dish')} title="Side Dish" />
      <Menu.Item onPress={() => handleCategorySelection('Snack')} title="Snack" />
      <Menu.Item onPress={() => handleCategorySelection('Soup')} title="Soup" />
    </Menu>
  );

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    setAdvancedFiltersVisible(false); // Hide the filters menu after selection
  };

  const fetchAIMenuRecipes = async () => {
    try {
      const response = await axios.get('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/ai-menu'); // Adjust to your backend URL
      const sortedRecipes = response.data.sort((a, b) => b.ratings - a.ratings);
      setRecipes(sortedRecipes);
    } catch (error) {
      console.error('Error fetching AI Menu recipes:', error.message);
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#00796b" barStyle="light-content" />
        <View style={styles.greenBackground} />
        {renderHeader()}
        {advancedFiltersVisible && renderAdvancedFilters()}
        <FlatList
          data={paginatedRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipeList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recipes found</Text>
            </View>
          }
          ListFooterComponent={
            currentPage * recipesPerPage < recipes.length && (
              <Button mode="contained" onPress={loadMoreRecipes} style={styles.loadMoreButton}>
                Load More
              </Button>
            )
          }
        />
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navText}>⌂</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MealPlanner')}>
            <Text style={styles.navText}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Upload')}>
            <Text style={styles.navText}>↥</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Nutritionist')}>
            <Text style={styles.navText}>⌾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyProfile')}>
            <Text style={styles.navText}>㋡</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  greenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60, // Adjust height as needed
    backgroundColor: '#00796b',
    zIndex: 1, // Ensure it's above other elements
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth,
    height: 90,
    paddingHorizontal: 15,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#00796b', // Header background color
    zIndex: 2, // Ensure header is above the green background
  },
  headerButton: {
    padding: 5,
  },
  headerIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recipeCount: {
    fontSize: 16,
    color: '#ffffff',
  },
  recipeList: {
    padding: 10,
    paddingTop: 15, // Adjust to account for header height
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#e0f7fa', // Recipe container color
    position: 'relative', // Ensure ribbon is positioned correctly
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  recipeRating: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ffcc00',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 15,
    opacity: .95,
    zIndex: 3, // Ensure the ribbon is above the image
  },
  ribbonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadMoreButton: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#777',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#dddddd', // Separator line color
    backgroundColor: '#ffffff', // Bottom nav background color
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 24, // Icon size
  },
  safeAreaBottom: {
    backgroundColor: '#ffffff',
  },
});

export default MealPlanner;
