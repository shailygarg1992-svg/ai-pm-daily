import { useState, useCallback, useRef, useEffect } from 'react';
import { DAYS, HOT_TOOLS, DAY_TOOLS } from './data';

// ─── TTS Hook (improved voice selection + natural pausing) ──────
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
    // Prefer high-quality voices in order
    const priority = [
      'Samantha', 'Karen', 'Moira', 'Tessa',   // Apple high-quality
      'Google US English', 'Google UK English Female',  // Google
      'Microsoft Zira', 'Microsoft Jenny',       // Windows
      'Daniel', 'Alex',                          // Apple fallbacks
    ];
    for (const name of priority) {
      const v = voices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return voices.find(v => v.lang.startsWith('en') && v.localService) ||
           voices.find(v => v.lang.startsWith('en')) ||
           voices[0] || null;
  }, [voices]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setCurrentIdx(-1);
  }, []);

  const speak = useCallback((text, idx = 0) => {
    if (!window.speechSynthesis) return;
    stop();
    cancelledRef.current = false;

    // Break text into sentences for more natural pausing
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let si = 0;

    const speakNext = () => {
      if (cancelledRef.current || si >= sentences.length) {
        setSpeaking(false);
        setCurrentIdx(-1);
        return;
      }
      const utter = new SpeechSynthesisUtterance(sentences[si].trim());
      utter.rate = 1.0;   // slightly slower for natural feel
      utter.pitch = 1.0;
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      utter.onstart = () => { setSpeaking(true); setCurrentIdx(idx); };
      utter.onend = () => {
        si++;
        // Natural pause between sentences (200ms)
        setTimeout(speakNext, 200);
      };
      utter.onerror = () => { setSpeaking(false); setCurrentIdx(-1); };
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  }, [stop, pickVoice]);

  const speakAll = useCallback((items) => {
    if (!window.speechSynthesis) return;
    stop();
    cancelledRef.current = false;
    let i = 0;
    const next = () => {
      if (cancelledRef.current || i >= items.length) {
        setSpeaking(false);
        setCurrentIdx(-1);
        return;
      }
      const fullText = items[i].text + '. . ' + items[i].example;
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let si = 0;

      const speakSentence = () => {
        if (cancelledRef.current || si >= sentences.length) {
          i++;
          setTimeout(next, 600); // longer pause between bullets
          return;
        }
        const utter = new SpeechSynthesisUtterance(sentences[si].trim());
        utter.rate = 1.0;
        utter.pitch = 1.0;
        const voice = pickVoice();
        if (voice) utter.voice = voice;
        const idx = i;
        utter.onstart = () => { setSpeaking(true); setCurrentIdx(idx); };
        utter.onend = () => { si++; setTimeout(speakSentence, 200); };
        utter.onerror = () => { setSpeaking(false); setCurrentIdx(-1); };
        utterRef.current = utter;
        window.speechSynthesis.speak(utter);
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
};

// ─── Level helper ───────────────────────────────────────────────
function getContentForLevel(briefingItem, level) {
  // Levels 1-4: basic text + basic example
  // Levels 5-7: basic text + mix of examples
  // Levels 8-10: advanced text + advanced example
  if (level >= 8) {
    return {
      text: briefingItem.advancedText || briefingItem.text,
      example: briefingItem.advancedExample || briefingItem.example,
    };
  }
  if (level >= 5) {
    return {
      text: briefingItem.text,
      example: briefingItem.advancedExample || briefingItem.example,
    };
  }
  return { text: briefingItem.text, example: briefingItem.example };
}

function getLevelLabel(level) {
  if (level <= 2) return 'AI Curious';
  if (level <= 4) return 'AI Aware';
  if (level <= 6) return 'AI Competent';
  if (level <= 8) return 'AI Proficient';
  return 'AI Expert';
}

// ─── App ────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('onboarding');
  const [level, setLevel] = useState(5);
  const [selectedDay, setSelectedDay] = useState(0);
  const [scores, setScores] = useState({});
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const day = DAYS[selectedDay];
  const completedDays = Object.keys(scores).length;
  const avgScore = completedDays > 0
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / completedDays).toFixed(1)
    : '-';
  const streak = completedDays;

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
  };
  const nextQuestion = () => {
    if (currentQ < 4) {
      setCurrentQ(c => c + 1); setAnswered(false); setSelectedOption(null);
    } else {
      const finalScore = quizAnswers.reduce((acc, ans, i) =>
        acc + (ans === day.quiz[i].answer ? 1 : 0), 0);
      setScores(prev => ({ ...prev, [selectedDay]: finalScore }));
      setView('results'); window.scrollTo(0, 0);
    }
  };
  const goHome = () => { setView('home'); window.scrollTo(0, 0); };

  return (
    <div style={{
      minHeight: '100dvh', background: T.bg,
      fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif",
      color: T.text, WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; background: ${T.bg}; }
        button:active { opacity: 0.85; }
      `}</style>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', paddingBottom: 120 }}>
        {view === 'onboarding' && <OnboardingView level={level} setLevel={setLevel} onStart={() => setView('home')} />}
        {view === 'home' && <HomeView scores={scores} streak={streak} avgScore={avgScore}
          completedDays={completedDays} openDay={openDay} level={level} setLevel={setLevel} />}
        {view === 'briefing' && <BriefingView day={day} dayIdx={selectedDay}
          goHome={goHome} startQuiz={startQuiz} level={level} />}
        {view === 'quiz' && <QuizView day={day} currentQ={currentQ} answered={answered}
          selectedOption={selectedOption} answerQuestion={answerQuestion}
          nextQuestion={nextQuestion} goHome={goHome} />}
        {view === 'results' && <ResultsView day={day} dayIdx={selectedDay}
          quizAnswers={quizAnswers} scores={scores} goHome={goHome} openDay={openDay} />}
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
        <h1 style={{
          fontFamily: "'Newsreader', 'Georgia', serif",
          fontSize: 32, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px'
        }}>AI PM Daily</h1>
        <p style={{ color: T.sub, fontSize: 16, margin: 0, lineHeight: 1.5 }}>
          5-minute daily AI briefings for product managers
        </p>
      </div>

      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: '24px 20px', marginBottom: 24,
      }}>
        <h2 style={{
          fontFamily: "'Newsreader', 'Georgia', serif",
          fontSize: 20, fontWeight: 700, margin: '0 0 6px'
        }}>What's your AI knowledge level?</h2>
        <p style={{ color: T.sub, fontSize: 13, margin: '0 0 20px', lineHeight: 1.4 }}>
          This adjusts the depth of content and examples to match your experience.
        </p>

        {/* Level Slider */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>1 — New to AI</span>
            <span style={{ fontSize: 11, color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>10 — AI/ML Dev</span>
          </div>
          <input
            type="range" min="1" max="10" value={level}
            onChange={e => setLevel(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366F1', height: 8 }}
          />
        </div>

        {/* Level Display */}
        <div style={{
          background: T.warmBg, borderRadius: 12, padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 36, fontWeight: 700, color: '#6366F1',
          }}>{level}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{getLevelLabel(level)}</div>
          <p style={{ fontSize: 12, color: T.sub, margin: '6px 0 0' }}>
            {level <= 4 ? "We'll use simple analogies and everyday examples to explain AI concepts."
              : level <= 7 ? "We'll mix practical examples with some technical depth and real tool references."
              : "We'll include technical details, architecture patterns, and hands-on tool comparisons."}
          </p>
        </div>

        {/* What each level means */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { range: '1-2', label: 'AI Curious', desc: 'Never used ChatGPT or AI tools' },
            { range: '3-4', label: 'AI Aware', desc: 'Use ChatGPT occasionally, read AI news' },
            { range: '5-6', label: 'AI Competent', desc: 'Use AI tools daily, understand prompting' },
            { range: '7-8', label: 'AI Proficient', desc: 'Built AI features, understand RAG/agents' },
            { range: '9-10', label: 'AI Expert', desc: 'ML background, fine-tuned models, ship AI products' },
          ].map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
              opacity: Math.abs(level - (i * 2 + 1.5)) < 2 ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: T.sub, width: 28, flexShrink: 0,
              }}>{l.range}</span>
              <span style={{ fontWeight: 600, width: 90, flexShrink: 0 }}>{l.label}</span>
              <span style={{ color: T.sub }}>{l.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart} style={{
        width: '100%', padding: '16px',
        background: '#6366F1', color: '#fff', border: 'none',
        borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>
        Start Learning &rarr;
      </button>
    </div>
  );
}

// ─── Home View ──────────────────────────────────────────────────
function HomeView({ scores, streak, avgScore, completedDays, openDay, level, setLevel }) {
  const [showLevel, setShowLevel] = useState(false);

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '24px 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px'
          }}>AI PM Daily</h1>
          <p style={{ color: T.sub, fontSize: 14, margin: '4px 0 0' }}>
            5 minutes a day to become an AI-native PM
          </p>
        </div>
        <button onClick={() => setShowLevel(!showLevel)} style={{
          background: T.warmBg, border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 6, color: T.text,
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>Lv.{level}</span>
          <span style={{ fontSize: 10, color: T.sub }}>{showLevel ? '\u25B2' : '\u25BC'}</span>
        </button>
      </div>

      {/* Level adjuster (collapsible) */}
      {showLevel && (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: '14px 16px', marginBottom: 12,
          animation: 'fadeUp 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>AI Knowledge: {getLevelLabel(level)}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.sub }}>{level}/10</span>
          </div>
          <input type="range" min="1" max="10" value={level}
            onChange={e => setLevel(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6366F1', height: 6 }} />
          <p style={{ fontSize: 11, color: T.sub, margin: '6px 0 0' }}>
            Adjusts content depth. Higher = more technical examples and tool references.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Streak', value: `${streak}`, icon: '\uD83D\uDD25' },
          { label: 'Avg Score', value: avgScore, icon: '\uD83D\uDCC8' },
          { label: 'Complete', value: `${completedDays}/7`, icon: '\u2705' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: T.card, borderRadius: 12,
            padding: '14px 10px', textAlign: 'center', border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phase Hero */}
      <div style={{ background: T.warmBg, borderRadius: 14, padding: '20px 18px', marginBottom: 20 }}>
        <div style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px',
          color: T.sub, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6
        }}>Phase 1</div>
        <h2 style={{
          fontFamily: "'Newsreader', 'Georgia', serif",
          fontSize: 22, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3
        }}>AI Foundations</h2>
        <p style={{ color: T.sub, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          7 days of bite-sized AI concepts with real-world analogies, audio briefings, quizzes, and hands-on tools.
        </p>
      </div>

      {/* Day Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAYS.map((d, i) => {
          const completed = scores[i] !== undefined;
          return (
            <button key={i} onClick={() => openDay(i)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: T.card, border: `1px solid ${completed ? T.green : T.border}`,
              borderRadius: 14, padding: '14px 16px',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.2s ease',
              animation: `fadeUp 0.45s ease ${i * 50}ms both`,
              color: T.text,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: completed ? '#F0FDF4' : `${d.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>{completed ? '\u2705' : d.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, color: T.sub, textTransform: 'uppercase',
                  letterSpacing: '0.5px', marginBottom: 2
                }}>Day {d.day} &middot; 5 min &middot; {'\uD83C\uDFA7'}</div>
                <div style={{
                  fontSize: 14, fontWeight: 600, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{d.theme}</div>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {completed && (
                  <span style={{
                    background: '#F0FDF4', color: T.green,
                    fontSize: 12, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 6, fontFamily: "'JetBrains Mono', monospace"
                  }}>{scores[i]}/5</span>
                )}
                <span style={{ color: T.sub, fontSize: 18 }}>&rsaquo;</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Phase 2 Teaser */}
      <div style={{
        marginTop: 16, background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: '18px 16px', opacity: completedDays < 7 ? 0.6 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, background: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
          }}>{'\uD83D\uDD12'}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Phase 2: Interview Prep</div>
            <div style={{ fontSize: 12, color: T.sub }}>
              {completedDays >= 7 ? 'Coming soon!' : 'Complete Phase 1 to unlock'}
            </div>
          </div>
        </div>
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
      <h3 style={{
        fontFamily: "'Newsreader', 'Georgia', serif",
        fontSize: 18, fontWeight: 700, margin: '0 0 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{'\uD83D\uDD25'}</span> Hot Tools to Try
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tools.map((tool, i) => (
          <div key={i} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <button onClick={() => setExpanded(expanded === i ? null : i)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 14px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left', color: T.text,
            }}>
              <div style={{
                background: `${dayColor}10`, color: dayColor,
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
              }}>{tool.category}</div>
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{tool.name}</span>
              <span style={{ color: T.sub, fontSize: 12 }}>{expanded === i ? '\u25B2' : '\u25BC'}</span>
            </button>
            {expanded === i && (
              <div style={{ padding: '0 14px 14px', animation: 'fadeUp 0.3s ease' }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 10px', color: '#374151' }}>
                  {tool.description}
                </p>
                <div style={{
                  background: T.warmBg, borderRadius: 8, padding: '10px 12px', marginBottom: 10,
                  borderLeft: `3px solid ${dayColor}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 4,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>Why it matters for PMs</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#4B5563' }}>
                    {tool.whyItMatters}
                  </p>
                </div>
                <div style={{
                  background: '#EFF6FF', borderRadius: 8, padding: '10px 12px', marginBottom: 10,
                  borderLeft: '3px solid #3B82F6',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginBottom: 4,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{'\uD83C\uDFAF'} Quick Assignment</div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0, color: '#1E40AF' }}>
                    {tool.tryIt}
                  </p>
                </div>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: dayColor, fontWeight: 600, textDecoration: 'none',
                }}>
                  Try {tool.name} &rarr;
                </a>
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

  const getContent = (b) => getContentForLevel(b, level);

  const toggleBullet = (i) => {
    const c = getContent(day.briefing[i]);
    if (speaking && currentIdx === i) { stop(); }
    else { speak(c.text + '. . ' + c.example, i); }
  };

  const toggleAll = () => {
    if (speaking) { stop(); }
    else {
      const items = day.briefing.map(b => getContent(b));
      speakAll(items);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 24, padding: '4px 8px', lineHeight: 1, color: T.text,
        }}>&larr;</button>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>Day {day.day} &middot; Level {level}</div>
          <h2 style={{
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontSize: 20, fontWeight: 700, margin: 0
          }}>{day.theme}</h2>
        </div>
      </div>

      {/* Listen All */}
      <button onClick={toggleAll} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '14px 16px',
        background: speaking && currentIdx >= 0 ? `${day.color}15` : T.warmBg,
        border: `1px solid ${speaking ? day.color : 'transparent'}`,
        borderRadius: 12, cursor: 'pointer', marginBottom: 16,
        transition: 'all 0.3s ease', color: T.text,
      }}>
        <span style={{ fontSize: 20 }}>{speaking ? '\u23F9' : '\uD83C\uDFA7'}</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {speaking ? 'Stop Listening' : 'Listen to Full Briefing'}
        </span>
        <span style={{ fontSize: 12, color: T.sub, marginLeft: 'auto' }}>~3 min</span>
      </button>

      {/* Bullets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {day.briefing.map((b, i) => {
          const isActive = speaking && currentIdx === i;
          const content = getContent(b);
          return (
            <div key={i} style={{
              background: T.card,
              border: `1px solid ${isActive ? day.color : T.border}`,
              borderRadius: 14, padding: 16,
              boxShadow: isActive ? `0 0 12px ${day.color}25` : 'none',
              transition: 'all 0.3s ease',
              animation: `fadeUp 0.45s ease ${i * 80}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${day.color}15`, color: day.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                }}>{i + 1}</div>
                <button onClick={() => toggleBullet(i)} style={{
                  background: isActive ? `${day.color}15` : '#F3F4F6',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  width: 32, height: 32, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, transition: 'all 0.2s', color: T.text,
                }}>{isActive ? '\u23F9' : '\u25B6'}</button>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px', fontWeight: 500 }}>
                {content.text}
              </p>
              <div style={{
                background: T.warmBg, borderRadius: 10, padding: '12px 14px',
                borderLeft: `3px solid ${day.color}`,
              }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: '#4B5563' }}>
                  {content.example}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hot Tools */}
      <HotToolsSection dayNum={day.day} dayColor={day.color} />

      {/* Quiz CTA */}
      <button onClick={startQuiz} style={{
        width: '100%', padding: '16px', marginTop: 24,
        background: day.color, color: '#fff', border: 'none',
        borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>
        Take the Quiz &rarr;
      </button>
    </div>
  );
}

// ─── Quiz View ──────────────────────────────────────────────────
function QuizView({ day, currentQ, answered, selectedOption, answerQuestion, nextQuestion, goHome }) {
  const q = day.quiz[currentQ];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ padding: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 24, padding: '4px 8px', lineHeight: 1, color: T.text,
        }}>&larr;</button>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>Day {day.day} Quiz</div>
          <h2 style={{
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontSize: 20, fontWeight: 700, margin: 0
          }}>{day.theme}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= currentQ ? day.color : '#E5E7EB',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.sub,
        }}>Question {currentQ + 1} of 5</span>
        {q.toolQuestion && (
          <span style={{
            background: '#EFF6FF', color: '#3B82F6', fontSize: 9,
            padding: '2px 6px', borderRadius: 4, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
          }}>{'\uD83D\uDD27'} Tool Knowledge</span>
        )}
      </div>
      <h3 style={{
        fontFamily: "'Newsreader', 'Georgia', serif",
        fontSize: 20, fontWeight: 600, lineHeight: 1.4, margin: '0 0 20px',
      }}>{q.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isSelected = selectedOption === i;
          let bg = T.card, borderColor = T.border;
          let badgeBg = '#F3F4F6', badgeColor = T.sub;

          if (answered) {
            if (isCorrect) { bg = '#F0FDF4'; borderColor = T.green; badgeBg = T.green; badgeColor = '#fff'; }
            if (isSelected && !isCorrect) { bg = '#FEF2F2'; borderColor = T.red; badgeBg = T.red; badgeColor = '#fff'; }
          }

          return (
            <button key={i} onClick={() => answerQuestion(i)} disabled={answered} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '14px 16px', textAlign: 'left',
              background: bg, border: `1.5px solid ${borderColor}`,
              borderRadius: 10, cursor: answered ? 'default' : 'pointer',
              transition: 'all 0.15s',
              opacity: answered && !isCorrect && !isSelected ? 0.5 : 1,
              color: T.text,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: badgeBg, color: badgeColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{answered && isCorrect ? '\u2713' : answered && isSelected && !isCorrect ? '\u2717' : letters[i]}</div>
              <span style={{ fontSize: 13.5, lineHeight: 1.4 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <button onClick={nextQuestion} style={{
          width: '100%', padding: '16px', marginTop: 24,
          background: day.color, color: '#fff', border: 'none',
          borderRadius: 12, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', animation: 'fadeUp 0.3s ease',
        }}>{currentQ < 4 ? 'Next Question \u2192' : 'See Results \u2192'}</button>
      )}
    </div>
  );
}

// ─── Results View ───────────────────────────────────────────────
function ResultsView({ day, dayIdx, quizAnswers, scores, goHome, openDay }) {
  const score = scores[dayIdx] || 0;
  const emoji = score >= 4 ? '\uD83C\uDFC6' : score >= 3 ? '\uD83D\uDCAA' : '\uD83D\uDCDA';
  const message = score === 5 ? 'Perfect score! You nailed it!'
    : score >= 4 ? 'Excellent work! Almost perfect!'
    : score >= 3 ? 'Good job! A few more to review.'
    : 'Keep learning! Review the concepts below.';

  const results = day.quiz.map((q, i) => ({
    ...q, userAnswer: quizAnswers[i], index: i,
    isCorrect: quizAnswers[i] === q.answer,
  }));

  const nextDayIdx = dayIdx < 6 ? dayIdx + 1 : null;
  const [showCorrect, setShowCorrect] = useState(false);

  return (
    <div style={{ animation: 'fadeUp 0.45s ease' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 48, fontWeight: 700, color: day.color,
        }}>{score}/5</div>
        <p style={{ fontSize: 16, color: T.sub, margin: '8px 0 0' }}>{message}</p>
      </div>

      {/* Wrong Answers */}
      {results.filter(w => !w.isCorrect).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontSize: 18, fontWeight: 700, margin: '0 0 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}><span>{'\uD83D\uDCD6'}</span> Review & Learn</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.filter(w => !w.isCorrect).map((w) => (
              <div key={w.index} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {w.toolQuestion && (
                    <span style={{
                      background: '#EFF6FF', color: '#3B82F6', fontSize: 9,
                      padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                    }}>{'\uD83D\uDD27'} Tool Knowledge</span>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.4 }}>{w.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', border: `1px solid ${T.red}20` }}>
                    <span style={{ color: T.red, fontWeight: 600 }}>Your answer: </span>{w.options[w.userAnswer]}
                  </div>
                  <div style={{ fontSize: 13, padding: '8px 12px', borderRadius: 8, background: '#F0FDF4', border: `1px solid ${T.green}20` }}>
                    <span style={{ color: T.green, fontWeight: 600 }}>Correct: </span>{w.options[w.answer]}
                  </div>
                </div>
                <div style={{ background: T.warmBg, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{
                    fontSize: 11, color: T.sub, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>Learn this concept (~5 min each)</div>
                  {w.learnLinks.map((link, li) => (
                    <a key={li} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13, color: day.color, textDecoration: 'none',
                      padding: '6px 0', fontWeight: 500,
                    }}><span>{'\uD83C\uDFAC'}</span> {link.title}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correct Answers */}
      {results.filter(w => w.isCorrect).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowCorrect(!showCorrect)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontSize: 18, fontWeight: 700, padding: 0, marginBottom: 8, color: T.text,
          }}><span>{'\u2705'}</span> Nailed It
            <span style={{ fontSize: 14, color: T.sub, fontWeight: 400 }}>{showCorrect ? '\u25B2' : '\u25BC'}</span>
          </button>
          {showCorrect && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.filter(w => w.isCorrect).map((w) => (
                <div key={w.index} style={{
                  background: '#F0FDF4', border: `1px solid ${T.green}20`,
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ color: T.green, fontSize: 16 }}>{'\u2713'}</span>
                  <span style={{ fontSize: 13 }}>{w.question}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {nextDayIdx !== null && (
          <button onClick={() => openDay(nextDayIdx)} style={{
            width: '100%', padding: '16px',
            background: day.color, color: '#fff', border: 'none',
            borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>Next Day: {DAYS[nextDayIdx].theme.split('\u2014')[0].trim()} &rarr;</button>
        )}
        <button onClick={goHome} style={{
          width: '100%', padding: '14px',
          background: T.card, color: T.text,
          border: `1px solid ${T.border}`,
          borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Back to Home</button>
      </div>
    </div>
  );
}
