import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat } from '@google/genai';
import { initTutorSession, sendTutorMessage, generateStellarImage } from '../services/geminiService';
import { MasteryResponse } from '../types';
import { supabase } from '../services/supabaseClient';
import PropulsionLab from './PropulsionLab';
import {
    Brain,
    Rocket,
    Stars,
    ArrowRight,
    X,
    CheckCircle,
    XCircle,
    SkipForward,
    Lightbulb,
    Network,
    GitBranch,
    BookOpen
} from 'lucide-react';

// ===================================
// MOCK QUIZ DATA WITH MULTIMODAL ANALYSIS
// ===================================

const quizQuestions = [
    {
        id: 1,
        question: "What causes the phenomenon of gravitational lensing observed around massive celestial objects?",
        options: [
            "Refraction of light through atmospheric gases",
            "Curvature of spacetime by massive objects",
            "Magnetic field deflection of photons",
            "Quantum tunneling of light particles"
        ],
        correctAnswer: 1,
        multimodalAnalysis: {
            explanation: "Gravitational lensing occurs when a massive object (like a galaxy or black hole) warps the fabric of spacetime around it. According to Einstein's General Theory of Relativity, mass curves spacetime, and light follows this curved path. When light from a distant source passes near a massive object, the curved spacetime acts like a lens, bending the light's trajectory and creating distorted, magnified, or multiple images of the background object.",
            analogy: "Imagine spacetime as a stretched rubber sheet. When you place a heavy bowling ball (massive object) on it, the sheet curves downward. If you roll a marble (light ray) across the sheet near the bowling ball, it won't travel in a straight line—it curves around the depression. Similarly, light traveling through curved spacetime bends around massive objects, creating the lensing effect we observe.",
            flowchartSteps: [
                "Distant light source emits photons",
                "Light travels through space toward Earth",
                "Massive object (galaxy/black hole) lies in the path",
                "Object's mass curves spacetime around it",
                "Light follows curved spacetime path",
                "Observer sees distorted/magnified image"
            ],
            conceptMapTags: [
                "General Relativity",
                "Spacetime Curvature",
                "Einstein's Theory",
                "Mass-Energy",
                "Light Deflection",
                "Cosmic Magnification",
                "Dark Matter Detection"
            ]
        }
    },
    {
        id: 2,
        question: "Why do neutron stars have such incredibly strong magnetic fields compared to regular stars?",
        options: [
            "They absorb magnetic energy from nearby black holes",
            "Nuclear fusion creates magnetic monopoles",
            "Conservation of magnetic flux during stellar collapse",
            "Interaction with cosmic microwave background radiation"
        ],
        correctAnswer: 2,
        multimodalAnalysis: {
            explanation: "Neutron stars possess extraordinarily powerful magnetic fields due to the conservation of magnetic flux during stellar core collapse. When a massive star's core collapses into a neutron star, its radius shrinks from thousands of kilometers to just about 20 kilometers. Since magnetic flux (Φ = B × A) must be conserved, and the surface area (A) decreases dramatically, the magnetic field strength (B) must increase proportionally. This compression can amplify the original stellar magnetic field by factors of billions, creating fields trillions of times stronger than Earth's.",
            analogy: "Think of a figure skater spinning with arms extended. When they pull their arms in close to their body, they spin much faster due to conservation of angular momentum. Similarly, when a star's magnetic field lines are 'pulled in' during collapse, the magnetic field strength intensifies dramatically. The smaller the neutron star, the more concentrated and powerful its magnetic field becomes—like compressing a spring into a tiny space.",
            flowchartSteps: [
                "Massive star has normal magnetic field",
                "Star exhausts nuclear fuel",
                "Core collapses under gravity",
                "Radius shrinks: ~1000 km → ~20 km",
                "Magnetic flux must be conserved",
                "Field strength increases by ~10¹² times",
                "Neutron star has ultra-strong magnetism"
            ],
            conceptMapTags: [
                "Stellar Collapse",
                "Magnetic Flux Conservation",
                "Neutron Star Formation",
                "Magnetars",
                "Supernova Remnants",
                "Pulsar Radiation",
                "Extreme Physics"
            ]
        }
    }
];

