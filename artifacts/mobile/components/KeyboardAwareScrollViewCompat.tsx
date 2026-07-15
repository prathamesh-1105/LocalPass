import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const KeyboardAwareScrollViewCompat = forwardRef<ScrollView, ScrollViewProps & { bottomOffset?: number }>(
  (props, ref) => {
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
