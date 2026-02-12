export function Skills() {
  const skillCategories = [
    {
      title: 'Programming Languages',
      skills: [
        { name: 'Python', level: 100 },
        { name: 'SQL', level: 100 },
        { name: 'CSS', level: 100 },
        { name: 'C++', level: 80 },
        { name: 'C#', level: 80 },
        { name: 'HTML', level: 80 },
        { name: 'Java', level: 80 },
        { name: 'JavaScript', level: 60 },
        { name: 'Bash', level: 60 },
      ],
    },
    {
      title: 'Tools & Tech Stack',
      skills: [
        { name: 'Git', level: 100 },
        { name: 'Docker', level: 80 },
        { name: 'Apache Spark', level: 80 },
        { name: 'Apache Kafka', level: 80 },
        { name: 'AWS EC2', level: 80 },
        { name: 'Jenkins', level: 60 },
      ],
    },
  ];

  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Technical Skills</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Technologies and tools I work with</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category) => (
            <div key={category.title} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl mb-6 text-blue-600">{category.title}</h3>
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span>{skill.name}</span>
                      <span className="text-gray-500">
                        {'★'.repeat(Math.ceil(skill.level / 20))}
                        {'☆'.repeat(5 - Math.ceil(skill.level / 20))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}