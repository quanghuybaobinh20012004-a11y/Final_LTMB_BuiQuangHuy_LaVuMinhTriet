// src/screens/reports/ReportDetailScreen.tsx
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';
import { getReport, deleteReport, type Report } from '../../services/reports';

// Helper: mở app bản đồ an toàn (Apple Maps / Google Maps)
function openInMaps(lat?: number, lon?: number, label?: string) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    Alert.alert('Thiếu tọa độ', 'Báo cáo này chưa có vị trí để chỉ đường.');
    return;
  }
  const latLng = `${lat},${lon}`;
  const encoded = encodeURIComponent(label || 'Báo cáo');
  const url =
    Platform.OS === 'ios'
      ? `maps://?q=${encoded}&ll=${latLng}`
      : `geo:0,0?q=${latLng}(${encoded})`;

  Linking.openURL(url).catch(() =>
    Alert.alert('Lỗi', 'Không mở được ứng dụng bản đồ.')
  );
}

export default function ReportDetailScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id: string | undefined = route.params?.id;

  const [item, setItem] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    nav.setOptions({
      title: 'Chi tiết báo cáo',
      headerBackTitleVisible: false,
    });
  }, [nav]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) {
          Alert.alert('Lỗi', 'Thiếu ID báo cáo.');
          nav.goBack();
          return;
        }
        const r = await getReport(id);
        if (!mounted) return;
        if (!r) {
          Alert.alert('Không tìm thấy', 'Báo cáo có thể đã bị xoá.');
          nav.goBack();
          return;
        }
        setItem(r);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, nav]);

  const onDelete = () => {
    if (!item) return;
    Alert.alert('Xoá báo cáo?', 'Thao tác này không thể hoàn tác.', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          await deleteReport(item.id);
          Alert.alert('Đã xoá', 'Báo cáo đã được xoá.');
          nav.goBack();
        },
      },
    ]);
  };

  const onShare = async () => {
    if (!item) return;
    const msgLines = [
      `Báo cáo: ${item.description || '(Không mô tả)'}`,
      `Loại: ${item.category.toUpperCase()}`,
      item.latitude != null && item.longitude != null
        ? `Vị trí: ${item.latitude}, ${item.longitude}`
        : undefined,
      new Date(item.createdAt).toLocaleString(),
    ].filter(Boolean);
    try {
      await Share.share({ message: msgLines.join('\n') });
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.subtext }}>Đang tải…</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.subtext }}>Không có dữ liệu.</Text>
      </View>
    );
  }

  const canRoute = item.latitude != null && item.longitude != null;

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* Ảnh */}
      {!!item.photoUri && (
        <Image
          source={{ uri: item.photoUri }}
          style={styles.photo}
        />
      )}

      {/* Thông tin */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.outline },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
          {item.description || '(Không mô tả)'}
        </Text>

        <View style={{ height: spacing.sm }} />

        <Row label="Loại" value={item.category.toUpperCase()} />
        <Row
          label="Thời gian"
          value={new Date(item.createdAt).toLocaleString()}
        />
        <Row
          label="Trạng thái"
          value={item.status ? item.status : 'pending'}
        />
        <Row
          label="Vị trí"
          value={
            canRoute
              ? `${item.latitude}, ${item.longitude}`
              : '—'
          }
        />
      </View>

      {/* Hành động */}
      <View style={styles.actions}>
        <ActionButton
          icon="navigate-outline"
          label="Chỉ đường"
          onPress={() =>
            openInMaps(item.latitude, item.longitude, item.description)
          }
          disabled={!canRoute}
          colors={colors}
        />
        <ActionButton
          icon="create-outline"
          label="Sửa"
          onPress={() => nav.navigate('ReportForm', { id: item.id })}
          colors={colors}
        />
        <ActionButton
          icon="share-outline"
          label="Chia sẻ"
          onPress={onShare}
          colors={colors}
        />
        <ActionButton
          icon="trash-outline"
          label="Xoá"
          danger
          onPress={onDelete}
          colors={colors}
        />
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

/** Hàng thông tin */
function Row({ label, value }: { label: string; value?: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.subtext }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}


function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  danger,
  colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  colors: any;
}) {
  const background = danger ? (colors.danger ?? '#E11D48') : colors.primary;
  const fg = colors.onPrimary;
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionBtn,
        { backgroundColor: background, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Ionicons name={icon} size={18} color={fg} />
      <Text style={[styles.actionTxt, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  card: {
    margin: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.xl,
  },
  title: { fontSize: 18, fontWeight: '900' },
  row: { flexDirection: 'row', marginTop: 8 },
  rowLabel: { width: 90, fontWeight: '700' },
  rowValue: { flex: 1 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.xl,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  actionTxt: { fontWeight: '800' },
});
