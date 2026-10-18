import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  ShoppingCart,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Download,
  Award,
  Sparkles,
  LogOut,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  Brand,
  SubjectCode,
  CatalogData,
  StudentProfile,
  CartItem,
  MathWorksheet,
} from './types';
import { INITIAL_CATALOG } from './initialData';

const ALL_SUBJECTS: SubjectCode[] = [
  'CM1', 'CM2', 'CS1', 'CS2', 'CB1', 'CB2', 'SP7', 'SP8', 'CP1', 'CP2',
];

const STORAGE_CATALOG_KEY = 'anactuary_catalog_v1';
const STORAGE_USER_KEY = 'anactuary_student_v1';

export default function App() {
  const [brand, setBrand] = useState<Brand>('actuary');
  const [activeTab, setActiveTab] = useState<'home' | 'subject' | 'mathmentor' | 'blog' | 'dashboard' | 'admin'>('home');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode>('CM1');
  const [subjectSection, setSubjectSection] = useState<'notes' | 'questions' | 'quiz' | 'videos'>('notes');

  // Persistent Catalog State
  const [catalog, setCatalog] = useState<CatalogData>(() => {
    const saved = localStorage.getItem(STORAGE_CATALOG_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  // Persistent Student / Admin User State
  const [user, setUser] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Admin form states
  const [adminSubject, setAdminSubject] = useState<SubjectCode>('CM1');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteTopic, setNewNoteTopic] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePremium, setNewNotePremium] = useState(false);

  const [newQQuestion, setNewQQuestion] = useState('');
  const [newQSolution, setNewQSolution] = useState('');

  const [wsTitle, setWsTitle] = useState('');
  const [wsLevel, setWsLevel] = useState<'GCSE' | 'A-Level'>('GCSE');
  const [wsBoard, setWsBoard] = useState<'Edexcel' | 'AQA' | 'OCR' | 'All Boards'>('Edexcel');
  const [wsTopic, setWsTopic] = useState('');
  const [wsPrice, setWsPrice] = useState('9.99');
  const [wsSample, setWsSample] = useState('');
  const [wsPdfData, setWsPdfData] = useState('');
  const [wsFileName, setWsFileName] = useState('');

  const [blogTitle, setBlogTitle] = useState('');
  const [blogBrand, setBlogBrand] = useState<Brand>('actuary');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  const currentSubjectData = catalog.subjects[selectedSubject];
  const hasCourseAccess = user?.isAdmin || user?.purchasedCourses.includes(selectedSubject);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'reset') {
      setAuthMessage(`Password reset instructions sent to ${authEmail}.`);
      return;
    }
    const adminEnvEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@anactuaryacademy.co.uk';
    const isAdminUser = authEmail.toLowerCase() === adminEnvEmail.toLowerCase() || authEmail.toLowerCase().includes('admin');

    const newProfile: StudentProfile = {
      email: authEmail,
      name: authName || authEmail.split('@')[0],
      isAdmin: isAdminUser,
      purchasedCourses: [],
      purchasedWorksheets: [],
      completedNotes: [],
      quizScores: {},
      orders: [],
    };
    setUser(newProfile);
    setShowAuthModal(false);
    setAuthMessage('');
  };

  const addToCart = (item: CartItem) => {
    if (!cart.some((c) => c.id === item.id)) {
      setCart([...cart, item]);
    }
    setShowCheckoutModal(true);
  };

  const completeStripeCheckout = () => {
    if (!user) {
      setShowCheckoutModal(false);
      setShowAuthModal(true);
      return;
    }
    const newCourses = [...user.purchasedCourses];
    const newWorksheets = [...user.purchasedWorksheets];

    cart.forEach((item) => {
      if (item.type === 'course' && !newCourses.includes(item.id as SubjectCode)) {
        newCourses.push(item.id as SubjectCode);
      }
      if (item.type === 'worksheet' && !newWorksheets.includes(item.id)) {
        newWorksheets.push(item.id);
      }
    });

    const total = cart.reduce((acc, item) => acc + item.priceGBP, 0);
    const order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail: user.email,
      items: cart,
      totalGBP: total,
      date: new Date().toLocaleDateString('en-GB'),
    };

    setUser({
      ...user,
      purchasedCourses: newCourses,
      purchasedWorksheets: newWorksheets,
      orders: [order, ...user.orders],
    });
    setCart([]);
    setShowCheckoutModal(false);
    setActiveTab('dashboard');
  };

  const toggleNoteComplete = (noteId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const exists = user.completedNotes.includes(noteId);
    const updated = exists
      ? user.completedNotes.filter((id) => id !== noteId)
      : [...user.completedNotes, noteId];
    setUser({ ...user, completedNotes: updated });
  };

  const submitQuiz = () => {
    const questions = currentSubjectData.quiz;
    let score = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) score++;
    });
    setQuizSubmitted(true);
    if (user) {
      setUser({
        ...user,
        quizScores: {
          ...user.quizScores,
          [selectedSubject]: {
            score,
            total: questions.length,
            date: new Date().toLocaleDateString('en-GB'),
          },
        },
      });
    }
  };

  const handleWorksheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWsFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWsPdfData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadWorksheet = (ws: MathWorksheet) => {
    if (ws.pdfDataUrl) {
      const a = document.createElement('a');
      a.href = ws.pdfDataUrl;
      a.download = ws.fileName || `${ws.title}.pdf`;
      a.click();
    } else {
      const textContent = `MATHMENTOR UK OFFICIAL WORKSHEET\nTitle: ${ws.title}\nLevel: ${ws.level} (${ws.examBoard})\nTopic: ${ws.topic}\n\n${ws.samplePreview}\n\n[Full Worked Solutions Included]`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ws.fileName.replace('.pdf', '.txt');
      a.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Dual-Brand Switcher Bar */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Select Brand Ecosystem:</span>
            <button
              onClick={() => { setBrand('actuary'); setActiveTab('home'); }}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                brand === 'actuary' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              AnActuary Academy (IFoA Exams)
            </button>
            <button
              onClick={() => { setBrand('mathmentor'); setActiveTab('mathmentor'); }}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                brand === 'mathmentor' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              MathMentor (GCSE & A-Level)
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Currency: <strong className="text-white">£ GBP</strong></span>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin CMS
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div
            onClick={() => setActiveTab(brand === 'actuary' ? 'home' : 'mathmentor')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className={`p-2.5 rounded-xl text-white ${brand === 'actuary' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {brand === 'actuary' ? <GraduationCap className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                {brand === 'actuary' ? 'AnActuary Academy' : 'MathMentor UK'}
              </span>
              <p className="text-xs text-slate-500">
                {brand === 'actuary' ? 'IFoA Actuarial Tuition & Revision Hub' : 'GCSE & A-Level Mathematics Excellence'}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
            <button onClick={() => { setBrand('actuary'); setActiveTab('home'); }} className="hover:text-indigo-600">
              IFoA Subjects (CM1–CP2)
            </button>
            <button onClick={() => { setBrand('mathmentor'); setActiveTab('mathmentor'); }} className="hover:text-emerald-600">
              MathMentor Worksheets
            </button>
            <button onClick={() => setActiveTab('blog')} className="hover:text-indigo-600">
              {brand === 'actuary' ? 'Actuarial Blog' : 'MathMentor Blog'}
            </button>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-600">
              Student Dashboard
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Basket"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center space-x-1.5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>{user.name}</span>
                </button>
                <button
                  onClick={() => setUser(null)}
                  className="p-2 text-slate-500 hover:text-rose-600"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm"
              >
                Student Login / Join
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Quick-Jump Bar for All 10 Actuarial Subjects */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 shrink-0">
              IFoA Exams:
            </span>
            {ALL_SUBJECTS.map((code) => (
              <button
                key={code}
                onClick={() => {
                  setBrand('actuary');
                  setSelectedSubject(code);
                  setActiveTab('subject');
                  setQuizSubmitted(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition shrink-0 ${
                  activeTab === 'subject' && selectedSubject === code
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl">
              <div className="max-w-3xl space-y-5">
                <span className="inline-block bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full">
                  IFoA 2026 Syllabus Ready • CM, CS, CB, SP & CP Subjects
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                  Pass Your Actuarial Exams With Structured Clarity.
                </h1>
                <p className="text-indigo-100 text-lg">
                  Topic-wise study notes, exam-style practice questions with full solutions, interactive scored quizzes, and on-demand video courses for all 10 core & specialist subjects.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => { setSelectedSubject('CM1'); setActiveTab('subject'); }}
                    className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl shadow"
                  >
                    Explore CM1 Hub
                  </button>
                  <button
                    onClick={() => { setBrand('mathmentor'); setActiveTab('mathmentor'); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow"
                  >
                    Visit MathMentor (GCSE & A-Level)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">All 10 IFoA Actuarial Subject Hubs</h2>
              <p className="text-slate-600 mb-6">Select any subject below to access free & premium study notes, practice questions, interactive quizzes, and video courses.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_SUBJECTS.map((code) => {
                  const sub = catalog.subjects[code];
                  return (
                    <div
                      key={code}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-extrabold text-sm rounded-lg">
                            {sub.code}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{sub.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{sub.name}</h3>
                        <p className="text-sm text-slate-600 mb-4">{sub.description}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">Full Course: £{sub.coursePriceGBP}</span>
                        <button
                          onClick={() => {
                            setSelectedSubject(code);
                            setActiveTab('subject');
                          }}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Open Subject Hub →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBJECT HUB PAGE (CM1 - CP2) */}
        {activeTab === 'subject' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-md">
                    {currentSubjectData.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {currentSubjectData.category}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {currentSubjectData.code}: {currentSubjectData.name}
                </h1>
                <p className="text-slate-600 mt-1 max-w-2xl">{currentSubjectData.description}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 text-center md:text-right">
                {hasCourseAccess ? (
                  <div className="text-emerald-700 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Full Premium Access Unlocked
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500">Complete Video Course & Premium Notes</p>
                    <p className="text-2xl font-extrabold text-slate-900 my-1">£{currentSubjectData.coursePriceGBP}</p>
                    <button
                      onClick={() =>
                        addToCart({
                          id: currentSubjectData.code,
                          type: 'course',
                          title: `${currentSubjectData.code} Complete Video & Revision Course`,
                          priceGBP: currentSubjectData.coursePriceGBP,
                        })
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow"
                    >
                      Unlock Full {currentSubjectData.code} Course (£{currentSubjectData.coursePriceGBP})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'notes', label: 'Topic Study Notes', icon: BookOpen },
                { id: 'questions', label: 'Practice Questions & Solutions', icon: FileText },
                { id: 'quiz', label: 'Interactive Scored Quiz', icon: HelpCircle },
                { id: 'videos', label: 'Paid Video Course', icon: PlayCircle },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSubjectSection(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                      subjectSection === t.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* 1. Study Notes */}
            {subjectSection === 'notes' && (
              <div className="space-y-4">
                {currentSubjectData.notes.map((note) => {
                  const locked = note.isPremium && !hasCourseAccess;
                  const isDone = user?.completedNotes.includes(note.id);
                  return (
                    <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase">{note.topic}</span>
                          <h3 className="text-lg font-bold text-slate-900">{note.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              note.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {note.isPremium ? 'Premium Resource' : 'Free Study Note'}
                          </span>
                          {!locked && (
                            <button
                              onClick={() => toggleNoteComplete(note.id)}
                              className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1 ${
                                isDone
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isDone ? 'Completed' : 'Mark Complete'}
                            </button>
                          )}
                        </div>
                      </div>
                      {locked ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Lock className="w-4 h-4 text-amber-600" />
                            <span>Unlock the {currentSubjectData.code} Full Course to view this premium revision note.</span>
                          </div>
                          <button
                            onClick={() =>
                              addToCart({
                                id: currentSubjectData.code,
                                type: 'course',
                                title: `${currentSubjectData.code} Complete Course`,
                                priceGBP: currentSubjectData.coursePriceGBP,
                              })
                            }
                            className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg"
                          >
                            Unlock (£{currentSubjectData.coursePriceGBP})
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{note.content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Practice Questions */}
            {subjectSection === 'questions' && (
              <div className="space-y-4">
                {currentSubjectData.questions.map((q) => {
                  const locked = q.isPremium && !hasCourseAccess;
                  const shown = revealedSolutions[q.id];
                  return (
                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 uppercase">{q.topic}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {q.isPremium ? 'Premium Exam Question' : 'Free Practice Question'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{q.question}</p>
                      {locked ? (
                        <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Official Examiner Solution requires {currentSubjectData.code} Course Access.
                        </p>
                      ) : (
                        <div>
                          <button
                            onClick={() => setRevealedSolutions({ ...revealedSolutions, [q.id]: !shown })}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            {shown ? 'Hide Worked Solution' : 'Show Step-by-Step Worked Solution'}
                          </button>
                          {shown && (
                            <div className="mt-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-lg text-sm text-slate-800 whitespace-pre-line">
                              {q.solution}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Interactive Quiz */}
            {subjectSection === 'quiz' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">
                    {currentSubjectData.code} Interactive Assessment Quiz
                  </h3>
                  {quizSubmitted && (
                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-sm">
                      Score: {user?.quizScores[selectedSubject]?.score ?? 0} / {currentSubjectData.quiz.length}
                    </span>
                  )}
                </div>

                {currentSubjectData.quiz.map((qz, idx) => (
                  <div key={qz.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="font-bold text-slate-900">
                      {idx + 1}. {qz.question}
                    </p>
                    <div className="space-y-2">
                      {qz.options.map((opt, oIdx) => {
                        const selected = quizAnswers[qz.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qz.id]: oIdx })}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition ${
                              selected
                                ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                        <strong>Explanation:</strong> {qz.explanation}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex gap-3">
                  <button
                    onClick={submitQuiz}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl"
                  >
                    Submit & Grade Quiz
                  </button>
                  {quizSubmitted && (
                    <button
                      onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 4. Paid Video Courses */}
            {subjectSection === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSubjectData.videos.map((vid) => (
                  <div key={vid.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">{vid.duration}</span>
                      <span className="text-xs font-semibold text-slate-500">HD Actuarial Lecture</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{vid.title}</h4>
                    {hasCourseAccess ? (
                      <video controls className="w-full rounded-xl bg-black">
                        <source src={vid.videoUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="bg-slate-900 text-white rounded-xl p-8 text-center space-y-3">
                        <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-sm text-slate-300">
                          Purchase the {currentSubjectData.code} Video Course (£{currentSubjectData.coursePriceGBP}) to stream all on-demand lectures.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MATHMENTOR GCSE & A-LEVEL WORKSHEET STORE */}
        {activeTab === 'mathmentor' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-8 text-white shadow-lg">
              <span className="text-xs uppercase font-bold bg-emerald-500/30 px-3 py-1 rounded-full">
                MathMentor UK • GCSE & A-Level Maths
              </span>
              <h1 className="text-3xl font-extrabold mt-3">
                Printable Exam Worksheets & Worked Solutions (£ GBP)
              </h1>
              <p className="text-emerald-100 mt-2 max-w-2xl">
                Targeted Edexcel, AQA, and OCR revision packs. Instant secure download after purchase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {catalog.worksheets.map((ws) => {
                const isPurchased = user?.isAdmin || user?.purchasedWorksheets.includes(ws.id);
                return (
                  <div key={ws.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                          {ws.level} • {ws.examBoard}
                        </span>
                        <span className="text-lg font-extrabold text-slate-900">£{ws.priceGBP.toFixed(2)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">{ws.title}</h3>
                      <p className="text-xs font-semibold text-slate-500">Topic: {ws.topic}</p>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <strong>Sample Question Preview:</strong> {ws.samplePreview}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      {isPurchased ? (
                        <button
                          onClick={() => downloadWorksheet(ws)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download Worksheet PDF
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            addToCart({
                              id: ws.id,
                              type: 'worksheet',
                              title: ws.title,
                              priceGBP: ws.priceGBP,
                            })
                          }
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-2.5 rounded-xl"
                        >
                          Buy Worksheet (£{ws.priceGBP.toFixed(2)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DUAL-BRAND BLOG */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {brand === 'actuary' ? 'AnActuary Academy Insights' : 'MathMentor Revision Blog'}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setBrand('actuary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${brand === 'actuary' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
                >
                  Actuarial Posts
                </button>
                <button
                  onClick={() => setBrand('mathmentor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${brand === 'mathmentor' ? 'bg-emerald-600 text-white' : 'bg-white border'}`}
                >
                  MathMentor Posts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {catalog.blogs
                .filter((b) => b.brand === brand)
                .map((post) => (
                  <article key={post.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>{post.author}</span>
                      <span>{post.date} • {post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{post.title}</h2>
                    <p className="text-sm font-medium text-slate-600">{post.excerpt}</p>
                    <p className="text-sm text-slate-700 pt-2 border-t border-slate-100 whitespace-pre-line">
                      {post.content}
                    </p>
                  </article>
                ))}
            </div>
          </div>
        )}

        {/* STUDENT PROGRESS & PURCHASES DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {!user ? (
              <div className="bg-white rounded-2xl border p-8 text-center space-y-4">
                <Award className="w-12 h-12 text-indigo-600 mx-auto" />
                <h2 className="text-xl font-bold">Sign in to view your Student Progress & Purchased Courses</h2>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl"
                >
                  Student Login / Register
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {user.name}</h1>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      {user.completedNotes.length} Study Notes Completed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border p-6 space-y-3">
                    <h3 className="font-bold text-slate-900">Unlocked Actuarial Courses</h3>
                    {user.purchasedCourses.length === 0 ? (
                      <p className="text-sm text-slate-500">No courses purchased yet.</p>
                    ) : (
                      user.purchasedCourses.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setSelectedSubject(c); setActiveTab('subject'); }}
                          className="block w-full text-left px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm"
                        >
                          {c} — Open Course Hub →
                        </button>
                      ))
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border p-6 space-y-3">
                    <h3 className="font-bold text-slate-900">Purchased MathMentor Worksheets</h3>
                    {user.purchasedWorksheets.length === 0 ? (
                      <p className="text-sm text-slate-500">No worksheets purchased yet.</p>
                    ) : (
                      catalog.worksheets
                        .filter((w) => user.purchasedWorksheets.includes(w.id))
                        .map((w) => (
                          <div key={w.id} className="flex items-center justify-between text-sm bg-emerald-50 p-2.5 rounded-lg">
                            <span className="font-semibold text-emerald-950">{w.title}</span>
                            <button
                              onClick={() => downloadWorksheet(w)}
                              className="text-xs font-bold text-emerald-700 underline"
                            >
                              Download
                            </button>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border p-6 space-y-3">
                    <h3 className="font-bold text-slate-900">Quiz Results & Order History</h3>
                    {Object.entries(user.quizScores).map(([code, res]) => (
                      <div key={code} className="text-sm flex justify-between border-b pb-1">
                        <span className="font-bold">{code} Quiz:</span>
                        <span>{res.score}/{res.total} ({res.date})</span>
                      </div>
                    ))}
                    {user.orders.map((ord) => (
                      <div key={ord.id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        <strong>{ord.id}</strong> • £{ord.totalGBP.toFixed(2)} ({ord.date})
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* NO-CODE ADMIN CMS DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="space-y-8">
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold">No-Code Admin CMS Dashboard</h1>
                <p className="text-xs text-slate-400">
                  Manage CM1–CP2 notes, questions, course GBP prices, MathMentor PDF uploads, and blog posts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Study Note & Update Subject Price */}
              <div className="bg-white rounded-2xl border p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">1. Manage Actuarial Subject & Add Study Note</h2>
                <div className="flex gap-3">
                  <select
                    value={adminSubject}
                    onChange={(e) => setAdminSubject(e.target.value as SubjectCode)}
                    className="border rounded-lg px-3 py-2 text-sm font-bold"
                  >
                    {ALL_SUBJECTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={catalog.subjects[adminSubject].coursePriceGBP}
                    onChange={(e) => {
                      const price = Number(e.target.value) || 0;
                      setCatalog({
                        ...catalog,
                        subjects: {
                          ...catalog.subjects,
                          [adminSubject]: { ...catalog.subjects[adminSubject], coursePriceGBP: price },
                        },
                      });
                    }}
                    className="border rounded-lg px-3 py-2 text-sm w-36"
                    placeholder="Price (£)"
                  />
                  <span className="text-xs text-slate-500 self-center">Course Price (£ GBP)</span>
                </div>

                <input
                  value={newNoteTopic}
                  onChange={(e) => setNewNoteTopic(e.target.value)}
                  placeholder="Module / Topic Name"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Study Note Title"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Full study note content..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={newNotePremium}
                    onChange={(e) => setNewNotePremium(e.target.checked)}
                  />
                  Require Premium Course Purchase
                </label>
                <button
                  onClick={() => {
                    if (!newNoteTitle) return;
                    const sub = catalog.subjects[adminSubject];
                    const updated = {
                      ...sub,
                      notes: [
                        ...sub.notes,
                        {
                          id: `${adminSubject}-n-${Date.now()}`,
                          title: newNoteTitle,
                          topic: newNoteTopic || 'Core Topic',
                          content: newNoteContent,
                          isPremium: newNotePremium,
                        },
                      ],
                    };
                    setCatalog({ ...catalog, subjects: { ...catalog.subjects, [adminSubject]: updated } });
                    setNewNoteTitle('');
                    setNewNoteTopic('');
                    setNewNoteContent('');
                  }}
                  className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Publish Note to {adminSubject}
                </button>
              </div>

              {/* Upload MathMentor PDF Worksheet */}
              <div className="bg-white rounded-2xl border p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">2. Upload MathMentor PDF Worksheet (£ GBP)</h2>
                <input
                  value={wsTitle}
                  onChange={(e) => setWsTitle(e.target.value)}
                  placeholder="Worksheet Title (e.g. GCSE Higher Vectors Pack)"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={wsLevel}
                    onChange={(e) => setWsLevel(e.target.value as any)}
                    className="border rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="GCSE">GCSE</option>
                    <option value="A-Level">A-Level</option>
                  </select>
                  <select
                    value={wsBoard}
                    onChange={(e) => setWsBoard(e.target.value as any)}
                    className="border rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="Edexcel">Edexcel</option>
                    <option value="AQA">AQA</option>
                    <option value="OCR">OCR</option>
                    <option value="All Boards">All Boards</option>
                  </select>
                  <input
                    value={wsPrice}
                    onChange={(e) => setWsPrice(e.target.value)}
                    placeholder="Price £"
                    className="border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={wsTopic}
                  onChange={(e) => setWsTopic(e.target.value)}
                  placeholder="Topic (e.g. Calculus / Trigonometry)"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={wsSample}
                  onChange={(e) => setWsSample(e.target.value)}
                  placeholder="Sample preview question shown before purchase..."
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Attach Worksheet PDF File:</label>
                  <input type="file" accept=".pdf" onChange={handleWorksheetUpload} className="text-xs" />
                </div>
                <button
                  onClick={() => {
                    if (!wsTitle) return;
                    const newWs: MathWorksheet = {
                      id: `ws-${Date.now()}`,
                      title: wsTitle,
                      level: wsLevel,
                      examBoard: wsBoard,
                      topic: wsTopic || 'Mathematics',
                      priceGBP: parseFloat(wsPrice) || 9.99,
                      samplePreview: wsSample,
                      pdfDataUrl: wsPdfData,
                      fileName: wsFileName || `${wsTitle}.pdf`,
                    };
                    setCatalog({ ...catalog, worksheets: [newWs, ...catalog.worksheets] });
                    setWsTitle('');
                    setWsTopic('');
                    setWsSample('');
                  }}
                  className="bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Publish Worksheet for Sale
                </button>
              </div>

              {/* Publish Blog Post */}
              <div className="bg-white rounded-2xl border p-6 space-y-4 lg:col-span-2">
                <h2 className="font-bold text-lg text-slate-900">3. Publish Blog Post (AnActuary or MathMentor)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={blogBrand}
                    onChange={(e) => setBlogBrand(e.target.value as Brand)}
                    className="border rounded-lg px-3 py-2 text-sm font-bold"
                  >
                    <option value="actuary">AnActuary Academy Blog</option>
                    <option value="mathmentor">MathMentor Blog</option>
                  </select>
                  <input
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="Article Title"
                    className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
                  />
                </div>
                <input
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Short summary excerpt..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Full article body..."
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={() => {
                    if (!blogTitle) return;
                    setCatalog({
                      ...catalog,
                      blogs: [
                        {
                          id: `blog-${Date.now()}`,
                          brand: blogBrand,
                          title: blogTitle,
                          excerpt: blogExcerpt,
                          content: blogContent,
                          author: blogBrand === 'actuary' ? 'AnActuary Faculty' : 'MathMentor Lead Tutor',
                          date: new Date().toLocaleDateString('en-GB'),
                          readTime: '5 min read',
                        },
                        ...catalog.blogs,
                      ],
                    });
                    setBlogTitle('');
                    setBlogExcerpt('');
                    setBlogContent('');
                  }}
                  className="bg-slate-900 text-white font-bold text-sm px-5 py-2.5 rounded-lg"
                >
                  Publish Blog Article
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-extrabold text-slate-900">
              {authMode === 'login' ? 'Student & Admin Sign In' : authMode === 'register' ? 'Create Student Account' : 'Reset Password'}
            </h3>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <input
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
              <input
                required
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              {authMode !== 'reset' && (
                <input
                  required
                  type="password"
                  placeholder="Password"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
              {authMessage && <p className="text-xs text-emerald-700 font-semibold">{authMessage}</p>}
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl">
                {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Register Account' : 'Send Reset Link'}
              </button>
            </form>
            <div className="flex justify-between text-xs text-indigo-600 font-semibold pt-2">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? 'Need an account? Register' : 'Already registered? Sign In'}
              </button>
              <button onClick={() => setAuthMode('reset')}>Forgot password?</button>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE GBP CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-extrabold text-slate-900">Secure GBP (£) Checkout</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">Your basket is empty.</p>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm border-b pb-2">
                      <span className="font-semibold">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">£{item.priceGBP.toFixed(2)}</span>
                        <button
                          onClick={() => setCart(cart.filter((c) => c.id !== item.id))}
                          className="text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-extrabold text-lg pt-2">
                  <span>Total (GBP):</span>
                  <span>£{cart.reduce((sum, i) => sum + i.priceGBP, 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={completeStripeCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow"
                >
                  Pay £{cart.reduce((sum, i) => sum + i.priceGBP, 0).toFixed(2)} & Unlock Instantly
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AnActuary Academy & MathMentor UK. All rights reserved. Pricing in £ GBP.</p>
          <p>Actuarial Subjects: CM1 • CM2 • CS1 • CS2 • CB1 • CB2 • SP7 • SP8 • CP1 • CP2</p>
        </div>
      </footer>
    </div>
  );
}