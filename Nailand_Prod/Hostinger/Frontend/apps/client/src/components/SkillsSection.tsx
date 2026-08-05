import { FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Skill {
  name: string;
  type: string;
}

const SkillsSection = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  // Initial skills data
  const initialSkills: Skill[] = [
    { name: 'Technical', type: 'light' },
    { name: 'Data Analyst', type: 'dark' },
    { name: 'Editor', type: 'light' },
    { name: 'Web Designer', type: 'dark' },
    { name: 'Programmer', type: 'dark' },
    { name: 'Data Analyst', type: 'dark' },
    { name: 'Technical', type: 'light' },
    { name: 'UX Designer', type: 'dark' },
    { name: 'Technical', type: 'light' },
    { name: 'Copy Writer', type: 'dark' },
    { name: 'UI Designer', type: 'light' },
    { name: 'Frontend Dev', type: 'dark' },
    { name: 'Backend Dev', type: 'dark' },
    { name: 'Mobile Dev', type: 'light' },
    { name: 'DevOps', type: 'dark' },
    { name: 'Cloud Engineer', type: 'light' },
    { name: 'AI/ML Engineer', type: 'dark' },
    { name: 'Data Scientist', type: 'dark' },
    { name: 'Product Manager', type: 'light' },
    { name: 'Project Manager', type: 'dark' },
    { name: 'Scrum Master', type: 'light' },
    { name: 'QA Engineer', type: 'dark' },
    { name: 'Cybersecurity', type: 'dark' },
    { name: 'Blockchain Dev', type: 'light' },
    { name: 'Game Dev', type: 'dark' },
    { name: 'AR/VR Dev', type: 'light' },
    { name: 'Full Stack', type: 'dark' },
    { name: 'System Admin', type: 'light' },
    { name: 'Network Engineer', type: 'dark' },
    { name: 'Database Admin', type: 'dark' },
    { name: 'UI/UX Designer', type: 'light' },
    { name: 'Graphics Designer', type: 'dark' },
    { name: 'Motion Designer', type: 'light' },
    { name: '3D Artist', type: 'dark' },
    { name: 'Video Editor', type: 'light' },
    { name: 'Content Writer', type: 'dark' },
    { name: 'Social Media Manager', type: 'light' },
    { name: 'Digital Marketer', type: 'dark' },
    { name: 'SEO Specialist', type: 'light' },
    { name: 'Business Analyst', type: 'dark' },
  ];

  // Initialize all skills and filtered skills
  useEffect(() => {
    setAllSkills(initialSkills);
    setFilteredSkills(initialSkills);
  }, []);

  // Filter skills based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSkills(allSkills);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allSkills.filter((skill: Skill) => 
      skill.name.toLowerCase().includes(query)
    );
    setFilteredSkills(filtered);
  }, [searchQuery, allSkills]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // You can add additional logic here if needed
    console.log('Searching for:', searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <section className="skills-section">
      <div className="skills-container">
        <h2 className="skills-title">
          Growing, Exchanging of Thousands <span className="skills-badge">Skills</span>
        </h2>

        <form onSubmit={handleSearchSubmit} className="search-wrapper">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Enter Skills (e.g., Designer, Developer, Analyst...)" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="submit" className="search-btn">
            <FiSearch size={20} />
          </button>
          {searchQuery && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </form>

        <div className="skills-scroll-box">
          <div className="skills-scroll-content">
            {filteredSkills.length > 0 ? (
              <div className="skills-grid">
                {filteredSkills.map((skill: Skill, index: number) => (
                  <div 
                    key={`${skill.name}-${index}`} 
                    className={`skill-tag ${skill.type}`}
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No skills found for "<strong>{searchQuery}</strong>"</p>
                <p className="suggestion">Try searching for: Designer, Developer, Analyst, Manager, Engineer</p>
                <button 
                  onClick={handleClearSearch}
                  className="clear-all-btn"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
          
          {/* Results count */}
          <div className="results-info">
            <p>
              Showing {filteredSkills.length} of {allSkills.length} skills
              {searchQuery && (
                <span className="search-term">
                  {' '}for "<strong>{searchQuery}</strong>"
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;