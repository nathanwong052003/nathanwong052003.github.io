import { GraduationCap } from 'lucide-react';

export function FinalYearProject() {
  return (
    <section id="fyp" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl">Final Year Project</h2>
          </div>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-4"></div>
          <h3 className="text-2xl text-blue-600">Project NAIA</h3>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Project NAIA is a comprehensive passenger flow analytics system developed for multi-line railway networks. 
              The project leverages advanced time series forecasting techniques and big data processing to predict and analyze passenger movement patterns.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl mb-3 text-blue-600">Key Technologies</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Time Series Forecasting (ARIMA, SARIMAX, LightGBM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Apache Kafka for data streaming</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>ClickHouse DB for OLAP operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Jenkins CI/CD Pipeline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Kubernetes for deployment</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xl mb-3 text-blue-600">Achievements</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>20% performance improvement in scripting algorithms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Scalable deployment on Hitachi's ALVEA platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Integrated schema validation for multi-format data</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <p className="text-center text-gray-700">
                <strong>Note:</strong> This project was developed in collaboration with Hitachi Rail GTS as part of my research and development internship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
