import Image from 'next/image';

export default function Hero() {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="max-w-5xl w-full">
        <div className="border-2 border-black p-6 sm:p-10 bg-[#f9f4ec]">
          <div className="grid gap-8 md:grid-cols-[160px_1fr] items-start">
            <div className="flex justify-center md:justify-start">
              <div className="w-36 h-36 overflow-hidden border-2 border-black">
                <Image
                  src="/Aiden Brown.jpg"
                  alt="Aiden Brown"
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>

            <div className="space-y-6 text-left">
              <div>
                <p className="text-xs uppercase font-bold tracking-[0.2em]">Portfolio</p>
                <h1 className="text-4xl sm:text-5xl font-black text-black mt-3">
                  Hi, I&apos;m <span className="underline underline-offset-4">Aiden Brown</span>
                </h1>
                <p className="text-lg sm:text-xl font-bold text-black mt-3">
                  Full Stack Developer &amp; Designer
                </p>
              </div>

              <p className="text-base sm:text-lg font-medium">
                Pursuing a Bachelor of Science in Computer Science at Purdue University, expected to graduate in May 2027.
                Focused on Front-end Development and IOS applications. Currently looking for an internship for Summer 2026.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#projects"
                  className="px-6 py-2 bg-black text-[#f6f1e7] font-bold uppercase tracking-wide border-2 border-black text-center"
                >
                  View My Work
                </a>
                <a
                  href="#contact"
                  className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wide text-center"
                >
                  Get In Touch
                </a>
              </div>

              <div>
                <p className="text-xs uppercase font-bold tracking-[0.2em] mb-3">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Swift', 'Python'].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 border border-black text-sm font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
