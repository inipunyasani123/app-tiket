// Android/iOS: react-native-svg. Versi web (svg.web.js) memakai elemen SVG DOM langsung agar bundel lebih ringan.
import { View } from 'react-native';
import RNSvg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Pattern, Polygon, Rect, Stop, Text } from 'react-native-svg';

export function Svg({ label, style, ...p }) {
  if (!label) return <RNSvg style={style} {...p} />;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={style}>
      <RNSvg {...p} />
    </View>
  );
}
export { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Pattern, Polygon, Rect, Stop, Text as SvgText };
