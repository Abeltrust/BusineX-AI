import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  Globe, 
  Wallet as WalletIcon, 
  Stethoscope, 
  ChevronRight, 
  Plus, 
  Search, 
  Lightbulb, 
  Target, 
  ShieldCheck,
  ArrowRight,
  BarChart3,
  MapPin,
  Briefcase,
  DollarSign,
  PieChart,
  Zap,
  Download,
  FileText
} from 'lucide-react';
import { UserProfile, BusinessIdea, Roadmap, PitchDeck, BusinessClinicReport, UserType } from './types';
import { generateBusinessIdeas, generateRoadmap, generatePitchDeck, diagnoseBusiness, generateInvestmentOpportunities } from './services/ai';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

// --- Components ---
// ... (rest of the components)

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false,
  loading = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const variants = {
    primary: 'bg-black text-white hover:bg-zinc-800',
    secondary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    outline: 'border border-black/10 text-black hover:bg-black/5',
    ghost: 'text-zinc-500 hover:text-black hover:bg-black/5'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading ? <Zap className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'landing' | 'onboarding' | 'dashboard' | 'clinic' | 'wallet'>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [clinicReport, setClinicReport] = useState<BusinessClinicReport | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('businessx_user');
    const savedIdeas = localStorage.getItem('businessx_ideas');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStep('dashboard');
    }
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (user) localStorage.setItem('businessx_user', JSON.stringify(user));
    if (ideas.length > 0) localStorage.setItem('businessx_ideas', JSON.stringify(ideas));
  }, [user, ideas]);

  // Onboarding State
  const [onboardingData, setOnboardingData] = useState({
    type: 'founder' as UserType,
    name: '',
    city: '',
    country: '',
    background: '',
    skills: '',
    interests: '',
    capital: 0,
    riskAppetite: 'medium' as 'low' | 'medium' | 'high',
    industryPreferences: '',
    minInvestment: 1000,
    maxInvestment: 50000
  });

  const handleOnboardingSubmit = async () => {
    const profile: UserProfile = {
      type: onboardingData.type,
      name: onboardingData.name,
      location: { city: onboardingData.city, country: onboardingData.country },
      background: onboardingData.background,
      skills: onboardingData.skills.split(',').map(s => s.trim()),
      interests: onboardingData.interests.split(',').map(i => i.trim()),
      capital: onboardingData.capital,
      wallet: { balance: onboardingData.capital, investments: [], receivedFunds: 0, returns: 0 },
      investorProfile: onboardingData.type === 'investor' ? {
        riskAppetite: onboardingData.riskAppetite,
        industryPreferences: onboardingData.industryPreferences.split(',').map(s => s.trim()),
        minInvestment: onboardingData.minInvestment,
        maxInvestment: onboardingData.maxInvestment
      } : undefined
    };
    setUser(profile);
    setLoading(true);
    setStep('dashboard');
    
    try {
      if (profile.type === 'founder') {
        const generatedIdeas = await generateBusinessIdeas(profile);
        setIdeas(generatedIdeas);
      } else {
        const opportunities = await generateInvestmentOpportunities(profile);
        setIdeas(opportunities);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setLoading(false);
  };

  const handleSelectIdea = async (idea: BusinessIdea) => {
    setSelectedIdea(idea);
    if (!idea.roadmap) {
      setLoading(true);
      try {
        const roadmap = await generateRoadmap(idea, user!);
        const pitchDeck = await generatePitchDeck(idea);
        const updatedIdea = { ...idea, roadmap, investorReady: pitchDeck };
        setIdeas(prev => prev.map(i => i.id === idea.id ? updatedIdea : i));
        setSelectedIdea(updatedIdea);
      } catch (error) {
        console.error("Error generating roadmap/pitch:", error);
      }
      setLoading(false);
    }
  };

  const handleClinicSubmit = async (businessInfo: string) => {
    setLoading(true);
    try {
      const report = await diagnoseBusiness(businessInfo, user!);
      setClinicReport(report);
    } catch (error) {
      console.error("Error diagnosing business:", error);
    }
    setLoading(false);
  };

  const handleInvest = (idea: BusinessIdea) => {
    if (!user || !idea.investorReady) return;
    
    const amount = idea.investorReady.fundingRequired;
    if (user.wallet.balance < amount) {
      alert("Insufficient funds in wallet!");
      return;
    }

    const newInvestment = {
      id: Math.random().toString(36).substr(2, 9),
      businessId: idea.id,
      businessName: idea.name,
      amount,
      equity: idea.investorReady.suggestedEquity,
      date: new Date().toISOString()
    };

    setUser({
      ...user,
      wallet: {
        ...user.wallet,
        balance: user.wallet.balance - amount,
        investments: [...user.wallet.investments, newInvestment]
      }
    });
    alert(`Successfully invested $${amount.toLocaleString()} in ${idea.name}!`);
  };

  const downloadPDF = (type: 'roadmap' | 'pitch', idea: BusinessIdea) => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(22);
    doc.text(`BusineX Ai: ${idea.name}`, margin, y);
    y += 15;

    if (type === 'roadmap' && idea.roadmap) {
      doc.setFontSize(16);
      doc.text('Execution Roadmap', margin, y);
      y += 10;
      doc.setFontSize(12);
      const phases = [
        { label: 'Day 1', content: idea.roadmap.day1 },
        { label: 'First 30 Days', content: idea.roadmap.first30Days },
        { label: '6 Months', content: idea.roadmap.sixMonths },
        { label: '5-10 Years', content: idea.roadmap.fiveToTenYears }
      ];
      phases.forEach(p => {
        doc.setFont('helvetica', 'bold');
        doc.text(p.label, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(p.content, 170);
        doc.text(splitText, margin, y);
        y += (splitText.length * 7) + 5;
      });
    } else if (type === 'pitch' && idea.investorReady) {
      doc.setFontSize(16);
      doc.text('Investor Pitch Deck', margin, y);
      y += 10;
      doc.setFontSize(12);
      const sections = [
        { label: 'Executive Summary', content: idea.investorReady.executiveSummary },
        { label: 'Market Opportunity', content: idea.investorReady.marketOpportunity },
        { label: 'Business Model', content: idea.investorReady.businessModel },
        { label: 'Financial Projections', content: idea.investorReady.financialProjections }
      ];
      sections.forEach(s => {
        doc.setFont('helvetica', 'bold');
        doc.text(s.label, margin, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(s.content, 170);
        doc.text(splitText, margin, y);
        y += (splitText.length * 7) + 5;
      });
    }

    doc.save(`${idea.name}_${type}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('landing')}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg md:rounded-xl flex items-center justify-center">
            <Rocket className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight">BusineX Ai</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-4 md:gap-6">
              <button onClick={() => setStep('dashboard')} className={`text-xs md:text-sm font-medium ${step === 'dashboard' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>Dashboard</button>
              <button onClick={() => setStep('clinic')} className={`text-xs md:text-sm font-medium ${step === 'clinic' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>Clinic</button>
              <button onClick={() => setStep('wallet')} className={`text-xs md:text-sm font-medium ${step === 'wallet' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>Wallet</button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-black/5">
              <div className="text-right hidden xs:block">
                <p className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-wider">{user.type}</p>
                <p className="text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none">{user.name}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm md:text-base">
                {user.name[0]}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <AnimatePresence mode="wait">
          {/* Landing Page */}
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-6 md:gap-8 py-10 md:py-20"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] md:text-sm font-semibold mb-2 md:mb-4">
                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                <span>The Future of Global Entrepreneurship</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter max-w-4xl leading-[0.95] md:leading-[0.9]">
                Idea to <span className="text-emerald-600">Execution</span> in Seconds.
              </h1>
              <p className="text-base md:text-xl text-zinc-500 max-w-2xl leading-relaxed px-4">
                The world's first AI-powered startup ecosystem. Connect ideas, founders, and investors globally with hyper-local intelligence.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-4 md:mt-8 w-full sm:w-auto px-4">
                <Button onClick={() => setStep('onboarding')} className="text-base md:text-lg px-6 md:px-10 py-3 md:py-4 w-full sm:w-auto">
                  Launch Your Vision <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <Button variant="outline" className="text-base md:text-lg px-6 md:px-10 py-3 md:py-4 w-full sm:w-auto">
                  Explore Opportunities
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-24 w-full">
                {[
                  { icon: Lightbulb, title: "AI Ideation", desc: "Hyper-local business generation based on real-world problems." },
                  { icon: Target, title: "Growth Roadmaps", desc: "Actionable execution plans from Day 1 to 10-year vision." },
                  { icon: ShieldCheck, title: "Investor Ready", desc: "Automated pitch decks and fundable startup profiles." }
                ].map((feature, i) => (
                  <Card key={i} className="p-6 md:p-8 text-left hover:border-emerald-500/30 transition-colors group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-100 rounded-lg md:rounded-xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm md:text-base text-zinc-500 leading-relaxed">{feature.desc}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Onboarding */}
          {step === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto px-2 md:px-0"
            >
              <Card className="p-6 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 tracking-tight">Tell us about your vision</h2>
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button 
                      onClick={() => setOnboardingData({...onboardingData, type: 'founder'})}
                      className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all text-left ${onboardingData.type === 'founder' ? 'border-black bg-black text-white' : 'border-black/5 hover:border-black/20'}`}
                    >
                      <Briefcase className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4" />
                      <p className="font-bold text-base md:text-lg">I'm a Founder</p>
                      <p className={`text-xs md:text-sm ${onboardingData.type === 'founder' ? 'text-zinc-400' : 'text-zinc-500'}`}>I want to build or grow a business.</p>
                    </button>
                    <button 
                      onClick={() => setOnboardingData({...onboardingData, type: 'investor'})}
                      className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all text-left ${onboardingData.type === 'investor' ? 'border-black bg-black text-white' : 'border-black/5 hover:border-black/20'}`}
                    >
                      <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4" />
                      <p className="font-bold text-base md:text-lg">I'm an Investor</p>
                      <p className={`text-xs md:text-sm ${onboardingData.type === 'investor' ? 'text-zinc-400' : 'text-zinc-500'}`}>I want to fund high-impact startups.</p>
                    </button>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                        placeholder="John Doe"
                        value={onboardingData.name}
                        onChange={e => setOnboardingData({...onboardingData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">City</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                          placeholder="Lagos"
                          value={onboardingData.city}
                          onChange={e => setOnboardingData({...onboardingData, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Country</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                          placeholder="Nigeria"
                          value={onboardingData.country}
                          onChange={e => setOnboardingData({...onboardingData, country: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Background & Experience</label>
                      <textarea 
                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                        placeholder="Tell us about your skills and professional history..."
                        value={onboardingData.background}
                        onChange={e => setOnboardingData({...onboardingData, background: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Skills (comma separated)</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                          placeholder="Coding, Design, Marketing"
                          value={onboardingData.skills}
                          onChange={e => setOnboardingData({...onboardingData, skills: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Interests (comma separated)</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                          placeholder="Fintech, AI, Green Energy"
                          value={onboardingData.interests}
                          onChange={e => setOnboardingData({...onboardingData, interests: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Available Capital (USD)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                        placeholder="5000"
                        value={onboardingData.capital}
                        onChange={e => setOnboardingData({...onboardingData, capital: Number(e.target.value)})}
                      />
                    </div>

                    {onboardingData.type === 'investor' && (
                      <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-black/5">
                        <h4 className="font-bold text-base md:text-lg">Investor Preferences</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Risk Appetite</label>
                            <select 
                              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all bg-white text-sm md:text-base"
                              value={onboardingData.riskAppetite}
                              onChange={e => setOnboardingData({...onboardingData, riskAppetite: e.target.value as any})}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Industry Focus</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                              placeholder="Tech, Health, Real Estate"
                              value={onboardingData.industryPreferences}
                              onChange={e => setOnboardingData({...onboardingData, industryPreferences: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Min Investment</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                              value={onboardingData.minInvestment}
                              onChange={e => setOnboardingData({...onboardingData, minInvestment: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Max Investment</label>
                            <input 
                              type="number" 
                              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all text-sm md:text-base"
                              value={onboardingData.maxInvestment}
                              onChange={e => setOnboardingData({...onboardingData, maxInvestment: Number(e.target.value)})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleOnboardingSubmit} 
                    className="w-full py-3 md:py-4 text-base md:text-lg mt-2 md:mt-4"
                    disabled={!onboardingData.name || !onboardingData.city}
                  >
                    Enter Ecosystem <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Dashboard */}
          {step === 'dashboard' && user && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 md:space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">Welcome back, {user.name.split(' ')[0]}</h2>
                  <p className="text-xs md:text-base text-zinc-500 flex items-center gap-2">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" /> {user.location.city}, {user.location.country} • {user.type === 'founder' ? 'Founder Mode' : 'Investor Mode'}
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <Button variant="outline" onClick={() => setStep('clinic')} className="text-xs md:text-sm px-3 md:px-6 py-2 md:py-3 flex-1 md:flex-none">
                    <Stethoscope className="w-3 h-3 md:w-4 md:h-4" /> Business Clinic
                  </Button>
                  {user.type === 'founder' && (
                    <Button onClick={() => handleOnboardingSubmit()} loading={loading} className="text-xs md:text-sm px-3 md:px-6 py-2 md:py-3 flex-1 md:flex-none">
                      <Plus className="w-3 h-3 md:w-4 md:h-4" /> New Ideas
                    </Button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-[300px] md:h-[400px] bg-zinc-100 animate-pulse rounded-xl md:rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Ideas / Opportunities List */}
                  <div className="lg:col-span-1 space-y-3 md:space-y-4">
                    <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 md:mb-4">
                      {user.type === 'founder' ? 'AI-Generated Ideas' : 'Investment Opportunities'}
                    </h3>
                    <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                      {ideas.map((idea) => (
                        <button 
                          key={idea.id}
                          onClick={() => handleSelectIdea(idea)}
                          className={`min-w-[240px] lg:min-w-0 w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all group ${selectedIdea?.id === idea.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-black/5 bg-white hover:border-black/20'}`}
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                              <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${selectedIdea?.id === idea.id ? 'rotate-90 text-emerald-600' : 'text-zinc-300'}`} />
                          </div>
                          <h4 className="font-bold text-base md:text-lg mb-1 truncate">{idea.name}</h4>
                          <p className="text-xs md:text-sm text-zinc-500 line-clamp-2">{idea.concept}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detailed View */}
                  <div className="lg:col-span-2">
                    {selectedIdea ? (
                      <div className="space-y-6 md:space-y-8">
                        <Card className="p-6 md:p-10">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                            <div>
                              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">{selectedIdea.name}</h2>
                              <p className="text-base md:text-lg text-zinc-500">{selectedIdea.concept}</p>
                            </div>
                            {user.type === 'investor' && (
                              <Button variant="secondary" onClick={() => handleInvest(selectedIdea)} className="w-full sm:w-auto text-sm">
                                <DollarSign className="w-4 h-4" /> Invest Now
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
                            <div>
                              <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 md:mb-3">The Problem</h4>
                              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">{selectedIdea.problem}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 md:mb-3">The Solution</h4>
                              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">{selectedIdea.solution}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 md:mb-3">Target Market</h4>
                              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">{selectedIdea.targetMarket}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 md:mb-3">Competitive Edge</h4>
                              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">{selectedIdea.competitiveAdvantage}</p>
                            </div>
                          </div>

                          {loading ? (
                            <div className="space-y-3 md:space-y-4">
                              <div className="h-3 md:h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
                              <div className="h-3 md:h-4 bg-zinc-100 animate-pulse rounded w-1/2" />
                              <div className="h-3 md:h-4 bg-zinc-100 animate-pulse rounded w-2/3" />
                            </div>
                          ) : selectedIdea.roadmap && (
                            <div className="border-t border-black/5 pt-8 md:pt-12 space-y-8 md:space-y-12">
                              {/* Roadmap Section */}
                              <section>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                                    <BarChart3 className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" /> Execution Roadmap
                                  </h3>
                                  <Button variant="outline" onClick={() => downloadPDF('roadmap', selectedIdea)} className="text-xs md:text-sm w-full sm:w-auto">
                                    <Download className="w-3 h-3 md:w-4 md:h-4" /> Download PDF
                                  </Button>
                                </div>
                                <div className="space-y-6 md:space-y-8 relative before:absolute before:left-3 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
                                  {[
                                    { label: "Day 1", content: selectedIdea.roadmap.day1 },
                                    { label: "First 30 Days", content: selectedIdea.roadmap.first30Days },
                                    { label: "6 Months", content: selectedIdea.roadmap.sixMonths },
                                    { label: "5-10 Year Vision", content: selectedIdea.roadmap.fiveToTenYears }
                                  ].map((phase, i) => (
                                    <div key={i} className="relative pl-8 md:pl-12">
                                      <div className="absolute left-0 top-1 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full" />
                                      </div>
                                      <h5 className="font-bold text-base md:text-lg mb-1 md:mb-2">{phase.label}</h5>
                                      <p className="text-sm md:text-base text-zinc-600 leading-relaxed">{phase.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Investor Ready Section */}
                              {selectedIdea.investorReady && (
                                <section className="bg-zinc-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-10">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
                                      <ShieldCheck className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" /> Investor-Ready Profile
                                    </h3>
                                    <Button variant="ghost" className="text-white hover:bg-white/10 text-xs md:text-sm w-full sm:w-auto" onClick={() => downloadPDF('pitch', selectedIdea)}>
                                      <FileText className="w-3 h-3 md:w-4 md:h-4" /> Export Pitch
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10">
                                    <div className="p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">Funding Required</p>
                                      <p className="text-xl md:text-3xl font-bold">${selectedIdea.investorReady.fundingRequired.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">Equity Offered</p>
                                      <p className="text-xl md:text-3xl font-bold">{selectedIdea.investorReady.suggestedEquity}%</p>
                                    </div>
                                    <div className="p-4 md:p-6 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">Valuation</p>
                                      <p className="text-xl md:text-3xl font-bold">${(selectedIdea.investorReady.fundingRequired / (selectedIdea.investorReady.suggestedEquity / 100)).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-4 md:space-y-6">
                                    <div>
                                      <h5 className="font-bold text-emerald-400 mb-1 md:mb-2 text-sm md:text-base">Executive Summary</h5>
                                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">{selectedIdea.investorReady.executiveSummary}</p>
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-emerald-400 mb-1 md:mb-2 text-sm md:text-base">Business Model</h5>
                                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">{selectedIdea.investorReady.businessModel}</p>
                                    </div>
                                  </div>
                                </section>
                              )}
                            </div>
                          )}
                        </Card>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-black/5 rounded-2xl md:rounded-3xl bg-white/50">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
                          <Search className="w-8 h-8 md:w-10 md:h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2">Select an idea to explore</h3>
                        <p className="text-sm md:text-base text-zinc-500 max-w-sm">Choose one of the AI-generated opportunities to see the full roadmap and investor profile.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Business Clinic */}
          {step === 'clinic' && user && (
            <motion.div 
              key="clinic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6 md:space-y-12 px-4 md:px-0"
            >
              <div className="text-center mb-8 md:mb-12">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Stethoscope className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2 md:mb-4">Business Diagnosis Clinic</h2>
                <p className="text-base md:text-xl text-zinc-500">Already have a business? Let our AI diagnose challenges and prescribe growth strategies.</p>
              </div>

              <Card className="p-6 md:p-10">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 block">Business Description & Challenges</label>
                    <textarea 
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-black/10 focus:border-black outline-none transition-all min-h-[120px] md:min-h-[150px] text-sm md:text-base"
                      placeholder="Describe your current business, industry, and the specific problems you're facing..."
                      id="clinic-input"
                    />
                  </div>
                  <Button 
                    className="w-full py-3 md:py-4 text-base md:text-lg"
                    loading={loading}
                    onClick={() => {
                      const input = document.getElementById('clinic-input') as HTMLTextAreaElement;
                      if (input.value) handleClinicSubmit(input.value);
                    }}
                  >
                    Start Diagnosis <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </Card>

              {clinicReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 md:space-y-12"
                >
                  <Card className="p-6 md:p-10 border-l-4 border-l-emerald-500">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">AI Diagnosis</h3>
                    <p className="text-base md:text-lg text-zinc-700 leading-relaxed">{clinicReport.diagnosis}</p>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <Card className="p-6 md:p-8">
                      <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 text-amber-500" /> Recovery Strategies
                      </h4>
                      <ul className="space-y-3 md:space-y-4">
                        {clinicReport.recoveryStrategies.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm md:text-base text-zinc-600">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="p-6 md:p-8">
                      <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> Growth Hacks
                      </h4>
                      <ul className="space-y-3 md:space-y-4">
                        {clinicReport.growthHacks.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm md:text-base text-zinc-600">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  <Card className="p-6 md:p-10 bg-black text-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                      <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /> Investor-Ready Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      <div>
                        <h5 className="font-bold text-emerald-400 mb-3 md:mb-4 uppercase tracking-widest text-[10px] md:text-xs">Pivot Opportunities</h5>
                        <ul className="space-y-3 md:space-y-4">
                          {clinicReport.pivotOpportunities.map((s, i) => (
                            <li key={i} className="text-xs md:text-sm text-zinc-400 leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-emerald-400 mb-3 md:mb-4 uppercase tracking-widest text-[10px] md:text-xs">Next Steps for Funding</h5>
                        <ul className="space-y-3 md:space-y-4">
                          {clinicReport.investmentReadySteps.map((s, i) => (
                            <li key={i} className="flex gap-2 md:gap-3 text-xs md:text-sm text-zinc-400">
                              <span className="text-emerald-500 font-bold">{i + 1}.</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Wallet */}
          {step === 'wallet' && user && (
            <motion.div 
              key="wallet"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-6 md:space-y-12 px-4 md:px-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                <Card className="p-6 md:p-8 bg-black text-white">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">Total Balance</p>
                  <p className="text-2xl md:text-4xl font-bold">${user.wallet.balance.toLocaleString()}</p>
                </Card>
                <Card className="p-6 md:p-8">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2">Total Invested</p>
                  <p className="text-2xl md:text-4xl font-bold text-emerald-600">
                    ${user.wallet.investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                  </p>
                </Card>
                <Card className="p-6 md:p-8">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2">Projected Returns</p>
                  <p className="text-2xl md:text-4xl font-bold text-amber-500">${user.wallet.returns.toLocaleString()}</p>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="p-6 md:p-8 border-b border-black/5 flex justify-between items-center">
                  <h3 className="text-xl md:text-2xl font-bold">Investment Portfolio</h3>
                  <WalletIcon className="w-5 h-5 md:w-6 md:h-6 text-zinc-300" />
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left min-w-[600px] md:min-w-0">
                    <thead>
                      <tr className="bg-zinc-50 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <th className="px-6 md:px-8 py-3 md:py-4">Startup</th>
                        <th className="px-6 md:px-8 py-3 md:py-4">Date</th>
                        <th className="px-6 md:px-8 py-3 md:py-4">Amount</th>
                        <th className="px-6 md:px-8 py-3 md:py-4">Equity</th>
                        <th className="px-6 md:px-8 py-3 md:py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {user.wallet.investments.length > 0 ? (
                        user.wallet.investments.map((inv) => (
                          <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 md:px-8 py-4 md:py-6 font-bold text-sm md:text-base">{inv.businessName}</td>
                            <td className="px-6 md:px-8 py-4 md:py-6 text-zinc-500 text-xs md:text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                            <td className="px-6 md:px-8 py-4 md:py-6 font-semibold text-sm md:text-base">${inv.amount.toLocaleString()}</td>
                            <td className="px-6 md:px-8 py-4 md:py-6 text-emerald-600 font-bold text-sm md:text-base">{inv.equity}%</td>
                            <td className="px-6 md:px-8 py-4 md:py-6">
                              <span className="px-2 md:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">Active</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 md:px-8 py-8 md:py-12 text-center text-xs md:text-sm text-zinc-400 italic">
                            No investments made yet. Explore opportunities in the dashboard.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Cap Table Simulation */}
              {user.wallet.investments.length > 0 && (
                <Card className="p-6 md:p-10">
                  <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                    <PieChart className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" /> Ownership Structure (Cap Table)
                  </h3>
                  <div className="space-y-4 md:space-y-6">
                    {user.wallet.investments.map((inv) => (
                      <div key={inv.id} className="space-y-1 md:space-y-2">
                        <div className="flex justify-between text-xs md:text-sm font-bold">
                          <span>{inv.businessName}</span>
                          <span>{inv.equity}% Ownership</span>
                        </div>
                        <div className="w-full h-3 md:h-4 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${inv.equity}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-8 md:py-12 px-4 md:px-6 mt-10 md:mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-3 h-3 md:w-4 md:h-4" />
            </div>
            <span className="text-base md:text-lg font-bold tracking-tight">BusineX Ai</span>
          </div>
          <p className="text-zinc-400 text-[10px] md:text-sm text-center md:text-left">© 2026 BusineX Ai. Empowering global innovation through hyper-local intelligence.</p>
          <div className="flex gap-4 md:gap-6">
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-zinc-300 hover:text-black cursor-pointer transition-colors" />
            <Users className="w-4 h-4 md:w-5 md:h-5 text-zinc-300 hover:text-black cursor-pointer transition-colors" />
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-zinc-300 hover:text-black cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
