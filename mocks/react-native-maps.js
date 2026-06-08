// mocks/react-native-maps.js
// Drop this at: __mocks__/react-native-maps.js
// Metro's moduleNameMapper (or the web resolver below) will point web builds here.
// This prevents "Importing native-only module" crashes on web.

const React = require("react");
const { View, Text } = require("react-native");

const Stub = () =>
  React.createElement(
    View,
    null,
    React.createElement(Text, null, "Map unavailable on web"),
  );

module.exports = {
  __esModule: true,
  default: Stub,
  MapView: Stub,
  Marker: Stub,
  Callout: Stub,
  Polyline: Stub,
  Polygon: Stub,
  Circle: Stub,
  Overlay: Stub,
  UrlTile: Stub,
  PROVIDER_GOOGLE: "google",
  PROVIDER_DEFAULT: null,
};
