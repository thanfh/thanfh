
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

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
        if (location.pathname === displayLocation.pathname && location.search === displayLocation.search) return;

        const triggerTransition = async () => {
            setTransitionLabel(getLabelForPath(location.pathname));
            if (!isLoading) setIsInitialLoad(false);
            setShowCurtain(true);
            await new Promise(resolve => setTimeout(resolve, 1100));
            window.scrollTo({ top: 0, behavior: 'auto' });
            setDisplayLocation(location);
            setTimeout(() => {
                setShowCurtain(false);
            }, 100);
        };

        triggerTransition();
    }, [location, displayLocation, isLoading, projects, homeContent]);

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

    // --- SEO / HELMET DATA PREP ---
    const safeUiText = homeContent?.uiText || {};
    const safeProfile = homeContent?.profile || profile;
    const isHiddenHeader = displayLocation.pathname.startsWith('/admin');
    const currentUrl = window.location.href;

    const toAbsoluteUrl = (url: string | undefined): string => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return `${window.location.origin}${url}`;
        return url;
    };

    const safeTitle = homeContent?.siteTitle || "Portfolio";
    const safeOgTitle = homeContent?.profile?.name ? `${homeContent.profile.name} | Portfolio` : safeTitle;
    const safeOgDesc = homeContent?.profile?.tagline || homeContent?.profile?.bio?.slice(0, 150) || "Creative Portfolio";
    const safeOgImage = toAbsoluteUrl(homeContent?.ogImageUrl);
    const safeFavicon = toAbsoluteUrl(homeContent?.faviconUrl);

    return (
        <div className={`min-h-screen font-sans transition-opacity duration-1000 flex flex-col ${isLoading ? 'h-screen overflow-hidden' : 'opacity-100'}`}>

            <Helmet>
                <title>{safeTitle}</title>
                {safeFavicon && <link rel="icon" href={safeFavicon} />}

                <meta property="og:type" content="website" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={safeOgTitle} />
                <meta property="og:description" content={safeOgDesc} />
                {safeOgImage && <meta property="og:image" content={safeOgImage} />}
                {safeOgImage && <meta itemProp="image" content={safeOgImage} />}

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={currentUrl} />
                <meta property="twitter:title" content={safeOgTitle} />
                <meta property="twitter:description" content={safeOgDesc} />
                {safeOgImage && <meta property="twitter:image" content={safeOgImage} />}
            </Helmet>

            <AnimatePresence>
                {isLoading && <LoadingScreen progress={loadingProgress} />}
            </AnimatePresence>

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

                <main className="w-full flex-grow relative z-10">
                    <Routes location={displayLocation}>
                        <Route path="/" element={<Hero profile={safeProfile} uiText={safeUiText} heroConfig={homeContent?.heroConfig} />} />
                        <Route path="/work" element={<ProjectGrid projects={projects} uiText={safeUiText} />} />
                        <Route path="/work/:id" element={<CaseStudyView allProjects={projects} uiText={safeUiText} />} />
                        <Route path="/gallery" element={<GalleryView collections={gallery} />} />
                        <Route path="/playground" element={<PlaygroundView sections={playground} />} />
                        <Route path="/admin" element={
                            <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white font-mono text-xs uppercase">Initializing CMS...</div>}>
                                {isAuthenticated ? (
                                    <AdminDashboard onBack={() => navigate('/')} onRefresh={() => window.location.reload()} onLogout={() => auth.signOut()} />
                                ) : (
                                    <AdminLogin onSuccess={() => setIsAuthenticated(true)} onCancel={() => navigate('/')} />
                                )}
                            </Suspense>
                        } />
                        <Route path="*" element={<Hero profile={safeProfile} uiText={safeUiText} heroConfig={homeContent?.heroConfig} />} />
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
