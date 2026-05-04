import Image from "next/image";

export default function AboutWindowContent() {
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-black/10 bg-white/60 p-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
        About / Bio
      </p>
      <p className="text-sm">
        I'm a student at Purdue University pursuing a Bacherlor of Science in Artificial Intelligence.
        I chose Purdue as it's in my home state of Indiana and it has an excellent Computer Science Department.
        Here at Purdue, I'm a member of Purdue Hackers, Purdue Blood Initiative, and Purdue Sigma Nu where I held the position of Public Relations Chairman.
        I like building products that solve practical problems I&apos;ve personally experienced. Many of my projects on this site came from issues I've came across in my own life.
        If you'd like to reach out or learn more about me, please feel free to contact me on LinkedIn or via email.
      </p>
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white/60 shadow-sm">
        <Image
          src="/SigmaNu.jpg"
          alt="Purdue Sigma Nu"
          width={960}
          height={540}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 520px"
        />
      </div>
    </div>
  );
}
