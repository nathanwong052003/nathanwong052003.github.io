import { GraduationCap, Award, Code2, Download } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Introduction</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-600">
              Hello! I'm Nathan Wong Shih Hao, a Computer Science student at HKUST with a passion for data science and engineering. 
              I enjoy exploring new technologies and applying them to solve real-world problems.
            </p>
            <p className="text-lg text-gray-600">
              Welcome to my personal website where I share my projects, experiences, and interests. Feel free to explore and connect with me!
            </p>

            <a 
              href="documents/Nathan_Wong_CV.pdf" 
              download 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download my CV
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Education</h3>
                  <p className="text-gray-600">B.S. in Computer Science</p>
                  <p className="text-sm text-gray-500">HKUST</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <Code2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Specialization</h3>
                  <p className="text-gray-600">Data Science</p>
                  <p className="text-sm text-gray-500">Data Engineering</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
            <h3 className="text-2xl mb-6">Languages I Speak</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">English</p>
                  <p className="text-sm text-gray-600">Fluent</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Chinese Mandarin</p>
                  <p className="text-sm text-gray-600">Fluent</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Bahasa Indonesia</p>
                  <p className="text-sm text-gray-600">Fluent</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}