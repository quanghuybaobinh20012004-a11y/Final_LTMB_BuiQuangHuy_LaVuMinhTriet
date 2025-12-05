// src/screens/WasteGuideScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme';
import { WasteCategory, WASTE_ITEMS, WasteItem } from '../services/wasteGuide';

const CATEGORIES: { id: WasteCategory; label: string }[] = [
  { id: 'organic', label: 'Hữu cơ' },
  { id: 'plastic', label: 'Nhựa' },
  { id: 'metal', label: 'Kim loại' },
  { id: 'e-waste', label: 'Điện tử' },
  { id: 'medical', label: 'Y tế' },
  { id: 'other', label: 'Khác' },
];

export default function WasteGuideScreen() {
  const { colors } = useAppTheme();
  const [selected, setSelected] = useState<WasteCategory | 'all'>('all');
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    let items: WasteItem[] = WASTE_ITEMS;

    if (selected !== 'all') {
      items = items.filter((i) => i.category === selected);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }

    return items;
  }, [selected, query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Hướng dẫn xử lý rác
      </Text>
      <Text style={{ color: colors.subtext, marginBottom: spacing.md }}>
        Chọn loại rác hoặc nhập tên vật phẩm để xem hướng dẫn xử lý & nơi thu
        gom.
      </Text>

      {/* Thanh chọn loại rác */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selected === 'all' ? colors.primary : colors.card,
              borderColor:
                selected === 'all' ? colors.primary : colors.outline,
            },
          ]}
          onPress={() => setSelected('all')}
        >
          <Text
            style={{
              color: selected === 'all' ? colors.onPrimary : colors.text,
              fontWeight: '800',
            }}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((c) => {
          const active = selected === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.outline,
                },
              ]}
              onPress={() => setSelected(c.id)}
            >
              <Text
                style={{
                  color: active ? colors.onPrimary : colors.text,
                  fontWeight: '800',
                }}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ô tìm kiếm */}
      <TextInput
        placeholder="Nhập tên vật phẩm (ví dụ: chai nhựa, pin, khẩu trang...)"
        placeholderTextColor={colors.subtext}
        value={query}
        onChangeText={setQuery}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.bgSoft,
            borderColor: colors.outline,
            color: colors.text,
          },
        ]}
      />

      {/* Danh sách kết quả */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.outline,
              },
            ]}
          >
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={{ color: colors.subtext, marginTop: 4 }}>
              Cách xử lý: {item.howTo}
            </Text>
            <Text
              style={{
                color: colors.subtext,
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              Gợi ý nơi thu gom: {item.locationHint}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.subtext, marginTop: spacing.lg }}>
            Không tìm thấy hướng dẫn phù hợp. Hãy thử từ khóa khác.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
  },
});
