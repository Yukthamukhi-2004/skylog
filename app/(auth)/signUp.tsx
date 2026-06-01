import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  if (signUp.status === "complete" || isSignedIn) return null;

  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });
    if (error) {
      alert(error.message);
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };

  if (
    signUp.status === "missing_requirements" &&
    signUp?.unverifiedFields.includes("email_address") &&
    signUp?.missingFields.length === 0
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
          Verify your Account
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 12 }}>
          We sent a code to your {email}
        </Text>
        <TextInput
          placeholder="Enter Verification Code"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />
        {errors.fields.code && (
          <Text style={{ color: "#ef4444", marginBottom: 12 }}>
            {errors.fields.code.message}
          </Text>
        )}
        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 6 }}>
          ShyLog
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 18 }}>
          Your personalized shield against the elements.
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          Create Account
        </Text>

        <TextInput
          placeholder="First name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          value={firstName}
          onChangeText={setFirstName}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Last name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          value={lastName}
          onChangeText={setLastName}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />
        {errors.fields.emailAddress && (
          <Text style={{ color: "#ef4444" }}>
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            marginTop: 12,
            marginBottom: 12,
          }}
        />
        {errors.fields.password && (
          <Text style={{ color: "#ef4444" }}>
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSignUpPress}
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#6b7280" }}>Already have an account?</Text>
          <Link href="/signIn">
            <Text
              style={{ color: "#2563eb", fontWeight: "700", marginLeft: 8 }}
            >
              Sign In
            </Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
