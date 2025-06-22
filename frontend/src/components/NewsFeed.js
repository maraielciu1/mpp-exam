import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './NewsFeed.css';

const NewsFeed = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [userNews, setUserNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParty, setSelectedParty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newsType, setNewsType] = useState('all'); // 'all', 'public', 'personalized'
  const [generatingNews, setGeneratingNews] = useState(false);

  const API_BASE_URL = '/api';

  // Fake news data for each candidate
  const fakeNewsData = {
    1: [
      {
        id: 1,
        title: "John Smith's Secret Meeting with Foreign Leaders",
        content: "Sources claim John Smith held undisclosed meetings with foreign diplomats, raising questions about transparency in his campaign. Critics argue this could compromise national security interests.",
        date: "2024-01-15",
        category: "Politics"
      },
      {
        id: 2,
        title: "Alleged Tax Evasion Scheme Uncovered",
        content: "Investigative journalists reveal documents suggesting John Smith may have used offshore accounts to avoid paying millions in taxes. The candidate denies all allegations.",
        date: "2024-01-12",
        category: "Finance"
      },
      {
        id: 3,
        title: "Controversial Comments Surface from Past",
        content: "Old video footage shows John Smith making controversial statements about immigration policy. The candidate claims his views have evolved since then.",
        date: "2024-01-10",
        category: "Social Issues"
      }
    ],
    2: [
      {
        id: 4,
        title: "Sarah Johnson's Business Dealings Questioned",
        content: "Reports suggest Sarah Johnson's business empire may have benefited from government contracts awarded during her time in office. Ethics watchdogs are calling for investigation.",
        date: "2024-01-14",
        category: "Business"
      },
      {
        id: 5,
        title: "Alleged Campaign Finance Violations",
        content: "Anonymous sources claim Sarah Johnson's campaign received illegal donations from corporate entities. The campaign denies any wrongdoing.",
        date: "2024-01-11",
        category: "Politics"
      },
      {
        id: 6,
        title: "Family Business Scandal Emerges",
        content: "Sarah Johnson's family business is under scrutiny for environmental violations. Critics say this reflects poorly on her environmental policy positions.",
        date: "2024-01-08",
        category: "Environment"
      }
    ],
    3: [
      {
        id: 7,
        title: "Michael Chen's Tech Company Data Breach",
        content: "Security experts claim Michael Chen's tech company suffered a major data breach affecting millions of users. The company denies the allegations.",
        date: "2024-01-13",
        category: "Technology"
      },
      {
        id: 8,
        title: "Questionable Patent Claims Surface",
        content: "Michael Chen faces accusations of claiming credit for technology developed by others. Former employees speak out about intellectual property disputes.",
        date: "2024-01-09",
        category: "Technology"
      },
      {
        id: 9,
        title: "Alleged Discrimination in Hiring Practices",
        content: "Former employees of Michael Chen's company allege discriminatory hiring practices. The company maintains it follows equal opportunity guidelines.",
        date: "2024-01-06",
        category: "Social Issues"
      }
    ],
    4: [
      {
        id: 10,
        title: "Maria Rodriguez's Environmental Record Questioned",
        content: "Despite her green platform, Maria Rodriguez's personal carbon footprint is reportedly among the highest of all candidates. Critics call this hypocrisy.",
        date: "2024-01-15",
        category: "Environment"
      },
      {
        id: 11,
        title: "Alleged Ties to Oil Industry",
        content: "Documents suggest Maria Rodriguez may have received funding from oil companies in the past. She denies any conflict of interest.",
        date: "2024-01-12",
        category: "Environment"
      },
      {
        id: 12,
        title: "Controversial Land Development Deal",
        content: "Maria Rodriguez is accused of supporting a development project that would destroy protected wetlands. Environmental groups are outraged.",
        date: "2024-01-09",
        category: "Environment"
      }
    ],
    5: [
      {
        id: 13,
        title: "David Wilson's Healthcare Plan Under Fire",
        content: "Medical professionals claim David Wilson's healthcare reform plan would actually increase costs for patients. The candidate disputes these claims.",
        date: "2024-01-14",
        category: "Healthcare"
      },
      {
        id: 14,
        title: "Alleged Hospital Mismanagement",
        content: "During his time as hospital administrator, David Wilson allegedly oversaw budget cuts that compromised patient care. Former staff members speak out.",
        date: "2024-01-11",
        category: "Healthcare"
      },
      {
        id: 15,
        title: "Questionable Medical Research Funding",
        content: "David Wilson's medical research foundation is accused of accepting funding from pharmaceutical companies with questionable practices.",
        date: "2024-01-08",
        category: "Healthcare"
      }
    ],
    6: [
      {
        id: 16,
        title: "Lisa Thompson's Tax Plan Controversy",
        content: "Economists claim Lisa Thompson's tax cut proposals would primarily benefit the wealthy and increase the national debt. The campaign disputes these analyses.",
        date: "2024-01-13",
        category: "Finance"
      },
      {
        id: 17,
        title: "Alleged Offshore Investments",
        content: "Lisa Thompson is accused of holding investments in offshore tax havens while advocating for tax reform. She denies any wrongdoing.",
        date: "2024-01-10",
        category: "Finance"
      },
      {
        id: 18,
        title: "Business Bankruptcy History Revealed",
        content: "Lisa Thompson's business history includes several failed ventures and bankruptcies. Critics question her economic management skills.",
        date: "2024-01-07",
        category: "Business"
      }
    ],
    7: [
      {
        id: 19,
        title: "Robert Kim's AI Ethics Concerns",
        content: "AI researchers claim Robert Kim's technology company has developed AI systems that could be used for surveillance. Privacy advocates are concerned.",
        date: "2024-01-15",
        category: "Technology"
      },
      {
        id: 20,
        title: "Alleged Data Mining Practices",
        content: "Robert Kim's company is accused of collecting user data without proper consent. The company maintains it follows all privacy regulations.",
        date: "2024-01-12",
        category: "Technology"
      },
      {
        id: 21,
        title: "Questionable Algorithm Bias",
        content: "Studies suggest Robert Kim's AI algorithms show bias against certain demographic groups. The company disputes these findings.",
        date: "2024-01-09",
        category: "Technology"
      }
    ],
    8: [
      {
        id: 22,
        title: "Emily Davis's Climate Research Controversy",
        content: "Emily Davis's climate research is accused of cherry-picking data to support her political agenda. Other scientists dispute her findings.",
        date: "2024-01-14",
        category: "Environment"
      },
      {
        id: 23,
        title: "Alleged Research Funding Conflicts",
        content: "Emily Davis's research has received funding from environmental activist groups, raising questions about scientific objectivity.",
        date: "2024-01-11",
        category: "Environment"
      },
      {
        id: 24,
        title: "Questionable Carbon Offset Claims",
        content: "Emily Davis's personal carbon offset program is accused of using ineffective methods that don't actually reduce emissions.",
        date: "2024-01-08",
        category: "Environment"
      }
    ],
    9: [
      {
        id: 25,
        title: "James Brown's Education Reform Backlash",
        content: "Teachers' unions claim James Brown's education reform plan would undermine public schools and benefit private institutions.",
        date: "2024-01-13",
        category: "Education"
      },
      {
        id: 26,
        title: "Alleged Charter School Conflicts",
        content: "James Brown is accused of having financial ties to charter school companies that would benefit from his proposed reforms.",
        date: "2024-01-10",
        category: "Education"
      },
      {
        id: 27,
        title: "Questionable Academic Credentials",
        content: "James Brown's academic credentials are being questioned by education experts who claim some of his claims are exaggerated.",
        date: "2024-01-07",
        category: "Education"
      }
    ],
    10: [
      {
        id: 28,
        title: "Amanda White's Law Enforcement Record",
        content: "Amanda White's law enforcement career is under scrutiny for alleged use of excessive force and racial profiling incidents.",
        date: "2024-01-15",
        category: "Law Enforcement"
      },
      {
        id: 29,
        title: "Alleged Cover-up of Police Misconduct",
        content: "During her time as police chief, Amanda White allegedly covered up several cases of police misconduct. She denies these allegations.",
        date: "2024-01-12",
        category: "Law Enforcement"
      },
      {
        id: 30,
        title: "Questionable Training Program",
        content: "Amanda White's police training program is accused of promoting aggressive tactics that could lead to civil rights violations.",
        date: "2024-01-09",
        category: "Law Enforcement"
      }
    ]
  };

  const fetchUserNews = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user-news/${user.cnp}`);
      
      if (response.ok) {
        const userNewsData = await response.json();
        console.log('Fetched user news:', userNewsData); // Debug log
        setUserNews(userNewsData);
      } else {
        console.error('Failed to load user news');
      }
    } catch (err) {
      console.error('Error fetching user news:', err);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchCandidates();
    if (user) {
      fetchUserNews();
    }

    const newSocket = io('http://localhost:5001');

    newSocket.on('news-updated', () => {
      console.log('News update received, refreshing...');
      fetchUserNews();
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, fetchUserNews]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/candidates`);
      
      if (response.ok) {
        const candidatesData = await response.json();
        setCandidates(candidatesData);
      } else {
        setError('Failed to load candidates');
      }
    } catch (err) {
      setError('Error loading candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserNews = async (newsId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-news/${newsId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchUserNews(); // Refresh user news
      } else {
        console.error('Failed to delete news article');
      }
    } catch (err) {
      console.error('Error deleting news article:', err);
    }
  };

  // Get all news articles
  const getAllNews = () => {
    const allNews = [];
    
    // Add public news
    candidates.forEach(candidate => {
      const candidateNews = fakeNewsData[candidate.id] || [];
      candidateNews.forEach(news => {
        allNews.push({
          ...news,
          candidateName: candidate.name,
          candidateParty: candidate.party,
          candidateId: candidate.id,
          candidateImage: candidate.image,
          type: 'public'
        });
      });
    });
    
    // Add personalized news
    console.log('Processing personalized news:', userNews); // Debug log
    userNews.forEach(news => {
      const personalizedArticle = {
        id: `personal-${news.id}`,
        title: news.newstext,
        content: news.newstext,
        date: news.created_at,
        category: news.bias === 1 ? 'Positive' : 'Negative',
        candidateName: news.candidatename,
        candidateParty: news.candidateparty,
        candidateId: news.candidateid,
        candidateImage: news.candidateimage,
        type: 'personalized',
        bias: news.bias,
        personalId: news.id
      };
      console.log('Adding personalized article:', personalizedArticle); // Debug log
      allNews.push(personalizedArticle);
    });
    
    const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('Total news articles:', sortedNews.length); // Debug log
    return sortedNews;
  };

  // Filter news based on search, party, and type
  const getFilteredNews = () => {
    let news = getAllNews();
    
    if (searchTerm) {
      news = news.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedParty !== 'all') {
      news = news.filter(article => article.candidateParty === selectedParty);
    }
    
    if (newsType !== 'all') {
      news = news.filter(article => article.type === newsType);
    }
    
    return news;
  };

  const filteredNews = getFilteredNews();
  const parties = ['all', ...new Set(candidates.map(c => c.party))];

  const getCategoryColor = (category) => {
    const colors = {
      'Politics': '#dc2626',
      'Finance': '#059669',
      'Technology': '#7c3aed',
      'Environment': '#0891b2',
      'Healthcare': '#ea580c',
      'Business': '#1e40af',
      'Social Issues': '#be185d',
      'Education': '#65a30d',
      'Law Enforcement': '#475569',
      'Positive': '#059669',
      'Negative': '#dc2626'
    };
    return colors[category] || '#6b7280';
  };

  const generateNewsNow = async () => {
    try {
      setGeneratingNews(true);
      const response = await fetch(`${API_BASE_URL}/generate-news-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Wait a moment for the news to be generated, then refresh
        setTimeout(() => {
          fetchUserNews();
        }, 1000);
        alert('News generation completed! Check for new personalized articles.');
      } else {
        alert('Failed to generate news. Please try again.');
      }
    } catch (error) {
      console.error('Error generating news:', error);
      alert('Error generating news. Please try again.');
    } finally {
      setGeneratingNews(false);
    }
  };

  return (
    <div className="news-feed">
      <div className="page-header">
        <h1>📰 Election News Feed</h1>
        <p>Stay informed with the latest news and controversies surrounding the candidates</p>
        {user && (
          <div className="personalized-notice">
            <span>🎯 Personalized news will appear here based on your activity</span>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search news, candidates, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="party-filter"
          >
            {parties.map(party => (
              <option key={party} value={party}>
                {party === 'all' ? 'All Parties' : party}
              </option>
            ))}
          </select>
          
          <select
            value={newsType}
            onChange={(e) => setNewsType(e.target.value)}
            className="news-type-filter"
          >
            <option value="all">All News</option>
            <option value="public">Public News</option>
            <option value="personalized">Personalized News</option>
          </select>
          
          {user && (
            <button 
              onClick={generateNewsNow}
              disabled={generatingNews}
              className="generate-news-btn"
            >
              {generatingNews ? 'Generating...' : '🎯 Generate News'}
            </button>
          )}
        </div>
      </div>

      {/* News Feed */}
      <div className="news-container">
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : error ? (
          <div className="error">Error loading news: {error}</div>
        ) : filteredNews.length === 0 ? (
          <div className="no-results">
            <h3>No news found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="news-grid">
            {filteredNews.map(article => (
              <div key={article.id} className={`news-card ${article.type === 'personalized' ? 'personalized' : ''}`}>
                <div className="news-header">
                  <div className="candidate-info">
                    <img 
                      src={article.candidateImage} 
                      alt={article.candidateName}
                      className="candidate-avatar"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50x50?text=Candidate';
                      }}
                    />
                    <div className="candidate-details">
                      <h4 className="candidate-name">{article.candidateName}</h4>
                      <span className="candidate-party">{article.candidateParty}</span>
                    </div>
                  </div>
                  <div className="news-meta">
                    <span 
                      className="news-category"
                      style={{ backgroundColor: getCategoryColor(article.category) }}
                    >
                      {article.category}
                    </span>
                    <span className="news-date">{new Date(article.date).toLocaleDateString()}</span>
                    {article.type === 'personalized' && (
                      <span className="personalized-badge">🎯 Personalized</span>
                    )}
                  </div>
                </div>
                
                <div className="news-content">
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-excerpt">{article.content}</p>
                </div>
                
                <div className="news-footer">
                  <Link to={`/vote/${article.candidateId}`} className="view-candidate-btn">
                    View Candidate
                  </Link>
                  <div className="news-actions">
                    {article.type === 'personalized' && (
                      <button 
                        onClick={() => deleteUserNews(article.personalId)}
                        className="delete-news-btn"
                        title="Delete this personalized news"
                      >
                        🗑️
                      </button>
                    )}
                    <span className="news-id">#{article.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feed Stats */}
      <div className="feed-stats">
        <div className="stats-card">
          <h3>📊 Feed Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{filteredNews.length}</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{new Set(filteredNews.map(n => n.candidateId)).size}</span>
              <span className="stat-label">Candidates</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{new Set(filteredNews.map(n => n.category)).size}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userNews.length}</span>
              <span className="stat-label">Personalized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsFeed; 