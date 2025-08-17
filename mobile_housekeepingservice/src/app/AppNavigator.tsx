import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets, StackCardInterpolationProps } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import { Platform } from 'react-native';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  VerifyOTPScreen,
  ResetPasswordScreen,
  DashboardScreen,
} from '../screens';
import type { RootStackParamList } from '../types/auth';
import { COLORS, ANIMATION_CONFIGS, getBaseScreenOptions } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

// Define navigation flow hierarchy for better animation direction
const NAVIGATION_HIERARCHY = {
  'Login': 0,
  'Register': 1,
  'ForgotPassword': 1,
  'VerifyOTP': 2,
  'ResetPassword': 3,
} as const;

// Custom transition based on navigation direction  
const getAuthScreenOptions = (routeName: string): StackNavigationOptions => {
  const baseOptions = getBaseScreenOptions(COLORS.background);

  // For Login - when navigating TO Login (back from Register/ForgotPassword)
  if (routeName === 'Login') {
    return {
      ...baseOptions,
      // When going back to Login, slide from left
      cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-layouts.screen.width, 0],
                }),
              },
            ],
          },
        };
      },
      transitionSpec: {
        open: {
          animation: 'timing' as const,
          config: {
            duration: 300,
          },
        },
        close: {
          animation: 'timing' as const,
          config: {
            duration: 250,
          },
        },
      },
    };
  }

  // For Register and ForgotPassword - slide from right (forward navigation)
  if (routeName === 'Register' || routeName === 'ForgotPassword') {
    return {
      ...baseOptions,
      ...ANIMATION_CONFIGS.slideFromRight,
    };
  }

  // For other screens (VerifyOTP, ResetPassword) - continue sliding from right
  return {
    ...baseOptions,
    ...ANIMATION_CONFIGS.slideFromRight,
  };
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={({ route }) => getAuthScreenOptions(route.name)}
    initialRouteName="Login"
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={getAuthScreenOptions('Login')}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={getAuthScreenOptions('Register')}
    />
    <Stack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen}
      options={getAuthScreenOptions('ForgotPassword')}
    />
    <Stack.Screen 
      name="VerifyOTP" 
      component={VerifyOTPScreen}
      options={getAuthScreenOptions('VerifyOTP')}
    />
    <Stack.Screen 
      name="ResetPassword" 
      component={ResetPasswordScreen}
      options={getAuthScreenOptions('ResetPassword')}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...getBaseScreenOptions(COLORS.background),
      ...ANIMATION_CONFIGS.slideFromRight,
    }}
    initialRouteName="Dashboard"
  >
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        ...getBaseScreenOptions(COLORS.background),
        ...ANIMATION_CONFIGS.fade,
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return null; // You can replace this with a loading component
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        ...getBaseScreenOptions(COLORS.background),
        ...ANIMATION_CONFIGS.fade,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen 
          name="Main" 
          component={MainStack}
          options={{
            ...getBaseScreenOptions(COLORS.background),
            ...ANIMATION_CONFIGS.fade,
          }}
        />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{
            ...getBaseScreenOptions(COLORS.background),
            ...ANIMATION_CONFIGS.fade,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PaperProvider>
      <LanguageProvider>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </LanguageProvider>
    </PaperProvider>
  );
};

export default AppNavigator;
