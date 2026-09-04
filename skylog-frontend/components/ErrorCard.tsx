import { Pressable, Text, View } from "react-native";

interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
  type?: "warning" | "error"; // visual style
}

export default function ErrorCard({
  error,
  onRetry,
  type = "error",
}: ErrorCardProps) {
  const bgColor = type === "error" ? "bg-red-50" : "bg-yellow-50";
  const borderColor = type === "error" ? "border-red-200" : "border-yellow-200";
  const textColor = type === "error" ? "text-red-800" : "text-yellow-800";
  const icon = type === "error" ? "⚠️" : "⚡";
  const buttonBg = type === "error" ? "bg-red-100" : "bg-yellow-100";
  const buttonText = type === "error" ? "text-red-700" : "text-yellow-700";

  return (
    <View className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}>
      <View className="flex-row items-start">
        <Text className="text-xl mr-3">{icon}</Text>
        <View className="flex-1">
          <Text className={`${textColor} font-semibold text-sm mb-1`}>
            Unable to Load
          </Text>
          <Text className={`${textColor} text-xs opacity-80`}>{error}</Text>

          {onRetry && (
            <Pressable
              onPress={onRetry}
              className={`${buttonBg} rounded px-3 py-2 mt-3 self-start`}
            >
              <Text className={`${buttonText} text-xs font-semibold`}>
                Try Again
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
