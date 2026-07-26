import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { AartiChalisaScreen } from "../screens/AartiChalisaScreen";
import { HawanGuideScreen } from "../screens/HawanGuideScreen";
import { PanditDetailScreen } from "../screens/PanditDetailScreen";
import { BookingsScreen } from "../screens/BookingsScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { PanditJiScreen } from "../screens/PanditJiScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { StoreScreen } from "../screens/StoreScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { CartScreen } from "../screens/CartScreen";

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeList" component={HomeScreen} />
      <HomeStack.Screen name="AartiChalisa" component={AartiChalisaScreen} options={{ headerShown: true, title: "Aarti / Chalisa", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }} />
      <HomeStack.Screen name="HawanGuide" component={HawanGuideScreen} options={{ headerShown: true, title: "Hawan Guide", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }} />
      <HomeStack.Screen name="PanditDetail" component={PanditDetailScreen} />
    </HomeStack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="StoreList" component={StoreScreen} />
      <StoreStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <StoreStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: true, title: "Cart", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }}
      />
    </StoreStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ExpertChat" component={ChatScreen} />
      <ChatStack.Screen
        name="PanditJi"
        component={PanditJiScreen}
        options={{ headerShown: true, title: "PanditJi", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }}
      />
    </ChatStack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#7a2e1d" }}>
      <Tab.Screen name="Discover" component={HomeStackScreen} />
      <Tab.Screen name="Store" component={StoreStackScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Chat" component={ChatStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f1e8" }}>
        <ActivityIndicator size="large" color="#7a2e1d" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="AppTabs" component={Tabs} />
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
      <RootStack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{ headerShown: true, title: "Verify Email", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }}
      />
      <RootStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: "Forgot Password", headerStyle: { backgroundColor: "#f8f1e8" }, headerTintColor: "#7a2e1d" }}
      />
    </RootStack.Navigator>
  );
}
