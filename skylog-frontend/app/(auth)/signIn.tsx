import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const onVerifyPress = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
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
            backgroundColor: "#1e90ff",
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
          SkyLog
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 18 }}>
          Your personalized shield against the elements.
        </Text>

        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          Welcome Back
        </Text>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
          Sign in to your account
        </Text>

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
        {errors.fields.identifier && (
          <Text style={{ color: "#ef4444" }}>
            {errors.fields.identifier.message}
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
          onPress={onSignInPress}
          disabled={isLoading}
          style={{
            backgroundColor: "#1e90ff",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#6b7280" }}>Do not have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signUp")}>
            <Text
              style={{ color: "#1e90ff", fontWeight: "700", marginLeft: 8 }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
