import * as Stable from "expo-router";
import * as Unstable from "expo-router/unstable-native-tabs";
import React from "react";
import { Text, View } from "react-native";

type AnyComp = React.ComponentType<any>;
let Icon: AnyComp, Label: AnyComp, NativeTabs: AnyComp & { Trigger: AnyComp };
try {
  if (
    (Stable as any)?.NativeTabs &&
    (Stable as any)?.Icon &&
    (Stable as any)?.Label
  ) {
    Icon = (Stable as any).Icon;
    Label = (Stable as any).Label;
    NativeTabs = (Stable as any).NativeTabs;
  } else {
    Icon = (Unstable as any).Icon;
    Label = (Unstable as any).Label;
    NativeTabs = (Unstable as any).NativeTabs;
  }
} catch (err) {
  // Fallback shims to avoid runtime crashes; these render basic content and
  // should be replaced by the proper tabs implementation for production.

  function IconFallback(props: any) {
    return React.createElement(Text, null, "");
  }
  Icon = IconFallback;

  function LabelFallback(props: { children?: React.ReactNode }) {
    return React.createElement(Text, null, props.children || "");
  }
  Label = LabelFallback;

  function NativeTabsFallback({ children }: { children?: React.ReactNode }) {
    return React.createElement(View, null, children);
  }
  NativeTabs = NativeTabsFallback as any;
  (NativeTabs as any).Trigger = function NativeTabsTriggerFallback(props: any) {
    return React.createElement(View, null, props.children);
  };
  // log once so developers are aware
  console.warn(
    "expo-router native tabs import failed; using fallback. See TODO in _layout.jsx",
    err,
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
