import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Modal, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');

const MyPantry = ({ navigation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const foodData = {
    Fruits: [
      { item: "Apple", expirationDate: "2024-07-24" },
      { item: "Banana", expirationDate: "2024-08-12" },
      { item: "Strawberry", expirationDate: "2024-07-20" },
      { item: "Pineapple", expirationDate: "2024-08-01" },
    ],
    Vegetables: [
      { item: "Kale", expirationDate: "2024-07-20" },
      { item: "Broccoli", expirationDate: "2024-07-22" },
      { item: "Green Beans", expirationDate: "2024-07-26" },
      { item: "Onion", expirationDate: "2024-08-14" },
    ],
    Dairy: [
      { item: "Cheddar Cheese", expirationDate: "2024-07-19" },
      { item: "Colby Cheese", expirationDate: "2024-07-25" },
      { item: "Milk", expirationDate: "2024-07-23" },
      { item: "Yogurt", expirationDate: "2024-07-22" },
    ],
    Grains: [
      { item: "Wheat Bread", expirationDate: "2024-07-18" },
      { item: "White Bread", expirationDate: "2024-07-22" },
      { item: "Sourdough Bread", expirationDate: "2024-07-24" },
      { item: "Corn Bread", expirationDate: "2024-07-28" },
    ],
    Proteins: [
      { item: "Chicken Breast", expirationDate: "2024-07-19" },
      { item: "Turkey Breast", expirationDate: "2024-07-21" },
      { item: "Ground Beef", expirationDate: "2024-07-25" }
    ]
  };

  useEffect(() => {
    setExpiringSoon(false); // Ensure that we reset the filter state when component mounts
  }, []);

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollOffset > 0);
  };

  const filterExpiringSoon = (foodItems) => {
    const today = moment();
    return foodItems.filter(food => moment(food.expirationDate).isBefore(today.clone().add(7, 'days')));
  };

  const getExpirationText = (expirationDate) => {
    const today = moment();
    const expDate = moment(expirationDate);
    const diffDays = expDate.diff(today, 'days');

    if (diffDays === 0) {
      return "Expiring Today";
    } else if (diffDays === 1) {
      return "Expiring Tomorrow";
    } else if (diffDays <= 3) {
      return `Expiring in ${diffDays} Days`;
    } else {
      return `${diffDays}d`;
    }
  };

  const fetchNutritionData = async (foodItem) => {
    const appId = '777ae872'; // Replace with your Edamam app ID
    const appKey = '88b0a012ec07a3d7f5e2c126c1682884'; // Replace with your Edamam app key
    setLoading(true);

    try {
      const response = await axios.get(`https://api.edamam.com/api/nutrition-data`, {
        params: {
          app_id: appId,
          app_key: appKey,
          ingr: foodItem
        }
      });
      setNutritionData(response.data);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodItemPress = (item) => {
    setSelectedFood(item);
    fetchNutritionData(item);
    setModalVisible(true);
  };

  const renderFoodItem = (item, expirationDate) => (
    <TouchableOpacity style={styles.foodItemContainer} key={item} onPress={() => handleFoodItemPress(item)}>
      <View style={styles.foodItemTextContainer}>
        <Text style={styles.foodItem}>{item}</Text>
      </View>
      <View style={styles.expirationContainer}>
        <Text style={styles.expirationDate}>{getExpirationText(expirationDate)}</Text>
        <View style={[styles.expirationPie, { backgroundColor: getExpirationColor(expirationDate) }]} />
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category, items, color) => (
    <View key={category} style={[styles.categoryContainer, { shadowColor: color }]}>
      <View style={[styles.categoryHeader, { borderLeftColor: color, shadowColor: color }]}>
        <Text style={[styles.categoryTitle, { color: color }]}>{category}</Text>
      </View>
      <View>
        {items.map(food => renderFoodItem(food.item, food.expirationDate))}
      </View>
    </View>
  );

  const getExpirationColor = (expirationDate) => {
    const today = moment();
    const expDate = moment(expirationDate);
    const diffDays = expDate.diff(today, 'days');

    if (diffDays <= 3) {
      return '#FF4D4D'; // Red
    } else if (diffDays <= 7) {
      return '#FFA500'; // Orange
    } else {
      return '#32CD32'; // Green
    }
  };

  const filteredData = expiringSoon
    ? Object.keys(foodData).reduce((acc, category) => {
      const filteredItems = filterExpiringSoon(foodData[category]);
      if (filteredItems.length > 0) {
        acc[category] = filteredItems;
      }
      return acc;
    }, {})
    : foodData;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pantry List</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('GroceryPlanner')}>
            <Image source={require('../assets/search.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExpiringSoon(!expiringSoon)}>
            <Image source={require('../assets/filter.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MealPlanner')}>
            <Image source={require('../assets/dots.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.background} onScroll={handleScroll} scrollEventThrottle={16}>
        <View style={styles.content}>
          {filteredData.Fruits && renderCategory('Fruits', filteredData.Fruits, '#FFA500')}
          {filteredData.Vegetables && renderCategory('Vegetables', filteredData.Vegetables, '#4CAF50')}
          {filteredData.Dairy && renderCategory('Dairy', filteredData.Dairy, '#2196F3')}
          {filteredData.Grains && renderCategory('Grains', filteredData.Grains, '#FFD700')}
          {filteredData.Proteins && renderCategory('Proteins', filteredData.Proteins, '#FF6F61')}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
      {selectedFood && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.safeAreaTop} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFood}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {loading ? (
                <ActivityIndicator size="large" color="#00796b" />
              ) : (
                nutritionData && (
                  <View style={styles.nutritionContainer}>
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    <Text style={styles.nutritionText}>Calories: {nutritionData.calories}</Text>
                    <Text style={styles.nutritionText}>Total Weight: {nutritionData.totalWeight}g</Text>
                    {nutritionData.totalNutrients && Object.keys(nutritionData.totalNutrients).map(nutrient => (
                      <Text key={nutrient} style={styles.nutritionText}>
                        {nutritionData.totalNutrients[nutrient].label}: {nutritionData.totalNutrients[nutrient].quantity.toFixed(2)} {nutritionData.totalNutrients[nutrient].unit}
                      </Text>
                    ))}
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
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
  content: {
    paddingBottom: 60,
  },
  categoryContainer: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    paddingLeft: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  foodItemContainer: {
    paddingVertical: 8,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodItemTextContainer: {
    flexDirection: 'column',
  },
  foodItem: {
    fontSize: 16,
    color: '#000',
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expirationPie: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  expirationDate: {
    fontSize: 14,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#00796b',
  },
  nutritionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nutritionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    fontSize: 36,
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

export default MyPantry;
