    // src/navigation/ReportsStack.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppTheme } from '../theme/ThemeProvider';
import MyReportsScreen from '../screens/reports/MyReportsScreen';
import ReportFormScreen from '../screens/reports/ReportFormScreen';

const Stack = createNativeStackNavigator();

export default function ReportsStack() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={({ navigation }) => ({
          title: 'Báo cáo của tôi',
          // MyReports là màn gốc của stack này => không có back mặc định,
          // nên ta vẽ headerLeft gọi goBack() ở NAVIGATOR CHA (Root)
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.getParent()?.goBack()}
              accessibilityLabel="Quay lại"
              style={{ paddingHorizontal: 10, paddingVertical: 6 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ReportForm"
        component={ReportFormScreen}
        options={{ title: 'Báo cáo' }}
      />
    </Stack.Navigator>
  );
}
