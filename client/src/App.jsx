import React, { useState, useEffect } from 'react';
import { Vote, Users, Megaphone, Landmark, CheckCircle, ArrowRight, LogOut, User as UserIcon } from 'lucide-react';
import Timeline from './components/Timeline';
import Assistant from './components/Assistant';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './index.css';

const INDIAN_ELECTION_STEPS = [
  {
    id: 1,
    date: 'Phase 1: Preparation',
    title: 'Electoral Roll & Registration',
    desc: 'The Election Commission of India (ECI) updates the electoral rolls. Eligible citizens (18+ years) register to vote to get their Voter ID (EPIC).',
    icon: <Users size={24} />
  },
  {
    id: 2,
    date: 'Phase 2: Announcement',
    title: 'Election Schedule & MCC',
    desc: 'ECI announces the election schedule. The Model Code of Conduct (MCC) comes into effect immediately to ensure a level playing field.',
    icon: <Landmark size={24} />
  },
  {
    id: 3,
    date: 'Phase 3: Nomination',
    title: 'Candidate Nominations',
    desc: 'Candidates file their nomination papers, which are scrutinized by returning officers. Candidates can also withdraw their names.',
    icon: <Vote size={24} />
  },
  {
    id: 4,
    date: 'Phase 4: Campaigning',
    title: 'Election Campaign',
    desc: 'Political parties and candidates campaign through rallies, manifestos, and media. Campaigning stops 48 hours before polling.',
    icon: <Megaphone size={24} />
  },
  {
    id: 5,
    date: 'Phase 5: Polling & Results',
    title: 'Voting Day & Counting',
    desc: 'Voters cast their votes using Electronic Voting Machines (EVMs) with VVPATs. Votes are later counted and results are declared.',
    icon: <CheckCircle size={24} />
  }
];

function App() {
  const [activeStep, setActiveStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return <div className="loading-screen">Loading CivicGuide...</div>;
  }

  return (
    <>
      <div className="bg-glow" aria-hidden="true"></div>
      <div className="bg-glow-2" aria-hidden="true"></div>
      
      <div className="app-container">
        <header>
          <div className="logo" aria-label="CivicGuide Logo">
            <Landmark size={28} aria-hidden="true" />
            <span>CivicGuide India</span>
          </div>
          <div className="header-actions">
            {user ? (
              <div className="user-profile">
                <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="btn-primary flex items-center gap-2">
                <UserIcon size={16} /> Sign In
              </button>
            )}
          </div>
        </header>

        <main>
          <section className="hero">
            <h1>Understand the <span className="hero-gradient-text">Indian Election</span> Process</h1>
            <p>Your interactive, AI-powered guide to understanding how the world's largest democracy votes. Simple, clear, and easy to follow.</p>
            {!user && (
              <button onClick={handleLogin} className="btn-primary mt-4">
                Sign In to ask AI Questions
              </button>
            )}
          </section>

          <div className="grid-container">
            <Timeline 
              steps={INDIAN_ELECTION_STEPS} 
              activeStep={activeStep} 
              setActiveStep={setActiveStep} 
            />
            {user ? <Assistant user={user} /> : (
              <div className="glass-card assistant-placeholder">
                <h3>AI Assistant Locked</h3>
                <p>Please sign in to interact with our AI Election Guide.</p>
              </div>
            )}
          </div>
        </main>

        <footer>
          <p>&copy; {new Date().getFullYear()} CivicGuide. FAANG-Grade AI Infrastructure.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
