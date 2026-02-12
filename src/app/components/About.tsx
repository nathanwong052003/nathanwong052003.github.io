import { GraduationCap, Award, Code2 } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">About Me</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-600">
              I'm a dedicated Computer Science student with a passion for software development, 
              problem-solving, and continuous learning. My journey in tech started with curiosity 
              and has evolved into a commitment to creating meaningful solutions.
            </p>
            <p className="text-lg text-gray-600">
              When I'm not coding, you can find me contributing to open-source projects, 
              participating in hackathons, or exploring the latest trends in technology.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Education</h3>
                  <p className="text-gray-600">B.S. in Computer Science</p>
                  <p className="text-sm text-gray-500">Expected 2026</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">GPA</h3>
                  <p className="text-gray-600">3.8 / 4.0</p>
                  <p className="text-sm text-gray-500">Dean's List</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-100 rounded-lg h-fit">
                  <Code2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Experience</h3>
                  <p className="text-gray-600">2+ Years</p>
                  <p className="text-sm text-gray-500">Personal Projects</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
            <h3 className="text-2xl mb-6">What I'm Learning</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Advanced Algorithms & Data Structures</p>
                  <p className="text-sm text-gray-600">Optimizing code for performance and efficiency</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Full-Stack Web Development</p>
                  <p className="text-sm text-gray-600">Building scalable applications from front to back</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Machine Learning & AI</p>
                  <p className="text-sm text-gray-600">Exploring neural networks and deep learning</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Cloud Computing</p>
                  <p className="text-sm text-gray-600">AWS, Azure, and containerization with Docker</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
