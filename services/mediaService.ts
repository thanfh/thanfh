
import { db } from './firebase';
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, 
  limit, startAfter, QueryDocumentSnapshot
} from 'firebase/firestore';

// --- CẤU HÌNH CLOUDINARY ---
const CLOUD_NAME = "dbyp13dvt"; 
const UPLOAD_PRESET = "portfolio_preset"; 

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  fullPath: string;
  contentType: string;
  timeCreated: string;
  size: number;
  width: number;
  height: number;
  trashed?: boolean; 
  category?: string;
}

// 1. Upload file lên Cloudinary
export const uploadMedia = async (file: File, category: string = 'uncategorized', onProgress?: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || (CLOUD_NAME as string) === "YOUR_CLOUD_NAME") {
        alert("Lỗi Cấu hình: Chưa nhập Cloud Name trong services/mediaService.ts");
        reject("Missing Cloud Name");
        return;
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);

    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.upload.addEventListener("progress", (e) => {
      const progress = Math.round((e.loaded * 100.0) / e.total);
      if (onProgress) onProgress(progress);
    });

    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // Optimize URL
          const optimizedUrl = response.secure_url.replace('/upload/', '/upload/q_auto,f_auto/');
          
          // Determine correct content type based on Cloudinary resource_type
          // response.resource_type is 'image', 'video', or 'raw'
          let finalContentType = `image/${response.format}`;
          if (response.resource_type === 'video') {
             finalContentType = `video/${response.format}`;
          }

          await saveMediaReferenceToFirestore({
            name: file.name,
            url: optimizedUrl,
            public_id: response.public_id,
            format: response.format,
            bytes: response.bytes,
            width: response.width,
            height: response.height,
            created_at: response.created_at,
            category: category,
            contentType: finalContentType
          });

          resolve(optimizedUrl);
        } else {
          console.error("Cloudinary Error Full:", xhr.responseText);
          const errData = JSON.parse(xhr.responseText || "{}");
          const msg = errData.error?.message || "Unknown error";
          reject(msg);
        }
      }
    };

    xhr.send(fd);
  });
};

const saveMediaReferenceToFirestore = async (cloudinaryData: any) => {
  try {
    await addDoc(collection(db, 'media_library'), {
      name: cloudinaryData.name,
      url: cloudinaryData.url,
      publicId: cloudinaryData.public_id,
      contentType: cloudinaryData.contentType, // Use corrected content type
      size: cloudinaryData.bytes,
      width: cloudinaryData.width || 0,
      height: cloudinaryData.height || 0,
      timeCreated: new Date().toISOString(),
      trashed: false,
      category: cloudinaryData.category || 'uncategorized'
    });
  } catch (error) {
    console.error("Error saving media ref:", error);
  }
};

// 2. Lấy danh sách file (Paginated)
export const getMediaLibrary = async (
    lastDoc: QueryDocumentSnapshot | null = null, 
    pageSize: number = 20,
    filter: { trashed?: boolean } = {}
): Promise<{ items: MediaItem[], lastDoc: QueryDocumentSnapshot | null }> => {
  try {
    // Robust "No Index" Strategy: Order by time, filter client-side if needed for simple setups
    let constraints: any[] = [orderBy('timeCreated', 'desc')];
    
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }
    
    // Fetch extra to handle client-side filtering without running out of items
    constraints.push(limit(pageSize * 3)); 

    const q = query(collection(db, 'media_library'), ...constraints);
    const snapshot = await getDocs(q);
    
    let items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Untitled',
        url: data.url,
        fullPath: data.publicId, 
        contentType: data.contentType || 'image/jpeg',
        timeCreated: data.timeCreated,
        size: data.size || 0,
        width: data.width || 800,
        height: data.height || 800,
        trashed: data.trashed || false,
        category: data.category || 'uncategorized'
      };
    });

    // Client-side filter
    if (filter.trashed !== undefined) {
        items = items.filter(i => i.trashed === filter.trashed);
    }
    
    // Trim back to page size
    if (items.length > pageSize) {
        items = items.slice(0, pageSize);
    }

    return {
        items,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  } catch (error) {
    console.error("Error fetching media library:", error);
    return { items: [], lastDoc: null };
  }
};

export const toggleTrashMedia = async (docId: string, isTrashed: boolean): Promise<void> => {
    try {
        const ref = doc(db, 'media_library', docId);
        await updateDoc(ref, { trashed: isTrashed });
    } catch (error) {
        console.error("Error updating trash status:", error);
        throw error;
    }
};

export const deleteMedia = async (docId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'media_library', docId));
  } catch (error) {
    console.error("Error deleting media ref:", error);
    throw error;
  }
};

export const updateMediaCategory = async (docId: string, newCategory: string): Promise<void> => {
  try {
    const ref = doc(db, 'media_library', docId);
    await updateDoc(ref, { category: newCategory });
  } catch (error) {
    console.error("Error updating media category:", error);
    throw error;
  }
};