const STAR_STAGES = [
    {
        id: 'nebula',
        title: 'Stellar Nebula',
        description: 'A giant cloud of dust and gas in space, the birthplace of stars.',
        color: '#a855f7',
        prompt: '3D scientific render of a stellar nebula with gas clouds and dust, soft volumetric lighting, dark space background, semi-realistic style, centered composition, UI-ready, no text, no cartoon style.'
    },
    {
        id: 'proto',
        title: 'Protostar',
        description: 'Early stage star formation where a core begins to collapse under gravity.',
        color: '#fbbf24',
        prompt: 'A realistic protostar forming inside a dense molecular cloud, glowing hot core surrounded by swirling accretion disk, jets of plasma shooting from the poles, illuminated nebula gas and cosmic dust, infrared and visible light blend, deep space background with stars, cinematic astrophotography, ultra-detailed, NASA-style scientific visualization, high contrast, 4K resolution'
    },
    {
        id: 'main',
        title: 'Main Sequence',
        description: 'A stable star, like our Sun, fusing hydrogen into helium in its core.',
        color: '#facc15',
        prompt: '3D realistic main sequence star with hydrogen fusion glow, smooth plasma surface, soft halo, cinematic lighting, black background, dashboard-ready.'
    },
    {
        id: 'red_giant',
        title: 'Red Giant',
        description: 'An aging star that has run out of hydrogen and expanded its outer layers.',
        color: '#ef4444',
        prompt: '3D red giant star visualization showing expanded outer layers, deep red-orange tones, realistic stellar texture, scientific render, not artistic illustration.'
    },
    {
        id: 'supernova',
        title: 'Supernova',
        description: 'A massive explosion that occurs at the end of a high-mass star’s life.',
        color: '#3b82f6',
        prompt: 'A massive star undergoing a supernova explosion, brilliant expanding shockwave of plasma and gas, intense white-hot core, colorful ejecta clouds spreading into space, visible stellar debris, deep space background filled with stars, realistic astrophysics, NASA-style scientific visualization, ultra-detailed, high contrast, 4K'
    },
    {
        id: 'black_hole',
        title: 'Black Hole',
        description: 'An region of space with gravitational pull so strong that not even light can escape.',
        color: '#000000',
        prompt: '3D black hole visualization with accretion disk and gravitational lensing, realistic physics-inspired lighting, cinematic depth, scientific visualization, not sci-fi art.'
    }
];

// --- Sub-components for Dynamic Imagery ---

const StellarVisual = memo(({ prompt, color, size = 'large' }: { prompt: string, color: string, size?: 'small' | 'large' }) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchImage = async () => {
            try {
                const url = await generateStellarImage(prompt);
                if (isMounted) setImgUrl(url);
            } catch (e) {
                if (isMounted) setError(true);
            }
        };
        fetchImage();
        return () => { isMounted = false; };
    }, [prompt]);

    if (error) return <div className="text-red-500 text-[10px] font-mono">LINK ERROR</div>;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {!imgUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-[0.3em]">Neural Scanning...</span>
                </div>
            )}
            {imgUrl && (
                <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={imgUrl}
                    alt="Stellar Visual"
                    className={`w-full h-full object-contain ${size === 'large' ? 'rounded-full' : ''}`}
                />
            )}
            {size === 'large' && (
                <div
                    className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-1000"
                    style={{
                        boxShadow: `inset 0 0 80px ${color}44, 0 0 60px ${color}22`,
                        opacity: imgUrl ? 1 : 0
                    }}
                />
            )}
        </div>
    );
});

const MasteryMeter = ({ score }: { score: number }) => (
    <div className="w-full mb-8">
        <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold">Domain Synchronization</span>
            </div>
            <span className="text-3xl font-display font-black text-white">{score}%</span>
        </div>
        <div className="h-3 w-full bg-space-900 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className="h-full bg-gradient-to-r from-cyan-600 via-blue-400 to-white rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            />
        </div>
    </div>
);

