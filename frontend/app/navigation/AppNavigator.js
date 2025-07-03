import React, { useCallback, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import MovieListScreen from '../screens/Movies/MovieListScreen';
import MovieDetailsScreen from '../screens/Movies/MovieDetailsScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import SearchScreen from '../screens/Movies/SearchScreen';
import UserSearchScreen from '../screens/Users/UserSearchScreen';
import UserDetailsScreen from '../screens/Users/UserDetailsScreen';
import UserFavoritesScreen from '../screens/Users/UserFavoritesScreen';
import UserLikesScreen from '../screens/Users/UserLikesScreen';
import UserDislikesScreen from '../screens/Users/UserDislikesScreen';
import LikesScreen from '../screens/Favorites/LikesScreen';
import DislikesScreen from '../screens/Favorites/DislikesScreen';
import RecommendationScreen from '../screens/Recommendation/RecommendationScreen';
import MailboxScreen from '../screens/Profile/MailboxScreen';
import AiScreen from '../screens/Ai/AiScreen';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants/Config';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const [recommendationCount, setRecommendationCount] = useState(0);
  const { token } = useAuth();

  const fetchRecommendationCount = async () => {
    try {
      if (!token) return;
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/received/count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendationCount(response.data.count);
    } catch (error) {
      console.error('Erro ao buscar count de recomendações:', error.response?.data || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecommendationCount();
    }, [token])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#000',
          height: 47,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor: '#222430',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Movies') {
            iconName = focused ? 'film' : 'film-outline';
          } else if (route.name === '?') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Movies" component={MovieListScreen} />
      <Tab.Screen name="?" component={AiScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarBadge: recommendationCount > 0 ? recommendationCount : null }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
          <Stack.Screen name="UserFavorites" component={UserFavoritesScreen} />
          <Stack.Screen name="UserLikes" component={UserLikesScreen} />
          <Stack.Screen name="UserDislikes" component={UserDislikesScreen} />
          <Stack.Screen name="Recommendation" component={RecommendationScreen} />
          <Stack.Screen name="Mailbox" component={MailboxScreen} />
          <Stack.Screen name="Likes" component={LikesScreen} />
          <Stack.Screen name="Dislikes" component={DislikesScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="UserSearch" component={UserSearchScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

