'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  projectImages?: string[];
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project]);

  // Close modal on escape key and handle arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && project?.projectImages && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight' && project?.projectImages && currentImageIndex < project.projectImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    };

    if (project) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [project, onClose, currentImageIndex]);

  if (!project) return null;

  const hasImages = project.projectImages && project.projectImages.length > 0;
  const hasMultipleImages = project.projectImages && project.projectImages.length > 1;

  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (project.projectImages && currentImageIndex < project.projectImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full border-2 border-black bg-[#f9f4ec]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-h-[90vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:opacity-70 z-10 font-bold"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Project Images Carousel */}
          {hasImages && (
            <div className="relative w-full h-64 md:h-96 border-b-2 border-black bg-white group">
              <Image
                src={project.projectImages![currentImageIndex]}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
              />

              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black text-[#f6f1e7] px-3 py-2 text-sm font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous image"
                    >
                      Prev
                    </button>
                  )}

                  {currentImageIndex < project.projectImages!.length - 1 && (
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-[#f6f1e7] px-3 py-2 text-sm font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Next image"
                    >
                      Next
                    </button>
                  )}

                  <div className="absolute bottom-4 right-4 border-2 border-black bg-[#f6f1e7] text-black px-2 py-1 text-xs font-bold">
                    {currentImageIndex + 1} / {project.projectImages!.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Project Content */}
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4">
              {project.title}
            </h2>

            <p className="text-base font-medium mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="mb-6">
              <h3 className="text-sm uppercase font-bold tracking-wide mb-3">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 border border-black text-xs font-bold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {(project.githubUrl || project.liveUrl) && (
              <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-black text-sm font-bold uppercase">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    View Code
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
