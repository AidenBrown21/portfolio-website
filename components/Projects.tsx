'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProjectModal from './ProjectModal';

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

const projects: Project[] = [
  {
    id: 1,
    title: 'HyperFit (IOS)',
    description: 'A SwiftUI-based iOS application that generates personalized workout plans and tracks fitness progress. Built to solve the common problem of workout routine repetition and lack of exercise variety with dynamic workout generation, intelligent exercise selection, and local workout history tracking.',
    technologies: ['SwiftUI', 'Firebase', 'SwiftData', 'Wger API', 'iOS'],
    githubUrl: 'https://github.com/AidenBrown21/Hyperfit',
    liveUrl: undefined,
    image: 'bg-gradient-to-br from-sky-400 to-blue-600',
    projectImages: [
      '/projects/hyperfit/Hyperfit1.jpeg',
      '/projects/hyperfit/Hyperfit2.jpeg',
      '/projects/hyperfit/Hyperfit3.jpeg',
      '/projects/hyperfit/Hyperfit4.jpeg',
      '/projects/hyperfit/Hyperfit5.jpeg',
      '/projects/hyperfit/Hyperfit6.jpeg',
      '/projects/hyperfit/Hyperfit7.jpeg',
    ],
  },
  {
    id: 2,
    title: 'ATLAS Scam Protection',
    description: 'A comprehensive anti-scam detection tool that analyzes potentially malicious content with multi-format analysis (text, speech, images) to identify threats in real-time. Features a responsive React frontend, REST API backend with Flask, and machine learning models for threat detection.',
    technologies: ['React', 'Python', 'Flask', 'MongoDB', 'Scikit-learn', 'NLTK', 'Tesseract'],
    githubUrl: 'https://www.github.com/inthezone006/atlas',
    liveUrl: 'https://www.atlasprotection.app',
    image: 'bg-gradient-to-br from-blue-500 to-blue-800',
    projectImages: [
      '/projects/atlas/Atlas1.jpeg',
      '/projects/atlas/Atlas2.jpeg',
      '/projects/atlas/Atlas3.jpeg',
      '/projects/atlas/Atlas4.jpeg',
    ],
  },
  {
    id: 3,
    title: 'Notify (Expected Soon)',
    description: 'A user focused student productivity app. Class management, intelligent note-taking, and homework tracking in one platform. Key features include live audio transcription using Apples Speech Recognition framework to automatically convert lecture recordings into bulletpoints, a fully fleshed out canvas for note taking, and auto-assigning times to work on homework based on the users schedule.',
    technologies: ['Swift', 'SwiftData', 'Firebase Auth', 'Firebase Storage', 'Hugger API' ],
    githubUrl: undefined,
    liveUrl: undefined,
    image: 'bg-gradient-to-br from-sky-500 to-blue-700',
  },
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <section id="projects" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="border-2 border-black p-6 sm:p-10 bg-[#f9f4ec]">
            {/* Section Header */}
            <div className="text-left mb-12">
              <p className="text-xs uppercase font-bold tracking-[0.2em]">Work</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black mt-3">
                My Projects
              </h2>
              <p className="text-base sm:text-lg font-medium mt-4">
                Here are some of my recent projects. Each one represents a problem I&apos;ve experienced and my take on how to tackle it.
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="border-2 border-black bg-[#f6f1e7] cursor-pointer hover:bg-[#efe7da] transition-colors"
                >
                  {/* Project Image Preview */}
                  {project.projectImages && project.projectImages.length > 0 ? (
                    <div className="relative h-44 border-b-2 border-black bg-white">
                      <Image
                        src={project.projectImages[0]}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-black text-lg font-bold px-4 text-center border-b-2 border-black">
                      Coming Soon
                    </div>
                  )}

                  {/* Project Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-black">
                        {project.title}
                      </h3>
                      <p className="text-sm font-medium mt-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 border border-black text-xs font-bold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4 text-sm font-bold uppercase">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 hover:no-underline"
                        >
                          Code
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
