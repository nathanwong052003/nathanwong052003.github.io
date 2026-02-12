import { Camera } from 'lucide-react';

export function Gallery() {
  const photos = [
    {
      url: 'https://images.unsplash.com/photo-1674699244662-980de86e2bbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3JvbnRvJTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc3MDgyNjYxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Toronto Skyline at Night',
      location: 'Toronto, October 2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1611963058380-4a114d1e9731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5mZiUyMG1vdW50YWluJTIwbGFrZXxlbnwxfHx8fDE3NzA5MDI4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Mount Vermont',
      location: 'Banff, October 2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1755689910361-4793707c160f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBjb2ZmZWUlMjBzaG9wfGVufDF8fHx8MTc3MDkwMjgxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Bakehouse',
      location: 'Hong Kong, January 2026',
    },
    {
      url: 'https://images.unsplash.com/photo-1669061271628-b96df6faadbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIwbG91aXNlJTIwc3VucmlzZSUyMGNhbmFkYXxlbnwxfHx8fDE3NzA5MDI4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Calm Sunrise',
      location: 'Lake Louise, October 2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1611963058380-4a114d1e9731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5mZiUyMG1vdW50YWluJTIwbGFrZXxlbnwxfHx8fDE3NzA5MDI4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Cabin by the Lake',
      location: 'Lake Louise, October 2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1732029461791-d8cc10292acf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25nJTIwa29uZyUyMHRyYW0lMjBuaWdodHxlbnwxfHx8fDE3NzA5MDI4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Tram',
      location: 'Hong Kong, September 2025',
    },
    {
      url: 'https://images.unsplash.com/photo-1666899354442-d8b958627dd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25nJTIwa29uZyUyMHNreWxpbmUlMjBuaWdodHxlbnwxfHx8fDE3NzA4MDU5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Hong Kong at Night 1',
      location: 'Hong Kong, September 2025',
    },
    {
      url: 'https://images.unsplash.com/photo-1666899354442-d8b958627dd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25nJTIwa29uZyUyMHNreWxpbmUlMjBuaWdodHxlbnwxfHx8fDE3NzA4MDU5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Hong Kong at Night 2',
      location: 'Hong Kong, September 2025',
    },
  ];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
            <h2 className="text-4xl">Gallery</h2>
          </div>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">I also take some pictures!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl mb-2">{photo.title}</h3>
                  <p className="text-sm text-gray-200">{photo.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
