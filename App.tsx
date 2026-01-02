
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import CaseStudyView from './components/CaseStudyView';
import GalleryView from './components/GalleryView';
import PlaygroundView from './components/PlaygroundView';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import GridDebugger from './components/GridDebugger';
import TransitionCurtain from './components/TransitionCurtain';
import { Project, GalleryCollection, PlaygroundSection, HomeContent } from './types';
import { AnimatePresence } from 'framer-motion';
import { getProjects, getGallery, getPlayground, getHomeContent } from './services/contentService';
import { preloadAssets } from './services/assetLoader';
import { PROFILE } from './constants';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));

const MainLayout = () => {
    const profile = PROFILE;
    const location = useLocation();
    const navigate = useNavigate();

    // --- TRANSITION STATE ---
    // displayLocation tracks the page actually being rendered while the curtain is moving
    const [displayLocation, setDisplayLocation] = useState(location);
    const [showCurtain, setShowCurtain] = useState(true);
    const [transitionLabel, setTransitionLabel] = useState(profile.name);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // --- DATA STATE ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [gallery, setGallery] = useState<GalleryCollection[]>([]);
    const [playground, setPlayground] = useState<PlaygroundSection[]>([]);
    const [homeContent, setHomeContent] = useState<HomeContent | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // --- HELPER: Get Label based on Path ---
    const getLabelForPath = (pathname: string): string => {
        if (pathname === '/' || pathname === '/home') return homeContent?.profile?.name || profile.name;
        if (pathname.startsWith('/work')) {
            // Check if specific project
            const parts = pathname.split('/');
            if (parts.length > 2) {
                const projId = parts[2];
                const proj = projects.find(p => p.id === projId);
                return proj ? proj.title : "Case Study";
            }
            return "Work";
        }
        if (pathname.startsWith('/gallery')) return "Gallery";
        if (pathname.startsWith('/playground')) return "Playground";
        if (pathname.startsWith('/admin')) return "CMS System";
        return "";
    };

    // --- ROUTING TRANSITION LOGIC ---
    useEffect(() => {
        // If the location matches what we are displaying, do nothing
        if (location.pathname === displayLocation.pathname && location.search === displayLocation.search) return;

        const triggerTransition = async () => {
            // 1. Set Label for the NEXT view
            setTransitionLabel(getLabelForPath(location.pathname));
            if (!isLoading) setIsInitialLoad(false);

            // 2. Curtain Down
            setShowCurtain(true);

            // 3. Wait for curtain to cover (1.1s)
            await new Promise(resolve => setTimeout(resolve, 1100));

            // 4. Update the displayed page
            window.scrollTo({ top: 0, behavior: 'auto' });
            setDisplayLocation(location);

            // 5. Curtain Up (handled by AnimatePresence + showCurtain state)
            setTimeout(() => {
                setShowCurtain(false);
            }, 100);
        };

        triggerTransition();
    }, [location, displayLocation, isLoading, projects, homeContent]); // Dependencies to ensure labels update if data loads late

    // --- DYNAMIC HEAD META TAGS UPDATE ---
    useEffect(() => {
        if (homeContent) {
            // Update Title
            if (homeContent.siteTitle) {
                document.title = homeContent.siteTitle;
            }

            // Update Favicon
            if (homeContent.faviconUrl) {
                const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
                if (link) link.href = homeContent.faviconUrl;
            }

            // Update OG Image (Open Graph + Twitter)
            if (homeContent.ogImageUrl) {
                const ogImage = document.querySelector('meta[property="og:image"]');
                if (ogImage) ogImage.setAttribute('content', homeContent.ogImageUrl);

                const twitterImage = document.querySelector('meta[property="twitter:image"]');
                if (twitterImage) twitterImage.setAttribute('content', homeContent.ogImageUrl);
            }

            // Update OG Title/Description based on profile
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const twTitle = document.querySelector('meta[property="twitter:title"]');
            if (homeContent.profile?.name) {
                const title = `${homeContent.profile.name} | Portfolio`;
                if (ogTitle) ogTitle.setAttribute('content', title);
                if (twTitle) twTitle.setAttribute('content', title);
            }

            const ogDesc = document.querySelector('meta[property="og:description"]');
            const twDesc = document.querySelector('meta[property="twitter:description"]');
            if (homeContent.profile?.tagline) {
                const desc = homeContent.profile.tagline;
                if (ogDesc) ogDesc.setAttribute('content', desc);
                if (twDesc) twDesc.setAttribute('content', desc);
            }

            // Update URL
            const currentUrl = window.location.href;
            const ogUrl = document.querySelector('meta[property="og:url"]');
            const twUrl = document.querySelector('meta[property="twitter:url"]');
            if (ogUrl) ogUrl.setAttribute('content', currentUrl);
            if (twUrl) twUrl.setAttribute('content', currentUrl);
        }
    }, [homeContent, location]);

    // --- ASSET COLLECTION & INIT ---
    const getAllPublicAssets = (
        projects: Project[],
        gallery: GalleryCollection[],
        playground: PlaygroundSection[],
        home: HomeContent | null
    ): string[] => {
        const urls = new Set<string>();
        if (home) {
            if (home.heroConfig?.desktopUrl) urls.add(home.heroConfig.desktopUrl);
            if (home.heroConfig?.mobileUrl) urls.add(home.heroConfig.mobileUrl);
        }
        projects.forEach(p => { if (p.imageUrl) urls.add(p.imageUrl); });
        return Array.from(urls);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        const init = async () => {
            setLoadingProgress(5);
            try {
                const [p, g, pg, h] = await Promise.all([
                    getProjects(),
                    getGallery(),
                    getPlayground(),
                    getHomeContent()
                ]);

                setProjects(p);
                setGallery(g);
                setPlayground(pg);
                setHomeContent(h);

                // Set initial label
                setTransitionLabel(getLabelForPath(window.location.pathname));

                setLoadingProgress(15);

                if (window.location.pathname.startsWith('/admin')) {
                    setLoadingProgress(100);
                } else {
                    const allAssets = getAllPublicAssets(p, g, pg, h);
                    if (allAssets.length > 0) {
                        await preloadAssets(allAssets, (assetProgress) => {
                            const totalProgress = 15 + (assetProgress * 0.85);
                            setLoadingProgress(Math.min(totalProgress, 100));
                        });
                    } else {
                        setLoadingProgress(100);
                    }
                }

            } catch (e) {
                console.error("Initialization error", e);
            } finally {
                setLoadingProgress(100);
                setTimeout(() => {
                    setIsLoading(false);
                    setTimeout(() => setShowCurtain(false), 200);
                }, 800);
            }
        };

        init();
        document.documentElement.classList.add('dark');
        return () => unsubscribe();
    }, []);

    // Global Admin Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                navigate('/admin');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // Audio Logic
    useEffect(() => {
        if (audioRef.current && profile.musicUrl) {
            audioRef.current.volume = 0.3;
            if (isMusicPlaying) {
                audioRef.current.play().catch(() => setIsMusicPlaying(false));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isMusicPlaying, profile.musicUrl]);

    const safeUiText = homeContent?.uiText || {};
    const safeProfile = homeContent?.profile || profile;
    const isHiddenHeader = displayLocation.pathname.startsWith('/admin');

    return (
        <div className={`min-h-screen font-sans transition-opacity duration-1000 flex flex-col ${isLoading ? 'h-screen overflow-hidden' : 'opacity-100'}`}>

            {/* GLOBAL LOADING SCREEN */}
            <AnimatePresence>
                {isLoading && <LoadingScreen progress={loadingProgress} />}
            </AnimatePresence>

            {/* GLOBAL TRANSITION CURTAIN */}
            <AnimatePresence mode="wait">
                {showCurtain && !isLoading && (
                    <TransitionCurtain key="global-curtain" label={transitionLabel} isInitial={isInitialLoad} />
                )}
            </AnimatePresence>

            <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} flex flex-col min-h-screen`}>
                <CustomCursor />
                <GridDebugger />
                {profile.musicUrl && <audio ref={audioRef} src={profile.musicUrl} loop hidden />}

                {!isHiddenHeader && (
                    <Header
                        profile={safeProfile}
                        isMusicPlaying={isMusicPlaying}
                        toggleMusic={() => setIsMusicPlaying(!isMusicPlaying)}
                    />
                )}

                {/* MAIN CONTENT AREA */}
                <main className="w-full flex-grow relative z-10">
                    <Routes location={displayLocation}>
                        <Route path="/" element={
                            <Hero
                                profile={safeProfile}
                                uiText={safeUiText}
                                heroConfig={homeContent?.heroConfig}
                            />
                        } />

                        <Route path="/work" element={
                            <ProjectGrid
                                projects={projects}
                                uiText={safeUiText}
                            />
                        } />

                        <Route path="/work/:id" element={
                            <CaseStudyView
                                allProjects={projects}
                                uiText={safeUiText}
                            />
                        } />

                        <Route path="/gallery" element={
                            <GalleryView
                                collections={gallery}
                            />
                        } />

                        <Route path="/playground" element={
                            <PlaygroundView
                                sections={playground}
                            />
                        } />

                        <Route path="/admin" element={
                            <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white font-mono text-xs uppercase">Initializing CMS...</div>}>
                                {isAuthenticated ? (
                                    <AdminDashboard
                                        onBack={() => navigate('/')}
                                        onRefresh={() => window.location.reload()}
                                        onLogout={() => auth.signOut()}
                                    />
                                ) : (
                                    <AdminLogin
                                        onSuccess={() => setIsAuthenticated(true)}
                                        onCancel={() => navigate('/')}
                                    />
                                )}
                            </Suspense>
                        } />

                        {/* Fallback to Home */}
                        <Route path="*" element={
                            <Hero
                                profile={safeProfile}
                                uiText={safeUiText}
                                heroConfig={homeContent?.heroConfig}
                            />
                        } />
                    </Routes>
                </main>

                {!isHiddenHeader && (
                    <Footer profile={safeProfile} uiText={safeUiText} />
                )}
            </div>
        </div>
    );
};

function App() {
    return <MainLayout />;
}

export default App;
