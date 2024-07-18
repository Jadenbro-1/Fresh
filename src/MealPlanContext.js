import React, { createContext, useContext, useState } from 'react';

const MealPlanContext = createContext();

export const MealPlanProvider = ({ children }) => {
  const [mealPlans, setMealPlans] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const addMealsToDay = (day, meals) => {
    setMealPlans(prevMealPlans => ({
      ...prevMealPlans,
      [day]: [...prevMealPlans[day], ...meals]
    }));
  };

  const removeMealFromDay = (day, meal) => {
    setMealPlans(prevMealPlans => ({
      ...prevMealPlans,
      [day]: prevMealPlans[day].filter(m => m.id !== meal.id)
    }));
  };

  return (
    <MealPlanContext.Provider value={{ mealPlans, setMealPlans, addMealsToDay, removeMealFromDay }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => useContext(MealPlanContext);
