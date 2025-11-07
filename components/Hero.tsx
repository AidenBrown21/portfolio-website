import Image from 'next/image';

export default function Hero() {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-7xl mx-auto text-center">
        <div className="space-y-8">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 ring-4 ring-orange-500/30">
              <Image
                src="/Aiden Brown.jpg"
                alt="Aiden Brown"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Aiden Brown
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300">
              Full Stack Developer & Designer
            </p>
          </div>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg text-gray-400">
            Pursuing a Bachelor of Science in Computer Science at Purdue University, expected to graduate in May 2027.
            Focused on Front-end Development and IOS applications. Currently looking for an internship for Summer 2026.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#projects"
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all font-medium w-full sm:w-auto"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border-2 border-gray-600 text-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-400 transition-colors font-medium w-full sm:w-auto"
            >
              Get In Touch
            </a>
          </div>

          {/* Tech Stack */}
          <div className="pt-12">
            <p className="text-sm text-gray-400 mb-4">TECH STACK</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Swift', 'Python'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-gray-200 rounded-full text-sm font-medium border border-gray-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
