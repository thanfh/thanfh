
import { Profile, Project, GalleryCollection, PlaygroundSection } from './types';
import * as Assets from './assets';

// Move CV_URL and LOFI_MUSIC_URL above PROFILE to satisfy the Profile type requirement
export const CV_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; 
export const LOFI_MUSIC_URL = Assets.AUDIO_LOFI_BG;

export const PROFILE: Profile = {
  name: "Thanfh",
  role: "Multi-disciplinary Designer",
  tagline: "Crafting digital experiences at the intersection of art and technology.",
  bio: "I am a senior creative designer with over 8 years of experience specializing in 3D visualization, brand identity, and motion graphics. My work explores the relationship between organic forms and rigid digital structures, utilizing tools like Blender, Houdini, and React to bring concepts to life.",
  email: "hello.thanfh@gmail.com",
  cvUrl: CV_URL,
  musicUrl: LOFI_MUSIC_URL,
  socials: [
    { id: "fb", platform: "Facebook", url: "https://www.facebook.com/n.thanfh", iconName: "Facebook" },
    { id: "ig", platform: "Instagram", url: "https://www.instagram.com/n.thanfh/", iconName: "Instagram" },
    { id: "tg", platform: "Telegram", url: "https://t.me/nthanfh", iconName: "Telegram" },
    { id: "li", platform: "LinkedIn", url: "https://www.linkedin.com/in/th%C3%A0nh-nguy%E1%BB%85n-a99182228/?trk=opento_sprofile_goalscard", iconName: "Linkedin" }
  ]
};

export const UI_TEXT = {
  hero_about_me: "About Me",
  hero_manifesto_quote: "Design is not just what it looks like and feels like. Design is how it works.",
  hero_view_all: "View All Projects",
  work_title: "WORK",
  work_selected_works: "Selected Works",
  work_featured_projects: "Featured Projects",
  work_view_project: "View Project",
  playground_title: "PLAYGROUND",
  playground_lab: "Experimental Lab",
  playground_description: "A collection of daily drills, unused concepts, and visual experiments. Where function takes a backseat to form.",
  gallery_title: "GALLERY",
  gallery_location: "Location",
  gallery_date: "Date",
  case_study_back: "Back to Work",
  case_study_overview: "Overview",
  case_study_services: "Services / Tools",
  case_study_client: "Client",
  case_study_year: "Year",
  case_study_challenge: "The Challenge",
  case_study_solution: "The Solution",
  case_study_more: "More Projects",
  case_study_view_all: "View All",
  confidential: "Confidential",
  tools_used: "Tools Used",
  view_live: "View Live Case Study",
  footer_title: "Let's work together." 
};

export const NAV_LINKS = [
  { label: "Work", href: "work" },
  { label: "Gallery", href: "gallery" },
  { label: "Playground", href: "playground" },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Nebula Identity",
    category: "Branding",
    year: "2023",
    displayOrder: 1,
    star: 1,
    description: "A comprehensive brand overhaul for a fintech startup focused on decentralized finance.",
    challenge: "Traditional fintech branding is often cold and overly corporate. Nebula needed an identity that felt technologically advanced yet human-centric and fluid.",
    solution: "We developed a dynamic visual system based on organic gradients and structured typography, symbolizing the balance between the fluidity of finance and the rigidity of code.",
    imageUrl: Assets.IMG_NEBULA_MAIN,
    tools: ["Illustrator", "Figma", "After Effects"],
    blocks: [
      {
        type: "text",
        id: "b1",
        title: "The Vision",
        content: "Nebula aims to bridge the gap between complex blockchain technology and everyday financial usability. We focused on the concept of 'Cloud-First Finance'."
      },
      {
        type: "image-grid",
        id: "b2",
        layout: "simple-2",
        images: [Assets.IMG_NEBULA_GRID_1, Assets.IMG_NEBULA_GRID_2]
      },
      {
        type: "quote",
        id: "b3",
        text: "Innovation is the ability to see change as an opportunity, not a threat.",
        author: "Steve Jobs (Inspired Nebula's Ethos)"
      },
      {
        type: "full-image",
        id: "b4",
        imageUrl: Assets.IMG_NEBULA_FULL,
        caption: "Hero visualization for the web landing page."
      }
    ]
  },
  {
      id: "p2",
      title: "Flow State",
      category: "3D",
      year: "2024",
      displayOrder: 2,
      star: 1,
      description: "An exploration of fluid dynamics and soft-body physics using Houdini and Redshift.",
      challenge: "Capturing the erratic nature of digital fluids while maintaining an aesthetic that feels premium and intentional.",
      solution: "By utilizing procedural noise and custom viscosity shaders, we created a series of loops that feel both alien and familiar.",
      imageUrl: Assets.IMG_FLOW_MAIN,
      videoUrl: Assets.VID_CHROME_ARTIFACTS,
      tools: ["Houdini", "Redshift", "Nuke"],
      blocks: [
          {
             type: "two-column",
             id: "fs1",
             leftTitle: "The Core Concept",
             leftContent: "Flow State is a personal R&D project investigating how viscous fluids interact with rigid obstacles in zero gravity environments.",
             rightImage: Assets.IMG_FLOW_PROCESS_1
          },
          {
             type: "full-image",
             id: "fs2",
             imageUrl: Assets.IMG_FLOW_RESULT_1,
             caption: "High-resolution frame render from the final sequence."
          },
          {
             type: "image-grid",
             id: "fs3",
             layout: "simple-2",
             images: [Assets.IMG_FLOW_RESULT_2, Assets.IMG_FLOW_PROCESS_2]
          }
      ]
  },
  {
      id: "p3",
      title: "Echoes of Silence",
      category: "Motion",
      year: "2024",
      displayOrder: 3,
      description: "Audio-visual experience exploring the translation of sound into light patterns.",
      challenge: "Synchronizing high-frequency audio data with complex 3D geometry without overwhelming the viewer.",
      solution: "We mapped the mid-tones to light intensity and high-tones to geometric distortion, creating a responsive 'living' environment.",
      imageUrl: Assets.IMG_ECHO_MAIN,
      tools: ["After Effects", "C4D", "Ableton"],
      blocks: [
          {
            type: "text",
            id: "e1",
            title: "Auditory Landscapes",
            content: "Using MIDI data as a driver for procedural animation allows for a 1:1 correlation between what is heard and what is seen."
          },
          {
            type: "image-grid",
            id: "e2",
            layout: "simple-2",
            images: [Assets.IMG_ECHO_DETAIL_1, Assets.IMG_ECHO_DETAIL_2]
          }
      ]
  }
];

