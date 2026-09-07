import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImageSrc } from '../config/api';

const TeamSection = ({ featured = false }) => {
  const [members, setMembers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await API.get('/admin/users');
        setMembers((response.data || []).filter((member) => member.status === 'approved' && ['mentor', 'volunteer', 'admin'].includes(member.role)));
      } catch (error) {
        console.error('Failed to fetch team members', error);
      }
    };
    fetchTeam();
  }, []);

  const visibleMembers = featured || !showAll ? members.slice(0, 6) : members;
  const initials = (name = '') => name.split(' ').filter(Boolean).map((part) => part[0]).join('').toUpperCase().slice(0, 2) || 'AU';
  const avatarUrl = (member) => getImageSrc(member.avatar || member.imageUrl || '');

  return <section className={featured ? 'team-section team-section-featured' : 'team-section'}>
    <div className="team-section-heading"><div><span className="section-kicker">THE PEOPLE BEHIND THE WORK</span><h2>Our Dedicated Team & Mentors</h2><p>हमारे मार्गदर्शक और स्वयंसेवक जो समाज में बदलाव लाने के लिए निरंतर प्रयासरत हैं।</p></div></div>
    <div className="team-grid">{visibleMembers.map((member) => <article className="team-card" key={member._id}>
      {avatarUrl(member) ? <img className="team-avatar" src={avatarUrl(member)} alt={member.name} /> : <div className="team-avatar team-avatar-fallback">{initials(member.name)}</div>}
      <h3>{member.name}</h3><span className="team-role">{member.role === 'admin' ? 'Lead Administrator' : member.role === 'mentor' ? 'Mentor' : 'Volunteer'}</span>
      <div className="team-contact"><a href={`mailto:${member.email}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 6l9 7 9-7" /></svg>{member.email}</a>{(member.phone || member.callingPhone || member.whatsappPhone) && <a href={`tel:${member.phone || member.callingPhone || member.whatsappPhone}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3l3 2-2 4c1 2 3 4 5 5l4-2 2 3-2 3c-7 0-13-6-13-13z" /></svg>{member.phone || member.callingPhone || member.whatsappPhone}</a>}</div>
    </article>)}</div>
    {!featured && members.length > 6 && <button className="team-explore-button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show Less' : 'Explore More / और देखें'}</button>}
    {featured && (
      <button className="team-explore-button" onClick={() => navigate('/team')}>
        <span>View All Team Members</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#e8b35a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    )}
  </section>;
};

export default TeamSection;
