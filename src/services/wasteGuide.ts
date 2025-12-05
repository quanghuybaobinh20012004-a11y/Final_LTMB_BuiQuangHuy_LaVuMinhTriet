// src/services/wasteGuide.ts
export type WasteCategory = 'organic' | 'plastic' | 'metal' | 'e-waste' | 'medical' | 'other';

export type WasteItem = {
  id: string;
  name: string;
  category: WasteCategory;
  howTo: string;
  locationHint: string;
  keywords: string[];
};

export const WASTE_ITEMS: WasteItem[] = [
  {
    id: 'banana-peel',
    name: 'Vỏ chuối',
    category: 'organic',
    howTo: 'Bỏ vào thùng rác hữu cơ hoặc làm phân compost.',
    locationHint: 'Thùng rác hữu cơ tại nhà hoặc điểm thu gom rác xanh.',
    keywords: ['vỏ chuối', 'chuối'],
  },
  {
    id: 'plastic-bottle',
    name: 'Chai nhựa',
    category: 'plastic',
    howTo: 'Rửa sạch, tháo nắp, ép dẹp rồi bỏ vào thùng tái chế nhựa.',
    locationHint: 'Điểm thu gom rác tái chế, siêu thị xanh.',
    keywords: ['chai nhựa', 'chai nước', 'chai pet'],
  },
  {
    id: 'aluminum-can',
    name: 'Lon nước ngọt',
    category: 'metal',
    howTo: 'Rửa sạch, ép dẹp và bỏ vào thùng rác tái chế kim loại.',
    locationHint: 'Điểm thu gom ve chai, bãi tái chế kim loại.',
    keywords: ['lon', 'lon nước ngọt', 'lon bia'],
  },
  {
    id: 'old-phone',
    name: 'Điện thoại cũ',
    category: 'e-waste',
    howTo: 'Không vứt chung với rác sinh hoạt. Mang đến điểm thu hồi rác điện tử.',
    locationHint: 'Cửa hàng điện máy, điểm thu hồi rác điện tử của hãng.',
    keywords: ['điện thoại', 'điện thoại cũ', 'smartphone'],
  },
  {
    id: 'battery',
    name: 'Pin đã qua sử dụng',
    category: 'e-waste',
    howTo: 'Không vứt vào thùng rác thường. Cất trong hộp kín và mang tới điểm thu gom pin.',
    locationHint: 'Siêu thị, trung tâm thương mại có điểm thu gom pin.',
    keywords: ['pin', 'pin tiểu', 'pin con ó'],
  },
  {
    id: 'mask',
    name: 'Khẩu trang y tế đã dùng',
    category: 'medical',
    howTo: 'Cho vào túi kín, buộc chặt và bỏ vào thùng rác y tế/nơi quy định.',
    locationHint: 'Thùng rác y tế ở bệnh viện, trạm y tế.',
    keywords: ['khẩu trang', 'khẩu trang y tế'],
  },
];
