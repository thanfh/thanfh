
import { Project, GalleryCollection, PlaygroundSection, HomeContent } from '../types';
import { PROJECTS, GALLERY_SECTIONS, PLAYGROUND_SECTIONS, PROFILE, UI_TEXT, CV_URL, LOFI_MUSIC_URL } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';

// Collection Names in Firestore
const KEYS = {
  HOME: 'content_home',
  GALLERY_OLD: 'content_gallery', // Deprecated, kept for migration
  PLAYGROUND_OLD: 'content_playground' // Deprecated, kept for migration
};

const COLLECTIONS = {
  GALLERIES: 'galleries',
  PLAYGROUND: 'playground',
  PROJECTS: 'projects'
};

// --- DATA FETCHING (READ) ---

export const getHomeContent = async (): Promise<HomeContent> => {
  try {
    const docRef = doc(db, 'portfolio', KEYS.HOME);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HomeContent;
    } else {
      const initial: HomeContent = {
        profile: {
          ...PROFILE,
          cvUrl: CV_URL,
          musicUrl: LOFI_MUSIC_URL,
          socials: PROFILE.socials.map((s, i) => ({ ...s, id: `s-${i}` })) as any
        },
        uiText: UI_TEXT,
        heroConfig: {
            desktopUrl: PROJECTS[1]?.imageUrl || "",
            mobileUrl: PROJECTS[1]?.imageUrl || "",
            overlayOpacity: 0.6
        }
      };
      // SECURITY FIX: Removed saveHomeContent(initial). 
      // We should not write to DB on a public read operation.
      return initial;
    }
  } catch (error) {
    console.error("Error fetching Home:", error);
    return {
        profile: { ...PROFILE, cvUrl: CV_URL, musicUrl: LOFI_MUSIC_URL, socials: PROFILE.socials.map((s, i) => ({ ...s, id: `s-${i}` })) as any },
        uiText: UI_TEXT,
        heroConfig: {
            desktopUrl: PROJECTS[1]?.imageUrl || "",
            mobileUrl: PROJECTS[1]?.imageUrl || "",
            overlayOpacity: 0.6
        }
    };
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
    }

    const docRef = doc(db, 'portfolio', 'content_projects');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data?.items || []) as Project[];
    } else {
      return PROJECTS;
    }
  } catch (error) {
    console.error("Error fetching Projects:", error);
    return PROJECTS;
  }
};

export const getGallery = async (): Promise<GalleryCollection[]> => {
  try {
    // 1. Try fetching from new collection
    const colRef = collection(db, COLLECTIONS.GALLERIES);
    // You can add orderBy here if you add a 'createdAt' or 'order' field to GalleryCollection
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      // Sort manually by ID descending (simulating 'newest first') or implementation specific logic
      // Since existing IDs were timestamps (gal-123...), text sort works reasonably well for reverse chrono
      const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GalleryCollection));
      return items.sort((a, b) => b.id.localeCompare(a.id)); 
    }

    // 2. Migration Logic: If collection empty, check old single document
    const oldDocRef = doc(db, 'portfolio', KEYS.GALLERY_OLD);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
        const oldData = oldDocSnap.data();
        const items = (oldData?.items || []) as GalleryCollection[];
        // NOTE: Automatic migration removed from public read path for security. 
        // Migration should be a manual admin action.
        return items;
    }

    // 3. Fallback to constants
    // SECURITY FIX: Removed automatic seeding.
    return GALLERY_SECTIONS;

  } catch (error) {
    console.error("Error fetching Gallery:", error);
    return GALLERY_SECTIONS;
  }
};

export const getPlayground = async (): Promise<PlaygroundSection[]> => {
  try {
    // 1. Try fetching from new collection
    const colRef = collection(db, COLLECTIONS.PLAYGROUND);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
       const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PlaygroundSection));
       return items.sort((a, b) => b.id.localeCompare(a.id));
    }

    // 2. Migration Logic
    const oldDocRef = doc(db, 'portfolio', KEYS.PLAYGROUND_OLD);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
        const oldData = oldDocSnap.data();
        const items = (oldData?.items || []) as PlaygroundSection[];
        return items;
    }

    // 3. Fallback
    // SECURITY FIX: Removed automatic seeding.
    return PLAYGROUND_SECTIONS;

  } catch (error) {
    console.error("Error fetching Playground:", error);
    return PLAYGROUND_SECTIONS;
  }
};

// --- ATOMIC OPERATIONS (WRITE) ---

// Projects
export const createProject = async (project: Project) => {
    const { id, ...data } = project;
    if (!data.displayOrder) data.displayOrder = Date.now();
    await addDoc(collection(db, COLLECTIONS.PROJECTS), data);
};

export const updateProject = async (project: Project) => {
    if (!project.id) throw new Error("Project ID missing");
    const { id, ...data } = project;
    await setDoc(doc(db, COLLECTIONS.PROJECTS, id), data, { merge: true });
};

export const deleteProjectService = async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id));
};

// Galleries
export const createGalleryCollection = async (collectionData: GalleryCollection) => {
    const { id, ...data } = collectionData;
    // Use setDoc with the specific ID to maintain consistency if ID is generated on client
    await setDoc(doc(db, COLLECTIONS.GALLERIES, id), data);
};

export const updateGalleryCollection = async (id: string, data: Partial<GalleryCollection>) => {
    await updateDoc(doc(db, COLLECTIONS.GALLERIES, id), data);
};

export const deleteGalleryCollectionService = async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.GALLERIES, id));
};

// Playground
export const createPlaygroundSection = async (sectionData: PlaygroundSection) => {
    const { id, ...data } = sectionData;
    await setDoc(doc(db, COLLECTIONS.PLAYGROUND, id), data);
};

export const updatePlaygroundSection = async (id: string, data: Partial<PlaygroundSection>) => {
    await updateDoc(doc(db, COLLECTIONS.PLAYGROUND, id), data);
};

export const deletePlaygroundSectionService = async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.PLAYGROUND, id));
};

export const saveHomeContent = async (content: HomeContent) => {
  try {
    await setDoc(doc(db, 'portfolio', KEYS.HOME), content);
  } catch (e) {
    console.error("Error saving Home:", e);
    alert("Error saving data. Check console/permissions.");
  }
};

// Deprecated functions kept to prevent compile errors during transition if any
export const saveProjects = async (projects: Project[]) => { console.warn("saveProjects is deprecated"); };
export const saveGallery = async (gallery: GalleryCollection[]) => { console.warn("saveGallery (bulk) is deprecated"); };
export const savePlayground = async (playground: PlaygroundSection[]) => { console.warn("savePlayground (bulk) is deprecated"); };
