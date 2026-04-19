import React from "react";
import { ToastProvider } from "./hooks/use-toast";
import SiteNav from "./components/SiteNav.jsx";
import HomeHero from "./components/HomeHero.jsx";
import AboutSection from "./components/AboutSection.jsx";
import ServicesSection from "./components/ServicesSection.jsx";
import ExperienceSection from "./components/ExperienceSection.jsx";
import StackSection from "./components/StackSection.jsx";
import WorkSection from "./components/WorkSection.jsx";
import Engagement from "./components/Engagement.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-black text-zinc-100">
        <SiteNav />
        <main>
          <HomeHero />
          <AboutSection />
          <ServicesSection />
          <ExperienceSection />
          <StackSection />
          <WorkSection />
          <Engagement />
          <Contact />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
