import { Github, Linkedin, Mail, ChevronDown } from 'lucide-react';

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              👋 Welcome to my portfolio
            </div>
            <h1 className="text-5xl md:text-6xl">
              Hi, I'm <span className="text-blue-600">Alex</span>
            </h1>
            <h2 className="text-3xl md:text-4xl text-gray-700">
              Computer Science Student
            </h2>
            <p className="text-xl text-gray-600">
              Passionate about building innovative solutions and exploring the intersection of technology and creativity.
            </p>
            <div className="flex gap-4">
              <a
                href="#contact"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get in Touch
              </a>
              <button
                onClick={() => scrollToSection('projects')}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Projects
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-blue-600 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:text-blue-600 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:student@example.com" className="p-2 hover:text-blue-600 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-xl opacity-30"></div>
            <img
              src="https://images.unsplash.com/photo-1683813479742-4730f91fa3ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBjb2RpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcwOTAyMDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Coding workspace"
              className="relative rounded-lg shadow-2xl"
            />
          </div>
        </div>
        <div className="flex justify-center mt-16">
          <button onClick={() => scrollToSection('about')} className="animate-bounce">
            <ChevronDown className="w-8 h-8 text-blue-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