export const GALLERY_SECTIONS: GalleryCollection[] = [
    {
        id: "hanoi",
        title: "Hanoi Streetlife",
        location: "Hanoi, Vietnam",
        date: "Oct 2024",
        images: [
            { src: Assets.IMG_GAL_HN_1, width: 800, height: 1200, id: "hn1" },
            { src: Assets.IMG_GAL_HN_2, width: 1200, height: 800, id: "hn2" },
            { src: Assets.IMG_GAL_HN_3, width: 800, height: 800, id: "hn3" },
            { src: Assets.IMG_GAL_HN_4, width: 1200, height: 800, id: "hn4" }
        ]
    },
    {
        id: "tokyo",
        title: "Tokyo Nights",
        location: "Tokyo, Japan",
        date: "Dec 2023",
        images: [
            { src: Assets.IMG_GAL_TK_1, width: 800, height: 1200, id: "tk1" },
            { src: Assets.IMG_GAL_TK_2, width: 1200, height: 800, id: "tk2" },
            { src: Assets.IMG_GAL_TK_3, width: 800, height: 1000, id: "tk3" },
            { src: Assets.IMG_GAL_TK_4, width: 1000, height: 800, id: "tk4" }
        ]
    }
];

export const PLAYGROUND_SECTIONS: PlaygroundSection[] = [
  {
    id: "typography",
    title: "Typographic Drills",
    description: "Daily exercises in layout, hierarchy, and type design.",
    items: [
      { id: "pg1", title: "Drill 01: Swiss Style", src: Assets.IMG_PG_TYPO_1, width: 800, height: 1200, tag: "Poster" },
      { id: "pg2", title: "Drill 02: Brutalism", src: Assets.IMG_PG_TYPO_2, width: 800, height: 1000, tag: "Poster" },
      { id: "pg3", title: "Drill 03: Minimalism", src: Assets.IMG_PG_TYPO_3, width: 800, height: 800, tag: "Layout" },
      { id: "pg4", title: "Drill 04: Kinetic Type", src: Assets.IMG_PG_TYPO_4, width: 800, height: 1200, tag: "Motion" }
    ]
  },
  {
      id: "procedural",
      title: "Procedural R&D",
      description: "Testing nodes, physics, and shaders in Blender/Houdini.",
      items: [
      { id: "pg5", title: "Vellum Test", src: Assets.IMG_PG_3D_1, width: 800, height: 600, tag: "Simulation" },
      { id: "pg6", title: "Abstract Form", src: Assets.IMG_PG_3D_2, width: 800, height: 800, tag: "Modeling" },
      { id: "pg7", title: "Crystal Growth", src: Assets.IMG_PG_3D_3, width: 800, height: 1100, tag: "Nodes" },
      { id: "pg8", title: "Cloth Dynamics", src: Assets.IMG_PG_3D_4, width: 800, height: 900, tag: "Simulation" },
      { id: "pg9", title: "Organic Structure", src: Assets.IMG_PG_3D_5, width: 800, height: 800, tag: "3D" }
    ]
  }
];
