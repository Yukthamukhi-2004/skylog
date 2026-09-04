import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DropdownPickerProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
  multi?: boolean;
}

export default function DropdownPicker({
  label,
  options,
  selected,
  onToggle,
  placeholder = "Select...",
  multi = true,
}: DropdownPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.length} selected`;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-500 mb-1.5">{label}</Text>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5"
        activeOpacity={0.7}
      >
        <Text
          className={`text-base ${selected.length === 0 ? "text-gray-400" : "text-gray-800"}`}
          numberOfLines={1}
        >
          {displayText}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl max-h-[70%] pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text className="text-[#1e90ff] text-base font-medium">
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 py-3">
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 text-base"
              />
            </View>

            {/* Options */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              className="px-2"
              renderItem={({ item }) => {
                const isSelected = selected.includes(item);
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onToggle(item);
                      if (!multi) setVisible(false);
                    }}
                    className={`flex-row items-center px-4 py-3.5 mx-2 rounded-xl mb-1 ${
                      isSelected ? "bg-[#1e90ff]/10" : "active:bg-gray-100"
                    }`}
                    activeOpacity={0.6}
                  >
                    {/* Checkbox circle */}
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        isSelected
                          ? "border-[#1e90ff] bg-[#1e90ff]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <Text className="text-white text-xs font-bold">
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text className="text-gray-800 text-base flex-1">{item}</Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-400 text-base">
                    No results found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
