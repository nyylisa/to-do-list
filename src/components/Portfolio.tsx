import { Code, Palette, Rocket, Github, Linkedin, Mail } from 'lucide-react';

export function Portfolio() {
  const skills = [
    { icon: Palette, name: 'Frontend Development', description: 'React, TypeScript, Tailwind CSS' },
    { icon: Code, name: 'Backend Development', description: 'Node.js, Express, MongoDB' },
    { icon: Rocket, name: 'Machine Learning', description: 'Building efficient solutions' },
  ];

  const projects = [
    {
      title: 'A personalised book recommendation system',
      description: 'Book recommendation system that suggests books based on user preferences and reading history.',
      tech: ['Python', 'pandas', 'scikit-learn'],
    },
    {
      title: 'Sudoku Puzzle Solver',
      description: 'Sudoku puzzle solver that uses algorithms to find solutions efficiently.',
      tech: ['Python', 'Backtracking', 'Algorithm Design'],
    },
    
  ];

  return (
    <div className="space-y-8">
      {/* About Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #1976D2' }}>
        <h2 className="text-3xl mb-4" style={{ color: '#0D47A1' }}>
          Ny Lisa
        </h2>
        <p className="text-lg mb-4" style={{ color: '#0D47A1' }}>
          I am a software engineering student with a strong interest in full-stack web development. I enjoy working across both frontend and backend to build complete, reliable applications.
        </p>
        <p className="text-lg" style={{ color: '#0D47A1' }}>
          Alongside web development, I am exploring data science and machine learning concepts, with a focus on understanding data analysis, basic modeling, and how intelligent systems can be integrated into real-world applications. I am continuously learning and improving my technical skills through academic and personal projects.
        </p>
      </section>

      {/* Skills Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #1976D2' }}>
        <h2 className="text-3xl mb-6" style={{ color: '#0D47A1' }}>
          Skills
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="p-6 rounded-xl text-center hover:shadow-lg transition-shadow"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#1976D2' }}>
                <skill.icon size={32} color="white" />
              </div>
              <h3 className="text-xl mb-2" style={{ color: '#0D47A1' }}>
                {skill.name}
              </h3>
              <p style={{ color: '#0D47A1', opacity: 0.8 }}>
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #1976D2' }}>
        <h2 className="text-3xl mb-6" style={{ color: '#0D47A1' }}>
          Projects
        </h2>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border-2 hover:shadow-lg transition-shadow"
              style={{ borderColor: '#E3F2FD' }}
            >
              <h3 className="text-2xl mb-2" style={{ color: '#0D47A1' }}>
                {project.title}
              </h3>
              <p className="mb-4" style={{ color: '#0D47A1', opacity: 0.8 }}>
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: '#1976D2' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #1976D2' }}>
        <h2 className="text-3xl mb-6" style={{ color: '#0D47A1' }}>
          Get In Touch
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://github.com/nyylisa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Github size={20} />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/lisa-ny-58340a25b/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Linkedin size={20} />
            LinkedIn
          </a>
          <a
            href="mailto:ny.lisa24@kit.edu.kh"
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Mail size={20} />
            Email: ny.lisa24@kit.edu.kh
          </a>
        </div>
      </section>
    </div>
  );
}
