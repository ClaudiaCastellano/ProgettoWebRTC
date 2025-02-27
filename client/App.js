import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from "./pages/Home";
import BroadcasterPage from "./pages/Broadcaster";
import ViewerPage from "./pages/Viewer";

function App() {
  
// Creazione dello stack di navigazione
const Stack = createStackNavigator();

  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home"> 
        <Stack.Screen name="Home" component={Home} options={{ 
          headerLeft: () => null, // Rimuove il pulsante "Back"
          gestureEnabled: false // Disabilita il gesto di swipe-back su iOS
        }}/>
        <Stack.Screen name="Viewer" component={ViewerPage} /> 
        <Stack.Screen name="Broadcast" component={BroadcasterPage} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


