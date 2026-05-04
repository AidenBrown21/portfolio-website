'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Project } from "@/types/project";

interface ProjectWindowContentProps {
  project: Project;
}

export default function ProjectWindowContent({
  project,
}: ProjectWindowContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = useMemo(() => project.projectImages ?? [], [project.projectImages]);
  const hasImages = images.length > 0;

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-black/10 bg-white/60 p-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">
        File / {project.title}
      </p>

      {hasImages ? (
        <div className="space-y-2">
          <div className="relative h-52 overflow-hidden rounded-lg border border-black/10 bg-white/80 md:h-64">
            <Image
              src={images[currentImageIndex]}
              alt={`${project.title} preview ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentImageIndex((previous) =>
                    previous > 0 ? previous - 1 : previous,
                  )
                }
                className="desktop-soft-btn rounded-md px-3 py-1 text-xs uppercase"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentImageIndex((previous) =>
                    previous < images.length - 1 ? previous + 1 : previous,
                  )
                }
                className="desktop-soft-btn rounded-md px-3 py-1 text-xs uppercase"
              >
                Next
              </button>
              <p className="rounded-md border border-black/10 bg-white/60 px-2 py-1 text-xs uppercase">
                {currentImageIndex + 1}/{images.length}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-md border border-black/10 bg-white/60 p-2 text-xs uppercase tracking-wide">
          Preview unavailable
        </p>
      )}

      <p className="text-sm">{project.description}</p>

      <div className="flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-md border border-black/10 bg-white/65 px-2 py-1 text-[10px] uppercase tracking-wide"
          >
            {technology}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="desktop-soft-btn rounded-md px-3 py-1 text-xs uppercase tracking-wide"
          >
            Code
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="desktop-soft-btn rounded-md px-3 py-1 text-xs uppercase tracking-wide"
          >
            Live
          </a>
        )}
      </div>
    </div>
  );
}
