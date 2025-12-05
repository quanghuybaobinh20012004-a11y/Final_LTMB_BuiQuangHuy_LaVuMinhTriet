// src/screens/reports/MyReportsScreen.tsx
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../theme/ThemeProvider';
import { spacing, radius } from '../../theme';

import {
  listReports,
  deleteReport,
  exportReportsToFile,
  importReportsFromFile,
  type Report,
  CATEGORIES,
} from '../../services/reports';
import { onReportsChanged } from '../../utils/reportEvents';

type SortKey = 'newest' | 'oldest';

export default function MyReportsScreen() {
  const { colors } = useAppTheme();
  const nav = useNavigation<any>();

  // dữ liệu
  const [items, setItems] = useState<Report[]>([]);
  const [busy, setBusy] = useState(false);

  // filter / search / sort
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'tất cả' | (typeof CATEGORIES)[number]>('tất cả');
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  // tải dữ liệu
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await listReports();
      setItems(data);
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    // tự refetch khi có sự kiện thay đổi báo cáo (tạo/sửa/xoá)
    const off = onReportsChanged(load);
    return off;
  }, [load]);

  // header actions: SHARE trước, IMPORT sau (đúng như label)
  const onShare = useCallback(async () => {
    try {
      const { uri, count } = await exportReportsToFile();
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Đã xuất', `File: ${uri}\nSố bản ghi: ${count}`);
      }
    } catch (e: any) {
      Alert.alert('Chia sẻ thất bại', e?.message ?? 'Không thể chia sẻ JSON.');
    }
  }, []);

  const onImport = useCallback(async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', multiple: false });
      if (picked.canceled || !picked.assets?.length) return;
      const { uri } = picked.assets[0];
      const res = await importReportsFromFile(uri);
      Alert.alert('Đã nhập', `Thêm mới: ${res.added}\nTổng cộng: ${res.total}`);
      load();
    } catch (e: any) {
      Alert.alert('Nhập thất bại', e?.message ?? 'Không thể nhập JSON.');
    }
  }, [load]);

  useLayoutEffect(() => {
    nav.setOptions({
      headerShown: true,                 // đảm bảo có nút back
      title: 'Báo cáo của tôi',
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12, marginRight: spacing.md }}>
          {/* Share */}
          <TouchableOpacity onPress={onShare} style={{ padding: 6 }} accessibilityLabel="Chia sẻ JSON">
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          {/* Import */}
          <TouchableOpacity onPress={onImport} style={{ padding: 6 }} accessibilityLabel="Nhập JSON">
            <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [nav, colors.text, onShare, onImport]);

  const norm = (s?: string) => (s ?? '').toLowerCase().trim();

  const filtered = useMemo(() => {
    const nq = norm(q);
    let arr = items.filter(r => {
      const hitQ =
        !nq ||
        norm(r.description).includes(nq) ||
        norm(r.category).includes(nq);
      const hitCat = cat === 'tất cả' ? true : r.category === cat;
      return hitQ && hitCat;
    });

    if (sortBy === 'newest') arr = arr.sort((a, b) => Number(b.id) - Number(a.id));
    else arr = arr.sort((a, b) => Number(a.id) - Number(b.id));

    return arr;
  }, [items, q, cat, sortBy]);

  const confirmDelete = useCallback((id: string) => {
    Alert.alert('Xoá báo cáo', 'Bạn có chắc muốn xoá?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReport(id);
            load();
          } catch (e: any) {
            Alert.alert('Xoá thất bại', e?.message ?? 'Không thể xoá.');
          }
        },
      },
    ]);
  }, [load]);

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      {/* thanh search + filter */}
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          <Ionicons name="search" size={16} color={colors.subtext} style={{ marginRight: 8 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Tìm mô tả / loại báo cáo…"
            placeholderTextColor={colors.subtext}
            style={{ color: colors.text, paddingVertical: 8, flex: 1 }}
          />
          <TouchableOpacity onPress={() => setQ('')}>
            <Ionicons name="close-circle" size={18} color={q ? colors.subtext : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md }}>
          {(['tất cả', ...CATEGORIES] as const).map(c => {
            const active = c === cat;
            return (
              <TouchableOpacity
                key={String(c)}
                onPress={() => setCat(c as any)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.outline,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>
                  {String(c).toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => setSortBy(s => (s === 'newest' ? 'oldest' : 'newest'))}
            style={[styles.chip, { borderColor: colors.outline, backgroundColor: colors.card }]}
          >
            <Ionicons name="swap-vertical" size={14} color={colors.text} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {sortBy === 'newest' ? 'MỚI → CŨ' : 'CŨ → MỚI'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* danh sách */}
      {filtered.length === 0 && !busy ? (
        <View style={styles.empty}>
          <Text style={{ color: colors.subtext, textAlign: 'center' }}>
            Không có báo cáo nào phù hợp.
          </Text>
          <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 4 }}>
            Dùng nút “+” để tạo báo cáo mới hoặc thử thay đổi bộ lọc.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          refreshing={busy}
          onRefresh={load}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingTop: spacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => nav.navigate('ReportDetail', { id: item.id })}
              onLongPress={() => confirmDelete(item.id)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.outline }]}
            >
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {!!item.photoUri && (
                  <Image
                    source={{ uri: item.photoUri }}
                    style={{ width: 72, height: 72, borderRadius: radius.lg }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>
                    {item.description || '(Không mô tả)'}
                  </Text>
                  <Text style={{ color: colors.subtext, marginTop: 2 }}>
                    {item.category.toUpperCase()}
                  </Text>
                  <Text style={{ color: colors.subtext, marginTop: 2 }} numberOfLines={1}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={{ padding: 6, alignSelf: 'center' }}>
                  <Ionicons name="trash-outline" size={20} color={(colors as any).danger ?? '#E11D48'} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
  },

  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
});
