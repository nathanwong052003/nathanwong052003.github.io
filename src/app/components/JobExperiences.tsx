import { Briefcase } from 'lucide-react';

export function JobExperiences() {
  const jobs = [
    {
      company: 'Hitachi Rail GTS',
      position: 'R&D Software Intern',
      period: 'June 2025 to January 2026',
      responsibilities: [
        'Researched regression models for Project NAIA to forecast passenger flow analytics for multi-line networks.',
        'Enhanced the performance of the primary scripting algorithm by 20% and optimized the data collection system through the use of batch processing in ClickHouse DB, leveraging its OLAP architecture for improved query performance.',
        'Engineered a Kafka pipeline and implemented a producer-consumer side schema registry, integrating schema validation to facilitate the ingestion of data in various formats for improved data processing and pipeline integration.',
        'Coordinated the deployment of Project NAIA to Hitachi\'s ALVEA platform by implementing a Jenkins CI/CD pipeline for integrated testing and employing a Kubernetes cluster for operational management, with an emphasis on scalability.',
        'Explored the most effective time series forecasting models, concentrating on ARIMA, SARIMAX, and LightGBM.',
      ],
    },
    {
      company: 'Total Rehabilitation Management (HK)',
      position: 'Software Developer',
      period: 'June 2024 to August 2024',
      responsibilities: [
        'Designed and implemented a client-side legal document search bar using JavaScript, C#, and MySQL, achieving 70% completion within the timeline. Streamlined legal document retrieval, reducing search time by 50%.',
        'Collaborated with the Claims Department to revamp a data extraction system utilizing Python and MySQL, achieving automation in insurance claim data processing that reduced analysis time by 80%, enhancing operational efficiency.',
        'Researched and evaluated multiple large language models (GPT-4o, GPT 4o-mini, Claude, Gemini, etc) to filter and prioritize insurance claim information, reducing manual bias and document review times by 20%.',
        'Led the development and deployment of a chatbot for the internal staff portal using JavaScript and C#, increasing user engagement from 2 messages per week to 20 messages per day and enhancing staff-client communication.',
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Job Experiences</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="space-y-12">
          {jobs.map((job, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-2">{job.company}</h3>
                  <h4 className="text-xl text-blue-600 mb-2">{job.position}</h4>
                  <p className="text-gray-500">{job.period}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{responsibility}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
