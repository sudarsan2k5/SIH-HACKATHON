import { useAuth, useClerk } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleGetStarted = () => {
    if (isSignedIn) {
      // User is already signed in, go to welcome screen
      router.push('/welcome');
    } else {
      // User needs to sign in, go to login screen
      router.push('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#E8F4FD', '#DDD6FE', '#F3E8FF']}
        style={styles.gradient}
      >
        {/* Character Illustration Area */}
        <View style={styles.illustrationContainer}>
          {/* Stopwatch Icon */}
          <View style={[styles.floatingIcon, styles.stopwatch]}>
            <Text style={styles.iconText}>⏱️</Text>
          </View>
          
          {/* Chart Icon */}
          <View style={[styles.floatingIcon, styles.chart]}>
            <Text style={styles.iconText}>📊</Text>
          </View>
          
          {/* Calendar Icon */}
          <View style={[styles.floatingIcon, styles.calendar]}>
            <Text style={styles.iconText}>📅</Text>
          </View>
          
          {/* Main Character */}
          <View style={styles.characterContainer}>
            <Text style={styles.characterEmoji}>👨‍💻</Text>
          </View>
          
          {/* Decorative dots */}
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
          <View style={[styles.dot, styles.dot4]} />
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Task Management &{'\n'}To-Do List</Text>
          <Text style={styles.subtitle}>
            This productive tool is designed to help you better manage your task project-wise conveniently!
          </Text>
          
          <TouchableOpacity style={styles.startButton} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>
              {isSignedIn ? 'Go to Welcome' : "Let's Start"}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          
          {/* Show sign out option if user is already signed in */}
          {isSignedIn && (
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={() => signOut()}
            >
              <Text style={styles.signOutText}>Sign Out to Test Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  illustrationContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  stopwatch: {
    top: '20%',
    left: '15%',
  },
  chart: {
    top: '25%',
    right: '20%',
  },
  calendar: {
    top: '60%',
    right: '15%',
  },
  iconText: {
    fontSize: 24,
  },
  characterContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  characterEmoji: {
    fontSize: 60,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot1: {
    backgroundColor: '#60A5FA',
    top: '30%',
    left: '25%',
  },
  dot2: {
    backgroundColor: '#A78BFA',
    top: '45%',
    right: '30%',
  },
  dot3: {
    backgroundColor: '#34D399',
    bottom: '25%',
    left: '20%',
  },
  dot4: {
    backgroundColor: '#FBBF24',
    bottom: '30%',
    right: '25%',
  },
  contentContainer: {
    flex: 0.8,
    paddingHorizontal: 32,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  startButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  arrow: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
