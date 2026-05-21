// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Essential tab and navigation icons
  'house.fill': 'home',
  'bag.fill': 'shopping-bag',
  'bag': 'shopping-bag',
  'magnifyingglass': 'search',
  'cart.fill': 'shopping-cart',
  'person.fill': 'person',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'chevron.down': 'keyboard-arrow-down',
  
  // UI action and state icons
  'minus': 'remove',
  'plus': 'add',
  'trash': 'delete',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'exclamationmark.circle.fill': 'error',
  
  // Feature-specific icons
  'clock': 'access-time',
  'pencil': 'edit',
  'location': 'room',
  'info.circle': 'info',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'eye.slash': 'visibility-off',
  'eye': 'visibility',
  'list.bullet': 'view-list',
  'square.grid.2x2': 'grid-view',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