const QuizModule = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setIsSubmitted(true);
        setShowAnalysis(true);
        setAnsweredQuestions(prev => prev + 1);
        if (isCorrect) setScore(prev => prev + 1);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
            setShowAnalysis(false);
        } else {
            setQuizComplete(true);
        }
    };

    if (quizComplete) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
                    <Brain className="w-32 h-32 text-cyan-400 relative z-10" />
                </div>
                <h3 className="text-4xl font-display font-bold text-white mb-4">ASSESSMENT COMPLETE</h3>
                <p className="text-xl text-gray-400 mb-8">
                    Final Score: <span className="text-cyan-400 font-bold">{score} / {quizQuestions.length}</span>
                </p>
                <button
                    onClick={() => {
                        setQuizComplete(false);
                        setCurrentQuestionIndex(0);
                        setSelectedAnswer(null);
                        setIsSubmitted(false);
                        setShowAnalysis(false);
                        setScore(0);
                        setAnsweredQuestions(0);
                    }}
                    className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
                >
                    RETAKE ASSESSMENT
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6">
            {/* LEFT: Question */}
            <div className="w-1/2 flex flex-col overflow-y-auto pr-4 custom-scrollbar">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                    </div>
                    <div className="text-xs font-mono text-gray-600">ID: Q-{currentQuestion.id.toString().padStart(4, '0')}</div>
                </div>

                <h3 className="text-2xl font-bold text-white leading-relaxed mb-8">{currentQuestion.question}</h3>

                <div className="space-y-4 mb-8">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption = index === currentQuestion.correctAnswer;

                        let borderClass = 'border-white/10';
                        let bgClass = 'bg-black/40';
                        let textClass = 'text-gray-300';

                        if (isSubmitted) {
                            if (isCorrectOption) { borderClass = 'border-green-500'; bgClass = 'bg-green-500/10'; textClass = 'text-green-300'; }
                            else if (isSelected) { borderClass = 'border-red-500'; bgClass = 'bg-red-500/10'; textClass = 'text-red-300'; }
                            else { className: 'opacity-50'; }
                        } else if (isSelected) {
                            borderClass = 'border-cyan-500'; bgClass = 'bg-cyan-500/10'; textClass = 'text-cyan-300';
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => !isSubmitted && setSelectedAnswer(index)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-5 rounded-xl border ${borderClass} ${bgClass} transition-all group relative overflow-hidden`}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <span className={textClass}>{option}</span>
                                    {isSubmitted && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {isSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-500" />}
                                </div>
                                {!isSubmitted && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto">
                    {!isSubmitted ? (
                        <div className="flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={selectedAnswer === null}
                                className={`flex-1 py-4 rounded-xl font-bold tracking-widest uppercase transition-all ${selectedAnswer === null ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-cyan-500 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}
                            >
                                Submit Analysis
                            </button>
                            <button onClick={handleNext} className="px-6 py-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="w-full py-4 rounded-xl font-bold tracking-widest uppercase bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Next Module</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* RIGHT: Analysis Dashboard */}
            <div className="w-1/2 bg-black/20 rounded-2xl border border-white/5 p-6 overflow-y-auto custom-scrollbar relative">
                {!showAnalysis ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                        <Network className="w-24 h-24 text-gray-500 mb-6" />
                        <p className="text-gray-400 font-mono uppercase tracking-widest text-sm">Awaiting Data Input...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} flex items-start gap-4`}>
                            <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className={`text-lg font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{isCorrect ? 'HYPOTHESIS CONFIRMED' : 'ANOMALY DETECTED'}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{isCorrect ? 'Analysis matches established scientific consensus.' : 'Selected theory conflicts with observational data.'}</p>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-space-800/50 p-6 rounded-xl border border-cyan-500/20">
                            <div className="flex items-center gap-2 mb-3 text-cyan-400">
                                <Lightbulb className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Core Concept</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{currentQuestion.multimodalAnalysis.explanation}</p>
                        </div>

                        {/* Analogy */}
                        <div className="bg-space-800/50 p-6 rounded-xl border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-3 text-purple-400">
                                <Brain className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Conceptual Analogy</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-purple-500/30 pl-4">"{currentQuestion.multimodalAnalysis.analogy}"</p>
                        </div>

                        {/* Flowchart */}
                        <div className="bg-space-800/50 p-6 rounded-xl border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-4 text-blue-400">
                                <GitBranch className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Process Logic</span>
                            </div>
                            <div className="space-y-0 relative">
                                <div className="absolute top-2 bottom-6 left-[15px] w-0.5 bg-blue-500/10 -z-10" />
                                {currentQuestion.multimodalAnalysis.flowchartSteps.map((step, i) => (
                                    <div key={i} className="flex gap-4 mb-4 last:mb-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm text-gray-300 py-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Concept Map */}
                        <div className="bg-space-800/50 p-6 rounded-xl border border-green-500/20">
                            <div className="flex items-center gap-2 mb-4 text-green-400">
                                <Network className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Semantic Network</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentQuestion.multimodalAnalysis.conceptMapTags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-900/40 border border-green-500/30 rounded text-xs text-green-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const LearningZone: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'BLUEPRINTS' | 'EVOLUTION' | 'TUTOR' | 'MASTERY'>('MASTERY');
    const [selectedStarStage, setSelectedStarStage] = useState(0);

    // Tutor / Mastery Engine State
    const [tutorSession, setTutorSession] = useState<Chat | null>(null);
    const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<'CORRECT' | 'INCORRECT' | null>(null);
    const [topic, setTopic] = useState('');

    const updateDBSync = async (newScore: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ mastery_score: newScore })
                    .eq('id', user.id);
            }
        } catch (e) {
            console.error("DB Sync failed", e);
        }
    };

    const startSession = async (chosenTopic: string) => {
        setTopic(chosenTopic);
        setLoading(true);
        const session = initTutorSession(chosenTopic);
        setTutorSession(session);
        const response = await sendTutorMessage(session, `Initialize mastery path for: ${chosenTopic}`);
        if (response) setMasteryData(response);
        setLoading(false);
    };

    const handleAnswer = async (index: number) => {
        if (loading || !tutorSession || !masteryData) return;
        setLoading(true);
        const response = await sendTutorMessage(tutorSession, `I choose option ${index}: "${masteryData.content.options![index]}"`);
        if (response) {
            setFeedback(response.is_correct ? 'CORRECT' : 'INCORRECT');

            // Persist progress to Supabase
            if (response.mastery_score !== undefined) {
                updateDBSync(response.mastery_score);
            }

            setTimeout(() => {
                setMasteryData(response);
                setFeedback(null);
                setLoading(false);
            }, 1500);
        } else {
            setLoading(false);
        }
    };

    const handleRemediationChoice = async (mode: string) => {
        if (loading || !tutorSession) return;
        setLoading(true);
        const response = await sendTutorMessage(tutorSession, `I select the ${mode} explanation mode.`);
        if (response) setMasteryData(response);
        setLoading(false);
    };

    const resetEngine = () => {
        setMasteryData(null);
        setTutorSession(null);
        setTopic('');
    };

    return (
        <div className="h-full flex flex-col relative">
            {/* Header Navigation */}
            <div className="flex gap-2 mb-8 border-b border-white/5 pb-4 shrink-0 overflow-x-auto">
                {['MASTERY', 'TUTOR', 'BLUEPRINTS', 'EVOLUTION'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t as any)}
                        className={`text-xs md:text-sm font-display tracking-widest px-6 py-3 rounded-lg border transition-all relative whitespace-nowrap ${activeTab === t ? 'text-cyan-400 bg-cyan-400/5 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'}`}
                    >
                        {t === 'MASTERY' ? 'ADAPTIVE MASTERY' : t === 'TUTOR' ? 'MASTERY ENGINE' : t === 'BLUEPRINTS' ? 'VESSEL BLUEPRINTS' : 'STELLAR EVOLUTION'}
                    </button>
                ))}
            </div>

            {/* Content Display */}
            <div className="flex-1 relative bg-space-800/20 rounded-2xl border border-white/5 p-4 md:p-8 overflow-y-auto custom-scrollbar shadow-inner">
                <AnimatePresence mode="wait">

                    {activeTab === 'MASTERY' && (
                        <motion.div
                            key="mastery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <QuizModule />
                        </motion.div>
                    )}

                    {activeTab === 'TUTOR' && (
                        <motion.div
                            key="tutor"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full flex flex-col max-w-4xl mx-auto"
                        >
                            {!masteryData ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="mb-10 text-center">
                                        <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-mono tracking-widest mb-4">TACTICAL TUTORING SYSTEM V.3.2</div>
                                        <h3 className="text-4xl font-display font-black text-white mb-4">ADAPTIVE MASTERY ENGINE</h3>
                                        <p className="text-gray-400 text-sm max-w-md mx-auto">Select a cosmic domain to initiate neural synchronization and reach 100% mastery.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        {['Orbital Mechanics', 'Stellar Evolution', 'High-Energy Astrophysics', 'Cosmology'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => startSession(t)}
                                                className="group relative p-8 bg-black/40 border border-white/10 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                                </div>
                                                <span className="text-xl font-bold text-white block mb-1">{t}</span>
                                                <span className="text-[10px] text-cyan-500/70 font-mono uppercase tracking-widest">Mastery Path Ready</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full relative">
                                    <MasteryMeter score={masteryData.mastery_score || 0} />

                                    <div className="flex-1">
                                        <AnimatePresence mode="wait">
                                            {/* FEEDBACK OVERLAY */}
                                            {feedback && (
                                                <motion.div
                                                    key="feedback"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 1.2 }}
                                                    className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-space-900/80 backdrop-blur-sm rounded-2xl border border-white/10"
                                                >
                                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-4 ${feedback === 'CORRECT' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                                        {feedback === 'CORRECT' ? '✓' : '!'}
                                                    </div>
                                                    <h4 className={`text-4xl font-display font-black tracking-tighter ${feedback === 'CORRECT' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {feedback === 'CORRECT' ? 'MASTERY INCREASED' : 'REMEDIATION REQUIRED'}
                                                    </h4>
                                                    <p className="text-gray-400 font-mono text-xs mt-2 uppercase tracking-widest">Analyzing Neural Response...</p>
                                                </motion.div>
                                            )}

                                            {/* QUESTION STATE */}
                                            {masteryData.current_state === 'QUESTION' && !feedback && (
                                                <motion.div key="q" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                                                    <div className="bg-white/5 p-8 rounded-2xl border-l-4 border-cyan-400 relative overflow-hidden">
                                                        <div className="absolute top-2 right-4 text-[10px] font-mono text-cyan-500/30 uppercase">Neural Challenge 01</div>
                                                        <h4 className="text-2xl font-bold text-white leading-snug whitespace-pre-wrap">{masteryData.content.text}</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {masteryData.content.options?.map((opt, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => handleAnswer(i)}
                                                                disabled={loading}
                                                                className="group relative p-6 rounded-xl border border-white/10 bg-black/40 text-left transition-all hover:border-cyan-500/50 hover:bg-cyan-500/5 disabled:opacity-50"
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-xs font-mono text-cyan-500 group-hover:border-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                                                                        {String.fromCharCode(65 + i)}
                                                                    </div>
                                                                    <span className="text-gray-200 font-medium group-hover:text-white">{opt}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* REMEDIATION CHOICE STATE */}
                                            {masteryData.current_state === 'REMEDIATION_CHOICE' && !feedback && (
                                                <motion.div key="r" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col h-full justify-center">
                                                    <div className="text-center mb-10">
                                                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                        </div>
                                                        <h3 className="text-3xl font-display font-bold text-white">CONCEPTUAL VOID DETECTED</h3>
                                                        <p className="text-gray-400 mt-3 text-sm max-w-lg mx-auto">Neural pathways for this concept are not yet stable. Select a decryption mode to reinforce the fundamental logic.</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.keys(masteryData.content.explanation_modes || {}).map((mode) => (
                                                            <button
                                                                key={mode}
                                                                onClick={() => handleRemediationChoice(mode)}
                                                                className="p-6 bg-black/40 border border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
                                                            >
                                                                <h5 className="font-display font-bold text-purple-400 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{mode.replace('_', ' ')}</h5>
                                                                <p className="text-[11px] text-gray-500 leading-tight">Reinforce understanding via tactical {mode} analysis.</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* EXPLANATION STATE */}
                                            {masteryData.current_state === 'EXPLANATION' && !feedback && (
                                                <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex flex-col h-full justify-center">
                                                    <div className="bg-purple-900/5 p-10 rounded-3xl border border-purple-500/20 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-8 opacity-5"><svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg></div>
                                                        <div className="text-[10px] font-mono text-purple-500 uppercase tracking-widest mb-6 font-bold flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                            Tactical Insight Decrypted
                                                        </div>
                                                        <p className="text-2xl text-white leading-relaxed font-light italic whitespace-pre-wrap">
                                                            {masteryData.content.text}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemediationChoice('PROCEED')}
                                                        className="w-full py-5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600 hover:to-blue-600 border border-white/10 text-white font-display font-bold rounded-xl tracking-[0.3em] transition-all uppercase shadow-lg group"
                                                    >
                                                        <span className="relative z-10">Initiate Mirror Verification</span>
                                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                </motion.div>
                                            )}

                                            {/* CELEBRATION STATE */}
                                            {masteryData.current_state === 'MASTERY_CELEBRATION' && (
                                                <motion.div key="c" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
                                                    <div className="mb-8 relative inline-block">
                                                        <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
                                                        <h2 className="text-8xl font-display font-black text-white relative z-10 tracking-tighter">100%</h2>
                                                    </div>
                                                    <h3 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-600 mb-4">DOMAIN MASTERED</h3>
                                                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">Deep space domain knowledge for "{topic}" has been fully synchronized with your profile.</p>
                                                    <button
                                                        onClick={resetEngine}
                                                        className="px-12 py-4 bg-white text-black font-display font-bold rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                                    >
                                                        NEW MISSION OBJECTIVE
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {loading && !feedback && (
                                        <div className="absolute bottom-0 inset-x-0 flex justify-center items-center gap-4 py-4">
                                            <div className="flex gap-1.5">
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-[9px] font-mono text-cyan-600 tracking-[0.4em] uppercase font-bold">Uplinking Neural Data</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'BLUEPRINTS' && (
                        <motion.div key="blueprints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full py-4">
                            <PropulsionLab />
                        </motion.div>
                    )}

                    {activeTab === 'EVOLUTION' && (
                        <motion.div key="evolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 h-full">
                            <div className="flex justify-between w-full max-w-4xl mb-16 relative shrink-0">
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 -z-10" />
                                {STAR_STAGES.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStarStage(i)}
                                        className={`relative z-10 w-16 h-16 rounded-full border-2 transition-all flex items-center justify-center bg-space-900 overflow-hidden ${i === selectedStarStage ? 'border-white scale-110 shadow-[0_0_20px_white]' : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'}`}
                                    >
                                        <StellarVisual prompt={s.prompt} color={s.color} size="small" />
                                        {i === selectedStarStage && (
                                            <motion.div layoutId="star-active-glow" className="absolute inset-[-4px] rounded-full border border-white/40 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row items-center gap-12 bg-black/40 p-12 rounded-[3rem] w-full max-w-6xl border border-white/5 flex-1 min-h-0">
                                <div className="w-80 h-80 shrink-0 relative">
                                    <StellarVisual
                                        key={STAR_STAGES[selectedStarStage].id}
                                        prompt={STAR_STAGES[selectedStarStage].prompt}
                                        color={STAR_STAGES[selectedStarStage].color}
                                        size="large"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar h-full pr-4">
                                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] block mb-2">Stage {selectedStarStage + 1} of 6</span>
                                    <h3 className="text-6xl font-display font-black text-white mb-6 tracking-tighter uppercase">{STAR_STAGES[selectedStarStage].title}</h3>
                                    <p className="text-xl text-gray-400 font-light leading-relaxed mb-8">{STAR_STAGES[selectedStarStage].description}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Spectral Class</span>
                                            <span className="text-lg font-display text-white font-bold">ST-4299-X</span>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Primary Composition</span>
                                            <span className="text-lg font-display text-white font-bold">Hydrogen / Helium</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LearningZone;