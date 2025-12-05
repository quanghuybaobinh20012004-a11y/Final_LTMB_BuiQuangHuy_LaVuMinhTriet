import { auth, db, storage } from './firebase';
import { collection, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { listReports, type Report, upsertMany } from './reports';

// Helper: lấy uid hiện tại
const uid = () => auth.currentUser?.uid;

function isLocalFile(uri?: string) {
  if (!uri) return false;
  return uri.startsWith('file:') || uri.startsWith('content:');
}

async function uploadImageIfNeeded(r: Report): Promise<string> {
  // Nếu ảnh đã là URL https -> dùng luôn
  if (!isLocalFile(r.photoUri)) return r.photoUri;

  const response = await fetch(r.photoUri);
  const blob = await response.blob();
  const path = `reports/${uid()}/${r.id}.jpg`;
  const rf = ref(storage, path);
  await uploadBytes(rf, blob);
  return await getDownloadURL(rf);
}

// ===== Public APIs =====

// Sao lưu toàn bộ báo cáo của máy hiện tại lên Cloud
export async function backupReportsToCloud(): Promise<{ count: number }> {
  const userId = uid();
  if (!userId) throw new Error('Bạn cần đăng nhập để sao lưu.');

  const my = await listReports();

  for (const item of my) {
    const photoUrl = await uploadImageIfNeeded(item);
    const data: Report = { ...item, photoUri: photoUrl, uid: userId };
    const col = collection(db, 'users', userId, 'reports');
    await setDoc(doc(col, item.id), data, { merge: true });
  }
  return { count: my.length };
}

// Tải toàn bộ báo cáo từ Cloud về máy (gộp với local)
export async function restoreReportsFromCloud(): Promise<{ added: number; total: number }> {
  const userId = uid();
  if (!userId) throw new Error('Bạn cần đăng nhập để khôi phục.');

  const col = collection(db, 'users', userId, 'reports');
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));

  const remote: Report[] = [];
  snap.forEach((d) => {
    const x = d.data() as Report;
    // đảm bảo đúng uid & có ảnh (URL)
    if (x && x.id && x.photoUri) remote.push({ ...x, uid: userId });
  });

  return await upsertMany(remote);
}
