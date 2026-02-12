import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { JobExperiences } from './components/JobExperiences';
import { OrganizationalExperiences } from './components/OrganizationalExperiences';
import { FinalYearProject } from './components/FinalYearProject';
import { Gallery } from './components/Gallery';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <JobExperiences />
      <OrganizationalExperiences />
      <FinalYearProject />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}