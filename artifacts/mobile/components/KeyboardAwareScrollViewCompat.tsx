import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const KeyboardAwareScrollViewCompat = forwardRef<ScrollView, ScrollViewProps & { bottomOffset?: number }>(
  (props, ref) => {
    if (Platform.OS === 'web') {
      // Standard ScrollView is extremely reliable on web and does not intercept pointer/click events
      return (
        <ScrollView
          ref={ref}
          keyboardShouldPersistTaps="handled"
          {...props}
        />
      );
    }
    
    return (
      <KeyboardAwareScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        {...props}
      />
    );
  }
);

KeyboardAwareScrollViewCompat.displayName = 'KeyboardAwareScrollViewCompat';
