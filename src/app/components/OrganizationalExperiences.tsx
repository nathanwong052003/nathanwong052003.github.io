import { Users } from 'lucide-react';

export function OrganizationalExperiences() {
  const organizations = [
    {
      name: 'Southeast Asian Students\' Association by HKUSTSU',
      position: 'President',
      responsibilities: [
        'Oversaw the progress of six events and directed a team of 20 while actively initiating new projects and initiatives.',
        'Increased participation rates to events by 300% from the 4 major Southeast Asian country groups in HKUST.',
        'Advocated recommendations to Southeast Asians in HKUST and acting as representatives to the Student Union.',
      ],
    },
    {
      name: 'International Council of Malaysian Scholars (ICMS)',
      position: 'Internal Affairs and Executive Director',
      responsibilities: [
        'Led the Internal Affairs division consisting of 28 chapter directors and 92 associates from all over the globe.',
        'Spearheaded the Gala Night Initiative with 250 attendees consisting of sponsors and alumni for a night of reunion.',
        'Established connections with companies such as Axiata, Shopee, Shell, Procter & Gamble, Maybank and Sunway.',
      ],
    },
  ];

  return (
    <section id="organizations" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Organizational Experiences</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="space-y-12">
          {organizations.map((org, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg shadow-md">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl mb-2">{org.name}</h3>
                  <h4 className="text-xl text-blue-600 mb-2">{org.position}</h4>
                </div>
              </div>
              <ul className="space-y-3">
                {org.responsibilities.map((responsibility, idx) => (
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
