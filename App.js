import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import InputScreen from './src/screens/InputScreen';
import QuickModifyScreen from './src/screens/QuickModifyScreen';
import SearchLoadingScreen from './src/screens/SearchLoadingScreen';
import SearchResultScreen from './src/screens/SearchResultScreen';
import DrawScreen from './src/screens/DrawScreenFixed2';
import RecordScreen from './src/screens/RecordScreen';
import RecordModifyScreen from './src/screens/RecordModifyScreen';
import SearchResultRN from './src/screens/SearchResultRN';
import FileDetailRN from './src/screens/FileDetailRN';
import ProjectLibraryRN from './src/screens/ProjectLibraryRN';
import FolderContentsRN from './src/screens/FolderContentsRN';
import SavedFileDetailRN from './src/screens/SavedFileDetailRN';
import DrawScreenFixed2 from './src/screens/DrawScreenFixed2';
import InputOverviewScreen from './src/screens/InputOverviewScreen';
import IntroScreen from './src/screens/IntroScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={AuthScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Input" component={InputScreen} />
        <Stack.Screen name="InputOverview" component={InputOverviewScreen} />
        <Stack.Screen name="Record" component={RecordScreen} />
        <Stack.Screen name="RecordModify" component={RecordModifyScreen} />
        <Stack.Screen name="Draw" component={DrawScreenFixed2} />
        <Stack.Screen name="QuickModify" component={QuickModifyScreen} />
        <Stack.Screen name="SearchLoading" component={SearchLoadingScreen} />
        <Stack.Screen name="SearchResult" component={SearchResultScreen} />
        <Stack.Screen name="SearchResultRN" component={SearchResultRN} />
        <Stack.Screen name="FileDetailRN" component={FileDetailRN} />
        <Stack.Screen name="ProjectLibraryRN" component={ProjectLibraryRN} />
        <Stack.Screen name="FolderContentsRN" component={FolderContentsRN} />
        <Stack.Screen name="SavedFileDetailRN" component={SavedFileDetailRN} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
