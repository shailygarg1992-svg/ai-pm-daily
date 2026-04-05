import { useState, useCallback, useRef, useEffect } from 'react';
import { DAYS, HOT_TOOLS, DAY_TOOLS, DAY_VIDEOS, COMPANIES, SECTIONS, TOPIC_TAGS } from './data';

// ─── TTS Hook ───────────────────────────────────────────────────
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const utterRef = useRef(null);
  const cancelledRef = useRef(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  const pickVoice = useCallback(() => {
    const priority = ['Samantha','Karen','Moira','Tessa','Google US English','Google UK English Female','Microsoft Zira','Microsoft Jenny','Daniel','Alex'];
    for (const name of priority) { const v = voices.find(v => v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang.startsWith('en') && v.localService) || voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }, [voices]);

  const stop = useCallback(() => { cancelledRef.current = true; window.speechSynthesis?.cancel(); setSpeaking(false); setCurrentIdx(-1); }, []);

  const speak = useCallback((text, idx = 0) => {
    if (!window.speechSynthesis) return;
    stop(); cancelledRef.current = false;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let si = 0;
    const speakNext = () => {
      if (cancelledRef.current || si >= sentences.length) { setSpeaking(false); setCurrentIdx(-1); return; }
      const utter = new SpeechSynthesisUtterance(sentences[si].trim());
      utter.rate = 1.0; utter.pitch = 1.0;
      const voice = pickVoice(); if (voice) utter.voice = voice;
      utter.onstart = () => { setSpeaking(true); setCurrentIdx(idx); };
      utter.onend = () => { si++; setTimeout(speakNext, 200); };
      utter.onerror = () => { setSpeaking(false); setCurrentIdx(-1); };
      utterRef.current = utter; window.speechSynthesis.speak(utter);
    };
    speakNext();
  }, [stop, pickVoice]);

  const speakAll = useCallback((items) => {
    if (!window.speechSynthesis) return;
    stop(); cancelledRef.current = false;
    let i = 0;
    const next = () => {
      if (cancelledRef.current || i >= items.length) { setSpeaking(false); setCurrentIdx(-1); return; }
      const fullText = items[i].text + '. . ' + items[i].example;
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let si = 0;
      const speakSentence = () => {
        if (cancelledRef.current || si >= sentences.length) { i++; setTimeout(next, 600); return; }
        const utter = new SpeechSynthesisUtterance(sentences[si].trim());
        utter.rate = 1.0; utter.pitch = 1.0;
        const voice = pickVoice(); if (voice) utter.voice = voice;
        const idx = i;
        utter.onstart = () => { setSpeaking(true); setCurrentIdx(idx); };
        utter.onend = () => { si++; setTimeout(speakSentence, 200); };
        utter.onerror = () => { setSpeaking(false); setCurrentIdx(-1); };
        utterRef.current = utter; window.speechSynthesis.speak(utter);
      };
      speakSentence();
    };
    next();
  }, [stop, pickVoice]);

  return { speaking, currentIdx, speak, speakAll, stop, voices };
}

// ─── Tokens ─────────────────────────────────────────────────────
const T = {
  bg: '#FAF9F7', card: '#FFFFFF', text: '#1A1A1A', sub: '#6B7280',
  warmBg: '#F5F0EA', green: '#16A34A', red: '#DC2626', border: '#E5E7EB',
  accent: '#6366F1',
};

// ─── State helpers ──────────────────────────────────────────────
function loadState(key, fallback) {
  try { const v = localStorage.getItem('aipm_' + key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveState(key, value) {
  try { localStorage.setItem('aipm_' + key, JSON.stringify(value)); } catch {}
}

// ─── Level helpers ──────────────────────────────────────────────
function getContentForLevel(briefingItem, level) {
  if (level >= 7) return { text: briefingItem.advancedText || briefingItem.text, example: briefingItem.advancedExample || briefingItem.example, tier: 'advanced' };
  if (level >= 4) return { text: briefingItem.text, example: briefingItem.advancedExample || briefingItem.example, tier: 'intermediate' };
  return { text: briefingItem.text, example: briefingItem.example, tier: 'beginner' };
}
function getLevelLabel(level) {
  if (level <= 2) return 'AI Curious'; if (level <= 4) return 'AI Aware';
  if (level <= 6) return 'AI Competent'; if (level <= 8) return 'AI Proficient'; return 'AI Expert';
}
function getLevelTierColor(tier) { return tier === 'advanced' ? '#8B5CF6' : tier === 'intermediate' ? '#3B82F6' : '#10B981'; }
function getLevelTierLabel(tier) { return tier === 'advanced' ? 'Expert Mode' : tier === 'intermediate' ? 'Intermediate' : 'Beginner'; }

// ─── XP helpers ─────────────────────────────────────────────────
function calcXP(score) { return score * 10 + (score === 5 ? 25 : 0); }
function getXPLevel(xp) {
  if (xp >= 2000) return { level: 10, title: 'AI Grandmaster', next: null };
  if (xp >= 1500) return { level: 9, title: 'AI Master', next: 2000 };
  if (xp >= 1100) return { level: 8, title: 'AI Expert', next: 1500 };
  if (xp >= 800) return { level: 7, title: 'AI Specialist', next: 1100 };
  if (xp >= 550) return { level: 6, title: 'AI Practitioner', next: 800 };
  if (xp >= 350) return { level: 5, title: 'AI Builder', next: 550 };
  if (xp >= 200) return { level: 4, title: 'AI Learner', next: 350 };
  if (xp >= 100) return { level: 3, title: 'AI Explorer', next: 200 };
  if (xp >= 30) return { level: 2, title: 'AI Starter', next: 100 };
  return { level: 1, title: 'AI Newcomer', next: 30 };
}

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(() => loadState('onboarded', false) ? 'home' : 'onboarding');
  const [level, setLevel] = useState(() => loadState('level', 5));
  const [selectedDay, setSelectedDay] = useState(0);
  const [scores, setScores] = useState(() => loadState('scores', {}));
  const [round, setRound] = useState(() => loadState('round', 1));
  const [xp, setXP] = useState(() => loadState('xp', 0));
  const [quizHistory, setQuizHistory] = useState(() => loadState('quizHistory', []));
  const [generatedChapters, setGeneratedChapters] = useState(() => loadState('generatedChapters', []));
  const [genScores, setGenScores] = useState(() => loadState('genScores', {}));
  const [interviewProgress, setInterviewProgress] = useState(() => loadState('interviewProgress', {}));
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeSection, setActiveSection] = useState('fundamentals');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist
  useEffect(() => { saveState('scores', scores); }, [scores]);
  useEffect(() => { saveState('level', level); }, [level]);
  useEffect(() => { saveState('round', round); }, [round]);
  useEffect(() => { saveState('xp', xp); }, [xp]);
  useEffect(() => { saveState('quizHistory', quizHistory); }, [quizHistory]);
  useEffect(() => { saveState('generatedChapters', generatedChapters); }, [generatedChapters]);
  useEffect(() => { saveState('genScores', genScores); }, [genScores]);
  useEffect(() => { saveState('interviewProgress', interviewProgress); }, [interviewProgress]);

  const day = view === 'briefing' || view === 'quiz' || view === 'results' ? (
    selectedDay >= 100
      ? generatedChapters[selectedDay - 100]
      : DAYS[selectedDay]
  ) : DAYS[0];

  const completedDays = Object.keys(scores).length;
  const avgScore = completedDays > 0 ? (Object.values(scores).reduce((a, b) => a + b, 0) / completedDays).toFixed(1) : '-';
  const allComplete = completedDays >= 7;
  const xpInfo = getXPLevel(xp);

  // Get weak topics from quiz history
  const getWeakTopics = () => {
    const wrongByTopic = {};
    quizHistory.forEach(h => {
      if (!h.correct && h.topics) {
        h.topics.forEach(t => { wrongByTopic[t] = (wrongByTopic[t] || 0) + 1; });
      }
    });
    return Object.entries(wrongByTopic).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  };

  const openDay = (idx) => { setSelectedDay(idx); setView('briefing'); window.scrollTo(0, 0); };
  const startQuiz = () => {
    setQuizAnswers([]); setCurrentQ(0);
    setAnswered(false); setSelectedOption(null);
    setView('quiz'); window.scrollTo(0, 0);
  };
  const answerQuestion = (optIdx) => {
    if (answered) return;
    setSelectedOption(optIdx); setAnswered(true);
    setQuizAnswers(prev => [...prev, optIdx]);
    // Track quiz history for adaptive learning
    const isCorrect = optIdx === day.quiz[currentQ].answer;
    const dayIdx = selectedDay < 100 ? selectedDay : null;
    const topics = dayIdx !== null ? (TOPIC_TAGS[dayIdx] || []) : (day.basedOn || []);
    setQuizHistory(prev => [...prev.slice(-99), { dayIdx: selectedDay, qIdx: currentQ, correct: isCorrect, topics, date: new Date().toISOString() }]);
  };
  const nextQuestion = () => {
    if (currentQ < 4) {
      setCurrentQ(c => c + 1); setAnswered(false); setSelectedOption(null);
    } else {
      const finalScore = quizAnswers.reduce((acc, ans, i) => acc + (ans === day.quiz[i].answer ? 1 : 0), 0);
      const earnedXP = calcXP(finalScore);
      setXP(prev => prev + earnedXP);
      if (selectedDay >= 100) {
        setGenScores(prev => ({ ...prev, [selectedDay - 100]: finalScore }));
      } else {
        setScores(prev => ({ ...prev, [selectedDay]: finalScore }));
      }
      setView('results'); window.scrollTo(0, 0);
    }
  };
  const goHome = () => { setView('home'); window.scrollTo(0, 0); };

  const startNewRound = () => {
    const newLevel = Math.min(10, level + 2);
    setLevel(newLevel); setScores({}); setRound(r => r + 1); setView('home'); window.scrollTo(0, 0);
  };

  const navigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    if (section === 'fundamentals' || section === 'advanced' || section === 'interview' || section === 'pulse') {
      setView('home');
    }
    window.scrollTo(0, 0);
  };

  return (
    <div style={{
      minHeight: '100dvh', background: T.bg,
      fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
      color: T.text, WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes xpPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${T.bg}; }
        button:active { opacity: 0.85; }
      `}</style>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.3)', zIndex: 998,
      }} />}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        activeSection={activeSection}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
        scores={scores}
        genScores={genScores}
        generatedChapters={generatedChapters}
        interviewProgress={interviewProgress}
        xp={xp}
        xpInfo={xpInfo}
        level={level}
      />

      {/* Top Bar */}
      {view !== 'onboarding' && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 100, background: T.bg,
          borderBottom: `1px solid ${T.border}`, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            fontSize: 22, lineHeight: 1, color: T.text,
          }}>{'\u2630'}</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Newsreader', 'Georgia', serif" }}>AI PM Daily</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              background: '#FEF3C7', padding: '4px 10px', borderRadius: 12,
              fontSize: 12, fontWeight: 700, color: '#92400E',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{'\u2B50'} {xp} XP</div>
            <div style={{
              background: T.warmBg, padding: '4px 10px', borderRadius: 12,
              fontSize: 12, fontWeight: 700, color: T.accent,
              fontFamily: "'JetBrains Mono', monospace",
            }}>Lv.{level}</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', paddingBottom: 120 }}>
        {view === 'onboarding' && <OnboardingView level={level} setLevel={setLevel} onStart={() => { saveState('onboarded', true); setView('home'); }} />}
        {view === 'home' && activeSection === 'fundamentals' && (
          <FundamentalsSection scores={scores} completedDays={completedDays} avgScore={avgScore}
            openDay={openDay} level={level} setLevel={setLevel}
            allComplete={allComplete} startNewRound={startNewRound} round={round} xp={xp} xpInfo={xpInfo} />
        )}
        {view === 'home' && activeSection === 'advanced' && (
          <AdvancedSection generatedChapters={generatedChapters} setGeneratedChapters={setGeneratedChapters}
            genScores={genScores} openDay={openDay} level={level}
            weakTopics={getWeakTopics()} allFundamentalsComplete={allComplete} completedTopics={Object.keys(scores).map(i => DAYS[i]?.theme).filter(Boolean)} />
        )}
        {view === 'home' && activeSection === 'interview' && (
          <InterviewPrepSection level={level} progress={interviewProgress} setProgress={setInterviewProgress} xp={xp} setXP={setXP} />
        )}
        {view === 'home' && activeSection === 'pulse' && <DailyPulseSection />}
        {view === 'briefing' && <BriefingView day={day} dayIdx={selectedDay} goHome={goHome} startQuiz={startQuiz} level={level} />}
        {view === 'quiz' && <QuizView day={day} currentQ={currentQ} answered={answered}
          selectedOption={selectedOption} answerQuestion={answerQuestion} nextQuestion={nextQuestion} goHome={goHome} />}
        {view === 'results' && <ResultsView day={day} dayIdx={selectedDay}
          quizAnswers={quizAnswers} scores={selectedDay >= 100 ? genScores : scores}
          scoreKey={selectedDay >= 100 ? selectedDay - 100 : selectedDay}
          goHome={goHome} openDay={openDay} xpEarned={calcXP(selectedDay >= 100 ? (genScores[selectedDay - 100] || 0) : (scores[selectedDay] || 0))} />}
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────
function Sidebar({ open, activeSection, onNavigate, onClose, scores, genScores, generatedChapters, interviewProgress, xp, xpInfo, level }) {
  const completedFundamentals = Object.keys(scores).length;
  const completedAdvanced = Object.keys(genScores).length;
  const completedInterviews = Object.keys(interviewProgress).filter(k => interviewProgress[k]?.viewed).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
      background: '#fff', zIndex: 999, boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      transform: open ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.25s ease',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Profile Header */}
      <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 700 }}>AI PM Daily</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: T.sub }}>{'\u2715'}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: `${T.accent}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: T.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{xpInfo.level}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{xpInfo.title}</div>
            <div style={{ fontSize: 12, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{xp} XP &middot; Lv.{level}</div>
          </div>
        </div>
        {/* XP Progress Bar */}
        {xpInfo.next && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.sub, marginBottom: 3 }}>
              <span>{xpInfo.title}</span>
              <span>{xp}/{xpInfo.next} XP</span>
            </div>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2 }}>
              <div style={{ height: 4, background: T.accent, borderRadius: 2, width: `${Math.min(100, (xp / xpInfo.next) * 100)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: '12px 12px', flex: 1 }}>
        {SECTIONS.map(sec => {
          const isActive = activeSection === sec.id;
          let progress = 0, total = 1;
          if (sec.id === 'fundamentals') { progress = completedFundamentals; total = 7; }
          else if (sec.id === 'advanced') { progress = completedAdvanced; total = Math.max(1, generatedChapters.length); }
          else if (sec.id === 'interview') { progress = completedInterviews; total = COMPANIES.length; }

          return (
            <button key={sec.id} onClick={() => onNavigate(sec.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 12px', background: isActive ? `${sec.color}10` : 'transparent',
              border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              marginBottom: 4, transition: 'all 0.15s', color: T.text,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isActive ? `${sec.color}20` : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>{sec.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? sec.color : T.text }}>{sec.name}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{sec.desc}</div>
                {sec.id !== 'pulse' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 3, background: '#E5E7EB', borderRadius: 2 }}>
                      <div style={{ height: 3, background: sec.color, borderRadius: 2, width: `${(progress / total) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{progress}/{total}</span>
                  </div>
                )}
              </div>
              {isActive && <div style={{ width: 4, height: 24, background: sec.color, borderRadius: 2 }} />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.sub }}>
        Knowledge Level: {getLevelLabel(level)} ({level}/10)
      </div>
    </div>
  );
}

// ─── Onboarding View ────────────────────────────────────────────
function OnboardingView({ level, setLevel, onStart }) {
  return (
    <div style={{ animation: 'fadeUp 0.45s ease', padding: '40px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83E\uDDE0'}</div>
        <h1 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px' }}>AI PM Daily</h1>
        <p style={{ color: T.sub, fontSize: 16, margin: 0, lineHeight: 1.5 }}>Your Duolingo for AI Product Management</p>
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 20px', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>What's your AI knowledge level?</h2>
        <p style={{ color: T.sub, fontSize: 13, margin: '0 0 20px', lineHeight: 1.4 }}>This adjusts the depth of content and examples.</p>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>1 — New to AI</span>
            <span style={{ fontSize: 11, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>10 — AI/ML Dev</span>
          </div>
          <input type="range" min="1" max="10" value={level} onChange={e => setLevel(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366F1', height: 8 }} />
        </div>
        <div style={{ background: T.warmBg, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: '#6366F1' }}>{level}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{getLevelLabel(level)}</div>
        </div>
      </div>
      {/* What you'll learn */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px', marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 17, fontWeight: 700, margin: '0 0 14px' }}>Your learning path</h3>
        {SECTIONS.map((sec, i) => (
          <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 22 }}>{sec.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{sec.name}</div>
              <div style={{ fontSize: 12, color: T.sub }}>{sec.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{
        width: '100%', padding: '16px', background: '#6366F1', color: '#fff', border: 'none',
        borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>Start Learning &rarr;</button>
    </div>
  );
}

// ─── Fundamentals Section ───────────────────────────────────────
function FundamentalsSection({ scores, completedDays, avgScore, openDay, level, setLevel, allComplete, startNewRound, round, xp, xpInfo }) {
  const [showLevel, setShowLevel] = useState(false);

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '16px 0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{'\uD83D\uDCDA'}</span>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>AI Fundamentals</h2>
        </div>
        <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0' }}>7 core chapters to build your AI foundation</p>
      </div>

      {/* Progress Strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Progress', value: `${completedDays}/7`, icon: '\u2705' },
          { label: 'Avg Score', value: avgScore, icon: '\uD83D\uDCC8' },
          { label: 'XP Rank', value: xpInfo.title.split(' ')[1], icon: '\u2B50' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: T.card, borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Level adjuster */}
      <button onClick={() => setShowLevel(!showLevel)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', marginBottom: 12,
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, cursor: 'pointer', color: T.text,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'left' }}>Level: {level} — {getLevelLabel(level)}</span>
        <span style={{ fontSize: 10, color: T.sub }}>{showLevel ? '\u25B2' : '\u25BC'}</span>
      </button>
      {showLevel && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 12, marginTop: -8, animation: 'fadeUp 0.2s ease' }}>
          <input type="range" min="1" max="10" value={level} onChange={e => setLevel(Number(e.target.value))} style={{ width: '100%', accentColor: '#6366F1', height: 6 }} />
        </div>
      )}

      {/* Day Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DAYS.map((d, i) => {
          const completed = scores[i] !== undefined;
          const score = scores[i];
          return (
            <button key={i} onClick={() => openDay(i)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: T.card, border: `1px solid ${completed ? T.green + '40' : T.border}`,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s', animation: `fadeUp 0.4s ease ${i * 40}ms both`, color: T.text,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: completed ? '#F0FDF4' : `${d.color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>{completed ? '\u2705' : d.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 1 }}>
                  Day {d.day} &middot; 5 min {completed ? `\u00B7 ${score}/5` : ''}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.theme}</div>
              </div>
              {completed && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {[0,1,2,3,4].map(s => (
                    <div key={s} style={{ width: 6, height: 6, borderRadius: '50%', background: s < score ? T.green : '#E5E7EB' }} />
                  ))}
                </div>
              )}
              <span style={{ color: T.sub, fontSize: 16 }}>&rsaquo;</span>
            </button>
          );
        })}
      </div>

      {allComplete && (
        <div style={{ marginTop: 16, background: 'linear-gradient(135deg, #6366F115, #8B5CF615)', border: '1px solid #6366F130', borderRadius: 14, padding: '18px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>{'\uD83C\uDF89'}</div>
            <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>Phase 1 Complete! Round {round}</h3>
            <p style={{ fontSize: 12, color: T.sub, margin: 0 }}>Level up or explore Advanced Topics in the sidebar</p>
          </div>
          <button onClick={startNewRound} style={{
            width: '100%', padding: '12px', background: '#6366F1', color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>{level >= 9 ? 'Replay at Expert Level' : `Level Up & Replay (Lv.${Math.min(10, level + 2)})`} &rarr;</button>
        </div>
      )}
    </div>
  );
}

// ─── Advanced Section (Dynamic Chapters) ────────────────────────
function AdvancedSection({ generatedChapters, setGeneratedChapters, genScores, openDay, level, weakTopics, allFundamentalsComplete, completedTopics }) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  const generateNewChapter = async () => {
    setGenerating(true); setGenError(null);
    try {
      const topics = weakTopics.length > 0 ? weakTopics : ['agents', 'llm', 'prompting', 'metrics', 'safety'];
      const res = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakTopics: topics,
          level,
          completedTopics,
          chapterNumber: 8 + generatedChapters.length,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const chapter = await res.json();
      setGeneratedChapters(prev => [...prev, chapter]);
    } catch (e) {
      setGenError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '16px 0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{'\uD83D\uDE80'}</span>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Advanced Topics</h2>
        </div>
        <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0' }}>AI-generated chapters targeting your weak areas + latest news</p>
      </div>

      {!allFundamentalsComplete && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B30', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{'\uD83D\uDD12'}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Complete AI Fundamentals first</div>
              <div style={{ fontSize: 12, color: '#92400E' }}>Finish all 7 chapters to unlock personalized advanced content</div>
            </div>
          </div>
        </div>
      )}

      {/* Weak topics indicator */}
      {allFundamentalsComplete && weakTopics.length > 0 && (
        <div style={{ background: `#8B5CF610`, border: '1px solid #8B5CF625', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
            Areas to strengthen
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {weakTopics.map((t, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: '#8B5CF618', color: '#6D28D9', borderRadius: 6, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Generated Chapter Cards */}
      {generatedChapters.map((ch, i) => {
        const completed = genScores[i] !== undefined;
        const score = genScores[i];
        return (
          <button key={i} onClick={() => openDay(100 + i)} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            background: T.card, border: `1px solid ${completed ? T.green + '40' : T.border}`,
            borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
            marginBottom: 8, color: T.text,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: completed ? '#F0FDF4' : `${ch.color || '#8B5CF6'}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{completed ? '\u2705' : (ch.emoji || '\uD83D\uDE80')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 1 }}>
                Chapter {8 + i} &middot; AI Generated {completed ? `\u00B7 ${score}/5` : ''}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.theme}</div>
              {ch.basedOn && (
                <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                  {ch.basedOn.slice(0, 3).map((t, ti) => (
                    <span key={ti} style={{ fontSize: 9, padding: '1px 5px', background: '#8B5CF610', color: '#7C3AED', borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <span style={{ color: T.sub, fontSize: 16 }}>&rsaquo;</span>
          </button>
        );
      })}

      {/* Generate button */}
      {allFundamentalsComplete && (
        <button onClick={generateNewChapter} disabled={generating} style={{
          width: '100%', padding: '14px', marginTop: 8,
          background: generating ? '#E5E7EB' : '#8B5CF6', color: generating ? T.sub : '#fff',
          border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: generating ? 'default' : 'pointer',
        }}>
          {generating ? 'Generating personalized chapter...' : `Generate New Chapter (${weakTopics.length > 0 ? 'based on weak areas' : 'explore new topics'})`}
        </button>
      )}
      {genError && <p style={{ fontSize: 12, color: T.red, marginTop: 8 }}>Error: {genError}. Requires AI Gateway.</p>}
    </div>
  );
}

// ─── Interview Prep Section ─────────────────────────────────────
function InterviewPrepSection({ level, progress, setProgress, xp, setXP }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showApproach, setShowApproach] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchCompanyPrep = async (company) => {
    setLoading(true); setError(null); setCompanyData(null);
    // Check cache
    const cached = loadState(`interview_${company.id}`, null);
    if (cached && (Date.now() - cached.fetchedAt) < 24 * 60 * 60 * 1000) {
      setCompanyData(cached.data); setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.id, level }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setCompanyData(data);
      saveState(`interview_${company.id}`, { data, fetchedAt: Date.now() });
      // Track progress
      if (!progress[company.id]?.viewed) {
        setProgress(prev => ({ ...prev, [company.id]: { viewed: true, date: new Date().toISOString() } }));
        setXP(prev => prev + 15);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = (company) => {
    setSelectedCompany(company);
    setExpandedQ(null); setShowApproach(false);
    fetchCompanyPrep(company);
  };

  const categoryColors = {
    product_sense: '#6366F1', technical: '#8B5CF6', strategy: '#F59E0B',
    execution: '#10B981', behavioral: '#3B82F6',
  };

  if (chatOpen && selectedCompany) {
    return <AgentChatPanel
      topic={`${selectedCompany.name} AI PM Interview Prep`}
      briefingContext={companyData ? `Company: ${selectedCompany.name}. Overview: ${companyData.overview}. Key products: ${companyData.keyProducts?.join(', ')}` : ''}
      level={level}
      dayColor={selectedCompany.color}
      onClose={() => setChatOpen(false)}
    />;
  }

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '16px 0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{'\uD83C\uDFAF'}</span>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Interview Prep</h2>
        </div>
        <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0' }}>Company-specific AI PM interview preparation</p>
      </div>

      {!selectedCompany ? (
        /* Company Grid */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPANIES.map((c, i) => {
            const viewed = progress[c.id]?.viewed;
            return (
              <button key={c.id} onClick={() => selectCompany(c)} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                background: T.card, border: `1px solid ${viewed ? T.green + '40' : T.border}`,
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                animation: `fadeUp 0.4s ease ${i * 50}ms both`, color: T.text,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `${c.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{c.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.sub }}>{c.tagline}</div>
                </div>
                {viewed && <span style={{ fontSize: 12, color: T.green }}>{'\u2705'}</span>}
                <span style={{ color: T.sub, fontSize: 16 }}>&rsaquo;</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Company Detail View */
        <div>
          <button onClick={() => { setSelectedCompany(null); setCompanyData(null); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            color: selectedCompany.color, padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6,
          }}>&larr; All Companies</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${selectedCompany.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>{selectedCompany.emoji}</div>
            <div>
              <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>{selectedCompany.name}</h3>
              <div style={{ fontSize: 12, color: T.sub }}>{selectedCompany.tagline}</div>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #E5E7EB', borderTopColor: selectedCompany.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13, color: T.sub, marginTop: 12 }}>Generating interview prep with latest {selectedCompany.name} news...</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#FEF2F2', border: `1px solid ${T.red}20`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: T.red, margin: 0 }}>Couldn't load prep content. Requires AI Gateway. <button onClick={() => fetchCompanyPrep(selectedCompany)} style={{ background: 'none', border: 'none', color: T.red, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Retry</button></p>
            </div>
          )}

          {companyData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Overview */}
              <div style={{ background: `${selectedCompany.color}08`, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${selectedCompany.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: selectedCompany.color, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>Company Overview</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{companyData.overview}</p>
                {companyData.keyProducts && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {companyData.keyProducts.map((p, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: `${selectedCompany.color}15`, color: selectedCompany.color, borderRadius: 6, fontWeight: 600 }}>{p}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interview Questions */}
              <div>
                <h4 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 16, fontWeight: 700, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {'\uD83D\uDCDD'} Sample Interview Questions
                </h4>
                {companyData.interviewQuestions?.map((q, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <button onClick={() => setExpandedQ(expandedQ === i ? null : i)} style={{
                      width: '100%', background: T.card, border: `1px solid ${T.border}`,
                      borderRadius: expandedQ === i ? '12px 12px 0 0' : 12, padding: '12px 14px',
                      cursor: 'pointer', textAlign: 'left', color: T.text,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                          background: `${categoryColors[q.category] || T.accent}15`,
                          color: categoryColors[q.category] || T.accent,
                          fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                        }}>{q.category?.replace('_', ' ')}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{q.question}</div>
                    </button>
                    {expandedQ === i && (
                      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px 14px', animation: 'fadeUp 0.2s ease' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>Framework</div>
                        <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', color: '#374151' }}>{q.sampleFramework}</p>
                        <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, background: '#FEF3C7', padding: '6px 10px', borderRadius: 6 }}>
                          {'\uD83D\uDCA1'} {q.tips}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Case Study */}
              {companyData.caseStudy && (
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                    {'\uD83D\uDCBC'} Case Study
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>{companyData.caseStudy.scenario}</p>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Think about:</div>
                    {companyData.caseStudy.promptQuestions?.map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 12 }}>{i + 1}.</span>
                        <span style={{ fontSize: 12, color: '#4B5563' }}>{q}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowApproach(!showApproach)} style={{
                    background: showApproach ? '#FEF3C730' : '#F3F4F6', border: 'none', borderRadius: 8,
                    padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.text,
                  }}>{showApproach ? 'Hide' : 'Reveal'} Sample Approach</button>
                  {showApproach && (
                    <p style={{ fontSize: 12, lineHeight: 1.55, margin: '10px 0 0', color: '#374151', background: T.warmBg, padding: '10px 12px', borderRadius: 8, animation: 'fadeUp 0.2s ease' }}>
                      {companyData.caseStudy.sampleApproach}
                    </p>
                  )}
                </div>
              )}

              {/* Tips */}
              {companyData.tips && (
                <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${T.green}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                    {'\u2705'} Insider Tips for {selectedCompany.name}
                  </div>
                  {companyData.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: T.green, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{'\u2022'}</span>
                      <span style={{ fontSize: 12, lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Practice with Agent */}
              <button onClick={() => setChatOpen(true)} style={{
                width: '100%', padding: '14px', background: selectedCompany.color, color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {'\uD83D\uDCAC'} Practice with AI Interview Coach
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Daily Pulse Section (full view) ────────────────────────────
function DailyPulseSection() {
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizState, setQuizState] = useState({ idx: 0, answered: false, selected: null });
  const tts = useTTS();

  const fetchPulse = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/daily-pulse');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setPulse(data);
      saveState('dailyPulse', data);
      saveState('dailyPulseDate', new Date().toDateString());
    } catch (e) {
      setError(e.message);
      const cached = loadState('dailyPulse', null);
      if (cached) setPulse(cached);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const cachedDate = loadState('dailyPulseDate', '');
    const cached = loadState('dailyPulse', null);
    if (cachedDate === new Date().toDateString() && cached) { setPulse(cached); }
    else { fetchPulse(); }
  }, [fetchPulse]);

  const accentColor = '#EF4444';

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '16px 0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{'\u26A1'}</span>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Daily Pulse</h2>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: `${accentColor}15`, color: accentColor, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>LIVE</span>
        </div>
        <p style={{ color: T.sub, fontSize: 13, margin: '4px 0 0' }}>{pulse?.headline || 'AI-generated news briefing updated daily'}</p>
      </div>

      {loading && !pulse && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #E5E7EB', borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 13, color: T.sub, marginTop: 12 }}>Generating fresh briefing...</p>
        </div>
      )}

      {error && !pulse && (
        <div style={{ background: '#FEF2F2', border: `1px solid ${T.red}20`, borderRadius: 12, padding: '16px' }}>
          <p style={{ fontSize: 13, color: T.red, margin: '0 0 8px' }}>Couldn't load today's pulse. Requires AI Gateway.</p>
          <button onClick={fetchPulse} style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, background: T.red, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {pulse && (
        <div>
          {/* Listen Button */}
          <button onClick={() => {
            if (tts.speaking) { tts.stop(); return; }
            const items = (pulse.briefing || []).map(b => ({ text: b.title + '. ' + b.text, example: 'PM Takeaway: ' + b.pmTakeaway }));
            tts.speakAll(items);
          }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, fontWeight: 600,
            background: tts.speaking ? '#FEF3C7' : `${accentColor}10`, color: tts.speaking ? '#92400E' : accentColor,
            border: `1px solid ${tts.speaking ? '#F59E0B' : accentColor}30`, borderRadius: 10, cursor: 'pointer', width: '100%',
            justifyContent: 'center', marginBottom: 16,
          }}>
            <span style={{ fontSize: 16 }}>{tts.speaking ? '\u23F8' : '\uD83C\uDFA7'}</span>
            {tts.speaking ? 'Pause Listening' : 'Listen to Pulse'}
          </button>

          {/* Briefing Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {pulse.briefing?.map((item, i) => (
              <div key={i} style={{
                background: tts.speaking && tts.currentIdx === i ? `${accentColor}06` : T.card,
                border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: accentColor, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{'\u2022'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                    <p style={{ fontSize: 13, lineHeight: 1.55, margin: '0 0 6px', color: '#374151' }}>{item.text}</p>
                    <div style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>{'\uD83C\uDFAF'} {item.pmTakeaway}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Quiz */}
          {pulse.quiz?.length > 0 && (
            <div style={{ background: T.warmBg, borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\uD83E\uDDE0'} Quick Check</div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{pulse.quiz[quizState.idx]?.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pulse.quiz[quizState.idx]?.options.map((opt, oi) => {
                  const q = pulse.quiz[quizState.idx];
                  const isCorrect = oi === q.answer;
                  const isSelected = quizState.selected === oi;
                  let bg = T.card, bc = T.border;
                  if (quizState.answered) {
                    if (isCorrect) { bg = '#F0FDF4'; bc = T.green; }
                    if (isSelected && !isCorrect) { bg = '#FEF2F2'; bc = T.red; }
                  }
                  return (
                    <button key={oi} disabled={quizState.answered} onClick={() => setQuizState(s => ({ ...s, answered: true, selected: oi }))}
                      style={{ padding: '10px 12px', fontSize: 13, textAlign: 'left', background: bg, border: `1px solid ${bc}`, borderRadius: 8, cursor: quizState.answered ? 'default' : 'pointer', opacity: quizState.answered && !isCorrect && !isSelected ? 0.5 : 1, color: T.text }}>{opt}</button>
                  );
                })}
              </div>
              {quizState.answered && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: T.sub, margin: '0 0 6px' }}>{pulse.quiz[quizState.idx]?.explanation}</p>
                  {quizState.idx < pulse.quiz.length - 1 && (
                    <button onClick={() => setQuizState({ idx: quizState.idx + 1, answered: false, selected: null })} style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, background: accentColor, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Next Question {'\u2192'}</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tool Spotlight */}
          {pulse.toolSpotlight && (
            <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '14px 16px', borderLeft: '3px solid #3B82F6', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\uD83D\uDD27'} Tool: {pulse.toolSpotlight.name}</div>
              <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 8px', color: '#1E40AF' }}>{pulse.toolSpotlight.description}</p>
              <p style={{ fontSize: 12, margin: '0 0 8px', color: '#2563EB', fontWeight: 600 }}>{'\uD83C\uDFAF'} Try it: {pulse.toolSpotlight.tryIt}</p>
              <a href={pulse.toolSpotlight.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>Visit {pulse.toolSpotlight.name} {'\u2192'}</a>
            </div>
          )}

          {/* Quick Takeaways */}
          {pulse.briefing?.length > 0 && (
            <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${accentColor}`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\u26A1'} Quick Takeaways</div>
              {pulse.briefing.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ color: accentColor, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: '#92400E' }}>{item.pmTakeaway}</span>
                </div>
              ))}
            </div>
          )}

          {/* Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.sub }}>{pulse.date ? `Updated: ${pulse.date}` : ''}</span>
            <button onClick={fetchPulse} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: accentColor, fontWeight: 600, opacity: loading ? 0.5 : 1 }}>{loading ? 'Refreshing...' : '\u21BB Refresh'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Agent Chat Panel ───────────────────────────────────────────
function AgentChatPanel({ topic, briefingContext, level, dayColor, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'agent', text: `Hi! I'm your AI tutor for "${topic}". Ask me anything!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const q = input.trim(); if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ask-agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, topic, briefingContext, level }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'agent', text: data.answer || 'Sorry, try rephrasing your question.' }]);
    } catch { setMessages(m => [...m, { role: 'agent', text: 'Connection error. Please try again.' }]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: T.bg, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', background: dayColor, color: '#fff', display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'env(safe-area-inset-top, 14px)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}>&larr;</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>AI Tutor</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{topic}</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.25s ease' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 18, fontSize: 14, lineHeight: 1.55,
              ...(msg.role === 'user' ? { background: dayColor, color: '#fff', borderBottomRightRadius: 4 } : { background: '#F3F4F6', color: T.text, borderBottomLeftRadius: 4 }),
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F3F4F6', padding: '10px 18px', borderRadius: 18, borderBottomLeftRadius: 4, fontSize: 14, color: T.sub }}>
              <span style={{ animation: 'pulse 1.2s ease infinite' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '10px 14px', background: '#fff', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'flex-end', paddingBottom: 'env(safe-area-inset-bottom, 10px)' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Ask a question..."
          style={{ flex: 1, padding: '10px 14px', fontSize: 15, border: `1px solid ${T.border}`, borderRadius: 22, outline: 'none', background: '#F9FAFB', color: T.text }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          width: 38, height: 38, borderRadius: '50%', background: input.trim() ? dayColor : '#D1D5DB',
          border: 'none', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><span style={{ color: '#fff', fontSize: 16, marginTop: -1 }}>{'\u2191'}</span></button>
      </div>
    </div>
  );
}

// ─── Hot Tools Section ──────────────────────────────────────────
function HotToolsSection({ dayNum, dayColor }) {
  const toolIndices = DAY_TOOLS[dayNum] || [];
  const tools = toolIndices.map(i => HOT_TOOLS[i]).filter(Boolean);
  const [expanded, setExpanded] = useState(null);
  if (tools.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 18, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{'\uD83D\uDD25'}</span> Hot Tools to Try
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tools.map((tool, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setExpanded(expanded === i ? null : i)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: T.text,
            }}>
              <div style={{ background: `${dayColor}10`, color: dayColor, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{tool.category}</div>
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{tool.name}</span>
              <span style={{ color: T.sub, fontSize: 12 }}>{expanded === i ? '\u25B2' : '\u25BC'}</span>
            </button>
            {expanded === i && (
              <div style={{ padding: '0 14px 14px', animation: 'fadeUp 0.3s ease' }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 10px', color: '#374151' }}>{tool.description}</p>
                <div style={{ background: T.warmBg, borderRadius: 8, padding: '10px 12px', marginBottom: 10, borderLeft: `3px solid ${dayColor}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>Why it matters for PMs</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#4B5563' }}>{tool.whyItMatters}</p>
                </div>
                <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '10px 12px', marginBottom: 10, borderLeft: '3px solid #3B82F6' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\uD83C\uDFAF'} Quick Assignment</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#1E40AF' }}>{tool.tryIt}</p>
                </div>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: dayColor, fontWeight: 600, textDecoration: 'none' }}>Try {tool.name} &rarr;</a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Briefing View ──────────────────────────────────────────────
function BriefingView({ day, dayIdx, goHome, startQuiz, level }) {
  const { speaking, currentIdx, speak, speakAll, stop } = useTTS();
  const [expandedDetails, setExpandedDetails] = useState({});
  const [chatOpen, setChatOpen] = useState(null);

  const getContent = (b) => getContentForLevel(b, level);
  const toggleBullet = (i) => { const c = getContent(day.briefing[i]); if (speaking && currentIdx === i) { stop(); } else { speak(c.text + '. . ' + c.example, i); } };
  const toggleAll = () => { if (speaking) { stop(); } else { speakAll(day.briefing.map(b => getContent(b))); } };
  const toggleDetails = (i) => { setExpandedDetails(prev => ({ ...prev, [i]: !prev[i] })); };
  const videoQuery = DAY_VIDEOS[day.day] || day.theme;

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      {chatOpen !== null && (
        <AgentChatPanel topic={day.theme}
          briefingContext={day.briefing.map((b, i) => { const c = getContent(b); return `${i + 1}. ${c.text} Example: ${c.example}`; }).join('\n')}
          level={level} dayColor={day.color || '#6366F1'} onClose={() => setChatOpen(null)} />
      )}
      <div style={{ padding: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: '4px 8px', lineHeight: 1, color: T.text }}>&larr;</button>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {day.isGenerated ? `Chapter ${day.day} \u00B7 AI Generated` : `Day ${day.day}`} &middot; Level {level}
          </div>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>{day.theme}</h2>
        </div>
      </div>

      {day.isGenerated && day.basedOn && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {day.basedOn.map((t, i) => (
            <span key={i} style={{ fontSize: 10, padding: '2px 7px', background: '#8B5CF612', color: '#7C3AED', borderRadius: 4, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      )}

      <button onClick={toggleAll} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '14px 16px',
        background: speaking && currentIdx >= 0 ? `${day.color || '#6366F1'}15` : T.warmBg,
        border: `1px solid ${speaking ? (day.color || '#6366F1') : 'transparent'}`,
        borderRadius: 12, cursor: 'pointer', marginBottom: 16, transition: 'all 0.3s ease', color: T.text,
      }}>
        <span style={{ fontSize: 20 }}>{speaking ? '\u23F9' : '\uD83C\uDFA7'}</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{speaking ? 'Stop Listening' : 'Listen to Full Briefing'}</span>
        <span style={{ fontSize: 12, color: T.sub, marginLeft: 'auto' }}>~3 min</span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {day.briefing.map((b, i) => {
          const isActive = speaking && currentIdx === i;
          const content = getContent(b);
          const isDetailed = expandedDetails[i];
          const dayColor = day.color || '#6366F1';
          return (
            <div key={i} style={{
              background: T.card, border: `1px solid ${isActive ? dayColor : T.border}`,
              borderRadius: 14, padding: 16, boxShadow: isActive ? `0 0 12px ${dayColor}25` : 'none',
              transition: 'all 0.3s ease', animation: `fadeUp 0.45s ease ${i * 80}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${dayColor}15`, color: dayColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
                <button onClick={() => toggleBullet(i)} style={{ background: isActive ? `${dayColor}15` : '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: T.text }}>{isActive ? '\u23F9' : '\u25B6'}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${getLevelTierColor(content.tier)}15`, color: getLevelTierColor(content.tier), fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{getLevelTierLabel(content.tier)}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px', fontWeight: 500 }}>{content.text}</p>
              <div style={{ background: T.warmBg, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${dayColor}` }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: '#4B5563' }}>{content.example}</p>
              </div>

              {isDetailed && (
                <div style={{ marginTop: 12, padding: '14px', background: `${dayColor}06`, borderRadius: 10, border: `1px solid ${dayColor}20`, animation: 'fadeUp 0.3s ease' }}>
                  {content.tier !== 'advanced' && (b.advancedText || b.advancedExample) && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: dayColor, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\uD83D\uDD2C'} Technical Deep Dive</div>
                      {b.advancedText && <p style={{ fontSize: 13, lineHeight: 1.65, margin: '0 0 8px' }}>{b.advancedText}</p>}
                      {b.advancedExample && <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #8B5CF6', marginTop: 6 }}><p style={{ fontSize: 12, lineHeight: 1.55, margin: 0, color: '#4B5563' }}>{b.advancedExample}</p></div>}
                    </div>
                  )}
                  {content.tier === 'advanced' && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>{'\uD83D\uDCA1'} Simple Explanation</div>
                      <p style={{ fontSize: 13, lineHeight: 1.65, margin: '0 0 8px' }}>{b.text}</p>
                      <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', borderLeft: '3px solid #10B981', marginTop: 6 }}><p style={{ fontSize: 12, lineHeight: 1.55, margin: 0, color: '#4B5563' }}>{b.example}</p></div>
                    </div>
                  )}
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery + ' bullet ' + (i + 1))}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FF0000', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                    <span style={{ fontSize: 18 }}>{'\u25B6\uFE0F'}</span> Watch a Short Video
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => toggleDetails(i)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 12px', fontSize: 12, fontWeight: 600, background: isDetailed ? `${dayColor}12` : '#F3F4F6', color: isDetailed ? dayColor : T.sub, border: `1px solid ${isDetailed ? dayColor + '30' : 'transparent'}`, borderRadius: 10, cursor: 'pointer' }}>
                  <span style={{ fontSize: 14 }}>{'\uD83D\uDCD6'}</span> {isDetailed ? 'Less' : 'More Details'}
                </button>
                <button onClick={() => setChatOpen(i)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 12px', fontSize: 12, fontWeight: 600, background: `${dayColor}10`, color: dayColor, border: `1px solid ${dayColor}25`, borderRadius: 10, cursor: 'pointer' }}>
                  <span style={{ fontSize: 14 }}>{'\uD83D\uDCAC'}</span> Ask Agent
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!day.isGenerated && <HotToolsSection dayNum={day.day} dayColor={day.color} />}

      <button onClick={startQuiz} style={{ width: '100%', padding: '16px', marginTop: 24, background: day.color || '#6366F1', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
        Take the Quiz &rarr;
      </button>
    </div>
  );
}

// ─── Quiz View ──────────────────────────────────────────────────
function QuizView({ day, currentQ, answered, selectedOption, answerQuestion, nextQuestion, goHome }) {
  const q = day.quiz[currentQ];
  const letters = ['A', 'B', 'C', 'D'];
  const dayColor = day.color || '#6366F1';

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: '4px 8px', lineHeight: 1, color: T.text }}>&larr;</button>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day.isGenerated ? `Chapter ${day.day}` : `Day ${day.day}`} Quiz</div>
          <h2 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 700, margin: 0 }}>{day.theme}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= currentQ ? dayColor : '#E5E7EB', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.sub }}>Question {currentQ + 1} of 5</span>
        {q.toolQuestion && <span style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{'\uD83D\uDD27'} Tool</span>}
      </div>
      <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 20, fontWeight: 600, lineHeight: 1.4, margin: '0 0 20px' }}>{q.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isSelected = selectedOption === i;
          let bg = T.card, borderColor = T.border, badgeBg = '#F3F4F6', badgeColor = T.sub;
          if (answered) {
            if (isCorrect) { bg = '#F0FDF4'; borderColor = T.green; badgeBg = T.green; badgeColor = '#fff'; }
            if (isSelected && !isCorrect) { bg = '#FEF2F2'; borderColor = T.red; badgeBg = T.red; badgeColor = '#fff'; }
          }
          return (
            <button key={i} onClick={() => answerQuestion(i)} disabled={answered} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', textAlign: 'left',
              background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 10,
              cursor: answered ? 'default' : 'pointer', opacity: answered && !isCorrect && !isSelected ? 0.5 : 1, color: T.text,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: badgeBg, color: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                {answered && isCorrect ? '\u2713' : answered && isSelected && !isCorrect ? '\u2717' : letters[i]}
              </div>
              <span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <button onClick={nextQuestion} style={{
          width: '100%', padding: '16px', marginTop: 24, background: dayColor, color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', animation: 'fadeUp 0.3s ease',
        }}>{currentQ < 4 ? 'Next Question \u2192' : 'See Results \u2192'}</button>
      )}
    </div>
  );
}

// ─── Results View ───────────────────────────────────────────────
function ResultsView({ day, dayIdx, quizAnswers, scores, scoreKey, goHome, openDay, xpEarned }) {
  const score = scores[scoreKey] || 0;
  const emoji = score >= 4 ? '\uD83C\uDFC6' : score >= 3 ? '\uD83D\uDCAA' : '\uD83D\uDCDA';
  const message = score === 5 ? 'Perfect score! You nailed it!' : score >= 4 ? 'Excellent work!' : score >= 3 ? 'Good job! A few more to review.' : 'Keep learning!';
  const results = day.quiz.map((q, i) => ({ ...q, userAnswer: quizAnswers[i], index: i, isCorrect: quizAnswers[i] === q.answer }));
  const nextDayIdx = dayIdx < 6 ? dayIdx + 1 : null;
  const [showCorrect, setShowCorrect] = useState(false);
  const dayColor = day.color || '#6366F1';

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 44, fontWeight: 700, color: dayColor }}>{score}/5</div>
        <p style={{ fontSize: 15, color: T.sub, margin: '6px 0 0' }}>{message}</p>
        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF3C7', padding: '6px 14px', borderRadius: 20, animation: 'xpPop 0.5s ease 0.3s both' }}>
          <span style={{ fontSize: 14 }}>{'\u2B50'}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#92400E' }}>+{xpEarned} XP</span>
        </div>
      </div>

      {results.filter(w => !w.isCorrect).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 18, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><span>{'\uD83D\uDCD6'}</span> Review & Learn</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.filter(w => !w.isCorrect).map((w) => (
              <div key={w.index} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.4 }}>{w.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: `1px solid ${T.red}20` }}>
                    <span style={{ color: T.red, fontWeight: 600 }}>Your answer: </span>{w.options[w.userAnswer]}
                  </div>
                  <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8, background: '#F0FDF4', border: `1px solid ${T.green}20` }}>
                    <span style={{ color: T.green, fontWeight: 600 }}>Correct: </span>{w.options[w.answer]}
                  </div>
                </div>
                {w.learnLinks && (
                  <div style={{ background: T.warmBg, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: T.sub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Learn this (~5 min)</div>
                    {w.learnLinks.map((link, li) => (
                      <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: dayColor, textDecoration: 'none', padding: '6px 0', fontWeight: 500 }}>
                        <span>{'\uD83C\uDFAC'}</span> {link.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.filter(w => w.isCorrect).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowCorrect(!showCorrect)} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Newsreader', 'Georgia', serif", fontSize: 18, fontWeight: 700, padding: 0, marginBottom: 8, color: T.text,
          }}><span>{'\u2705'}</span> Nailed It <span style={{ fontSize: 14, color: T.sub, fontWeight: 400 }}>{showCorrect ? '\u25B2' : '\u25BC'}</span></button>
          {showCorrect && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.filter(w => w.isCorrect).map((w) => (
                <div key={w.index} style={{ background: '#F0FDF4', border: `1px solid ${T.green}20`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: T.green, fontSize: 16 }}>{'\u2713'}</span>
                  <span style={{ fontSize: 13 }}>{w.question}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {nextDayIdx !== null && dayIdx < 100 && (
          <button onClick={() => openDay(nextDayIdx)} style={{ width: '100%', padding: '16px', background: dayColor, color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Next: {DAYS[nextDayIdx]?.theme.split('\u2014')[0].trim()} &rarr;
          </button>
        )}
        <button onClick={goHome} style={{ width: '100%', padding: '14px', background: T.card, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
