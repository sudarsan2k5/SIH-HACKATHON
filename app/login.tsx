import { useClerk, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  // Clerk hooks
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  // Component state
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleSendCode = async () => {
    // Validation
    if (!signInLoaded || !signUpLoaded || !email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await attemptSignIn();
    } catch (signInError: any) {
      try {
        await attemptSignUp(signInError);
      } catch (err: any) {
        Alert.alert('Error', err.errors?.[0]?.message || 'Failed to send verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const attemptSignIn = async () => {
    const signInAttempt = await signIn.create({ identifier: email.trim() });
    
    // Get email address ID for existing users
    const emailFactor = signInAttempt.supportedFirstFactors?.find(
      (factor: any) => factor.strategy === 'email_code'
    );
    
    if (emailFactor?.emailAddressId) {
      await signIn.prepareFirstFactor({ 
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId
      });
    } else {
      await signIn.prepareFirstFactor({ strategy: 'email_code' });
    }
    
    setIsSignUp(false);
    setPendingVerification(true);
    Alert.alert('Success', `Verification code sent to ${email}`);
  };

  const attemptSignUp = async (signInError: any) => {
    if (signInError.errors?.[0]?.code === 'form_identifier_not_found') {
      await signUp.create({ emailAddress: email.trim() });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setIsSignUp(true);
      setPendingVerification(true);
      Alert.alert('Success', `Welcome! Verification code sent to ${email}`);
    } else {
      throw signInError;
    }
  };

  const handleVerifyCode = async () => {
    // Validation
    if (!signInLoaded || !signUpLoaded || !code.trim() || loading || verificationSuccess) {
      if (!code.trim()) {
        Alert.alert('Error', 'Please enter the verification code');
      }
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        await handleSignUpVerification();
      } else {
        await handleSignInVerification();
      }
    } catch (err: any) {
      handleVerificationError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpVerification = async () => {
    const signUpAttempt = await signUp.attemptEmailAddressVerification({
      code: code.trim(),
    });

    if (signUpAttempt.status === 'complete') {
      await completeAuthentication(signUpAttempt.createdSessionId);
    } else if (signUpAttempt.status === 'missing_requirements') {
      await handleMissingRequirements(signUpAttempt);
    } else {
      Alert.alert('Error', 'Account creation incomplete. Please try again.');
    }
  };

  const handleSignInVerification = async () => {
    const signInAttempt = await signIn.attemptFirstFactor({
      strategy: 'email_code',
      code: code.trim(),
    });

    if (signInAttempt.status === 'complete') {
      await completeAuthentication(signInAttempt.createdSessionId);
    } else {
      Alert.alert('Error', 'Sign in incomplete. Please try again.');
    }
  };

  const completeAuthentication = async (sessionId: string) => {
    setVerificationSuccess(true);
    await setActive({ session: sessionId });
    router.replace('/welcome');
  };

  const handleMissingRequirements = async (signUpAttempt: any) => {
    try {
      const username = email.split('@')[0] + Date.now();
      const updateData: any = {};
      
      if (signUpAttempt.missingFields.includes('username')) {
        updateData.username = username;
      }
      if (signUpAttempt.missingFields.includes('password')) {
        updateData.password = 'TempPass123!';
      }
      
      const updateAttempt = await signUp.update(updateData);
      
      if (updateAttempt.status === 'complete') {
        await completeAuthentication(updateAttempt.createdSessionId);
      } else {
        showConfigurationAlert();
      }
    } catch (updateError: any) {
      showConfigurationAlert();
    }
  };

  const showConfigurationAlert = () => {
    Alert.alert(
      'Setup Required',
      'Please configure your Clerk dashboard for email-only authentication. Go to User & Authentication settings and set only Email as required.',
      [
        {
          text: 'OK',
          onPress: resetForm
        }
      ]
    );
  };

  const handleVerificationError = (err: any) => {
    if (err.errors?.[0]?.message?.includes('already been verified')) {
      Alert.alert('Success', 'Verification successful! Redirecting...', [
        {
          text: 'OK',
          onPress: () => router.replace('/welcome')
        }
      ]);
    } else {
      Alert.alert('Error', err.errors?.[0]?.message || 'Invalid verification code');
    }
  };

  const resetForm = () => {
    setPendingVerification(false);
    setCode('');
    setVerificationSuccess(false);
    setIsSignUp(false);
  };

  const handleBackToEmail = () => {
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#7C3AED', '#A78BFA', '#DDD6FE']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {!pendingVerification ? (
              <>
                {/* Email Input Screen */}
                <View style={styles.header}>
                  <Text style={styles.title}>Welcome to{'\n'}Task Manager</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address to sign in or create an account
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Continue with Email</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Verification Screen */}
                <View style={styles.header}>
                  <Text style={styles.title}>Verify Your Email</Text>
                  <Text style={styles.subtitle}>
                    {isSignUp 
                      ? 'Welcome! We\'ve sent a verification code to' 
                      : 'We\'ve sent a verification code to'
                    }{'\n'}
                    <Text style={styles.emailText}>{email}</Text>
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, (loading || verificationSuccess) && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading || verificationSuccess}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : verificationSuccess ? (
                    <>
                      <Text style={styles.buttonText}>Success! ✓</Text>
                    </>
                  ) : (
                    <Text style={styles.buttonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToEmail}
                  disabled={loading}
                >
                  <Text style={styles.backButtonText}>← Change Email Address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: 'white',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
