import Image from "next/image";

export default function HomeWindowContent() {
  return (
    <div className="grid items-start gap-6 md:grid-cols-[150px_1fr]">
      <div className="overflow-hidden rounded-[8px] border border-black/10 bg-white/70">
        <Image
          src="/Aiden Brown.jpg"
          alt="Aiden Brown"
          width={150}
          height={150}
          className="h-[150px] w-full object-cover"
          priority
        />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50">
          Portfolio
        </p>
        <h1 className="text-2xl font-semibold">Hi, I&apos;m Aiden Brown</h1>
        <p className="text-sm">
          Full Stack Developer &amp; Designer
        </p>
        <p className="text-sm">
        Pursuing a Bachelor of Science in Artificial Intelligence at Purdue University, expected to graduate in May 2027.
        I enjoy working on Front-end Development and IOS applications. I'm currently looking for an internship for Winter 2026.
        I'm passionate about building products that solve practical problems I've personally experienced. Whether it's at a hackathon or in my free time, I'm always looking for new projects to work on.
        Please reach out if you have any questions or want to collaborate in a hackathon (I'm willing to travel) or on a project! 
        </p>
      </div>
    </div>
  );
}
