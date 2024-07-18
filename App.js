import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './src/Login';
import Register from './src/Register';
import Home from './src/Home';
import Nutritionist from './src/Nutritionist';
import Pantry from './src/Pantry';
import MealPlanner from './src/MealPlanner';
import MyProfile from './src/MyProfile';
import GroceryPlanner from './src/GroceryPlanner';
import ExpiringSoon from './src/ExpiringSoon';
import WeeklyMealPlan from './src/WeeklyMealPlan';
import RecipeDetails from './src/RecipeDetails';
import StartCooking from './src/StartCooking';
import VideoPlayerScreen from './src/VideoPlayerScreen';
import Upload from './src/Upload';
import { getDBConnection, createTables } from './src/db';
import { MealPlanProvider } from './src/MealPlanContext';

const Stack = createStackNavigator();

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
      } catch (error) {
        console.error('Error initializing database:', error.message);
      }
    };
    initDB();

    const fetchUser = async () => {
      const user = {
        id: 1,
        email: 'jadenbrozynski@icloud.com',
        first_name: 'Jaden',
        last_name: 'Brozynski'
      };
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    <MealPlanProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Nutritionist" component={Nutritionist} />
            <Stack.Screen name="Pantry" component={Pantry} />
            <Stack.Screen name="MealPlanner" component={MealPlanner} />
            <Stack.Screen name="MyProfile" component={MyProfile} />
            <Stack.Screen name="GroceryPlanner" component={GroceryPlanner} />
            <Stack.Screen name="ExpiringSoon" component={ExpiringSoon} />
            <Stack.Screen name="RecipeDetails" component={RecipeDetails} />
            <Stack.Screen name="WeeklyMealPlan" component={WeeklyMealPlan} />
            <Stack.Screen name="StartCooking" component={StartCooking} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            <Stack.Screen name="Upload">
              {props => <Upload {...props} user={currentUser} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </MealPlanProvider>
  );
};

export default App;
