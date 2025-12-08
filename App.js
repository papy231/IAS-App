import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScrren';
import InputScreen from './src/screens/InputScreen';
import QuickModifyScreen from './src/screens/QuickModifyScreen';
import SearchLoadingScreen from './src/screens/SearchLoadingScreen';
import SearchResultScreen from './src/screens/SearchResultScreen';
import DrawScreen from './src/screens/DrawScreenFixed2';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Input" component={InputScreen} />
        <Stack.Screen name="Draw" component={DrawScreen} />
        <Stack.Screen name="QuickModify" component={QuickModifyScreen} />
        <Stack.Screen name="SearchLoading" component={SearchLoadingScreen} />
        <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
