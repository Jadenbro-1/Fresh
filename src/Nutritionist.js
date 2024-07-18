import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { PieChart, LineChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const Nutritionist = ({ navigation }) => {
  const [pieData, setPieData] = useState([
    { name: 'Carbs', population: 40, color: '#ff6384', legendFontColor: '#fff', legendFontSize: 15 },
    { name: 'Proteins', population: 30, color: '#36a2eb', legendFontColor: '#fff', legendFontSize: 15 },
    { name: 'Fats', population: 20, color: '#ffcd56', legendFontColor: '#fff', legendFontSize: 15 },
  ]);

  useEffect(() => {
    const randomData = () => Math.floor(Math.random() * 100) + 1;
    setPieData(pieData.map(data => ({ ...data, population: randomData() })));
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
    style: {
      borderRadius: 16,
    },
  };

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Weekly Carbs Burned'],
  };

  const progressData = {
    labels: ['Exercise', 'Steps', 'Water'],
    data: [0.10, 0.8, 0.4],
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Health Dashboard</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Progress Chart */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <ProgressChart
            data={progressData}
            width={screenWidth - 55}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chartStyle}
          />
        </View>

        {/* Nutrition Overview Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nutrition Overview</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chartStyle}
          />
        </View>

        {/* Weekly Steps Line Chart */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Weekly Carbs Burned</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 56}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </View>
      </ScrollView>
      
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  safeArea: {
    backgroundColor: '#1E1E1E',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 100, // Ensure there's space for the bottom nav
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2C2C2C',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default Nutritionist;
