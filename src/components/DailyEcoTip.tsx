// src/components/DailyEcoTip.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';

const TIPS = [
  'Tắt đèn và thiết bị điện khi rời khỏi phòng.',
  'Mang túi vải khi đi chợ hoặc siêu thị.',
  'Mang bình nước cá nhân thay vì mua chai nhựa.',
  'Phân loại rác tại nhà: hữu cơ, tái chế, còn lại.',
  'Tắt vòi nước khi đánh răng, rửa bát.',
  'Trồng một chậu cây nhỏ trên ban công hoặc bàn làm việc.',
  'Ưu tiên đi bộ, xe đạp hoặc phương tiện công cộng.',
];

export default function DailyEcoTip() {
  const { colors } = useAppTheme();

  // Lấy "tip hàng ngày" dựa trên ngày trong năm, để hôm nay ai cũng thấy giống nhau
  const tip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return TIPS[dayOfYear % TIPS.length];
  }, []);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.outline },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Mẹo xanh hôm nay
      </Text>
      <Text style={{ color: colors.subtext, marginTop: spacing.xs }}>
        {tip}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
});
