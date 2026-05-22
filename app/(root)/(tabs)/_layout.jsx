import React from "react";

let Icon, Label, NativeTabs;
try {
  const stable = require("expo-router");
  if (stable?.NativeTabs && stable?.Icon && stable?.Label) {
    Icon = stable.Icon;
    Label = stable.Label;
    NativeTabs = stable.NativeTabs;
  } else {
    const unstable = require("expo-router/unstable-native-tabs");
    Icon = unstable.Icon;
    Label = unstable.Label;
    NativeTabs = unstable.NativeTabs;
  }
} catch (err) {
  // Fallback shims to avoid runtime crashes; these render basic content and
  // should be replaced by the proper tabs implementation for production.

  const { Text, View } = require("react-native");
  Icon = (props) => React.createElement(Text, null, "");
  Label = (props) => React.createElement(Text, null, props.children || "");
  NativeTabs = ({ children }) => React.createElement(View, null, children);
  // log once so developers are aware

  console.warn(
    "expo-router native tabs import failed; using fallback. See TODO in _layout.jsx",
  );
}

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Analysis">
        <Icon sf="graph.fill" />
        <Label>Analysis</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <Icon sf="heart.fill" />
        <Label>Saved</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
