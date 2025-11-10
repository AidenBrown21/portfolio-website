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
    title: 'Notify (Expected December 2025)',
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
        <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            My Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here are some of my recent projects. Each one represents a problem I've experienced and my take on how to tackle it.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
            >
              {/* Project Image Preview */}
              {project.projectImages && project.projectImages.length > 0 ? (
                <div className="relative h-48 bg-gray-800">
                  <Image
                    src={project.projectImages[0]}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className={`h-48 ${project.image} flex items-center justify-center text-white text-xl font-bold px-4 text-center`}>
                  Coming Soon
                </div>
              )}

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Code</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-sm">Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
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
