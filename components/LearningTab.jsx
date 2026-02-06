import React, { useState } from 'react';
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

// ===================================
// MAIN LEARNING TAB COMPONENT
// ===================================

const LearningTab = () => {
    const [activeSection, setActiveSection] = useState('menu'); // 'menu' or 'adaptive-mastery'
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState(0);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

    // Handle starting the Adaptive Mastery quiz
    const startAdaptiveMastery = () => {
        setActiveSection('adaptive-mastery');
        resetQuiz();
    };

    // Handle exiting quiz back to menu
    const exitQuiz = () => {
        setActiveSection('menu');
        resetQuiz();
    };

    // Reset quiz state
    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setShowAnalysis(false);
        setScore(0);
        setAnsweredQuestions(0);
    };

    // Handle answer submission
    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setIsSubmitted(true);
        setShowAnalysis(true);
        setAnsweredQuestions(prev => prev + 1);

        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    // Handle skip question
    const handleSkip = () => {
        setAnsweredQuestions(prev => prev + 1);
        goToNextQuestion();
    };

    // Move to next question
    const goToNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
            setShowAnalysis(false);
        } else {
            // Quiz completed
            alert(`Quiz Complete! Score: ${score + (isCorrect ? 1 : 0)}/${quizQuestions.length}`);
            exitQuiz();
        }
    };

    // ===================================
    // RENDER: MAIN MENU (3 CARDS)
    // ===================================

    if (activeSection === 'menu') {
        return (
            <div className="w-full h-full bg-[#0B0D17] text-white overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                            LEARNING CENTER
                        </h1>
                        <p className="text-gray-400">Master the cosmos through adaptive learning and exploration</p>
                    </div>

                    {/* Three Main Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* 1. ADAPTIVE MASTERY - Interactive */}
                        <button
                            onClick={startAdaptiveMastery}
                            className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 text-left"
                        >
                            <div className="absolute top-4 right-4">
                                <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </div>

                            <Brain className="w-12 h-12 text-cyan-400 mb-4" />

                            <h3 className="text-2xl font-bold text-white mb-2">
                                Adaptive Mastery
                            </h3>

                            <p className="text-gray-400 text-sm mb-4">
                                AI-powered quiz system with multimodal explanations. Master complex concepts through interactive learning.
                            </p>

                            <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                                <span>Start Learning</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* 2. VESSEL BLUEPRINTS - Placeholder */}
                        <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 opacity-60 cursor-not-allowed">
                            <div className="absolute top-4 right-4">
                                <div className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                                    Coming Soon
                                </div>
                            </div>

                            <Rocket className="w-12 h-12 text-purple-400 mb-4" />

                            <h3 className="text-2xl font-bold text-white mb-2">
                                Vessel Blueprints
                            </h3>

                            <p className="text-gray-400 text-sm">
                                Explore spacecraft designs, propulsion systems, and engineering marvels of space exploration.
                            </p>
                        </div>

                        {/* 3. STELLAR EVOLUTIONS - Placeholder */}
                        <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 opacity-60 cursor-not-allowed">
                            <div className="absolute top-4 right-4">
                                <div className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300">
                                    Coming Soon
                                </div>
                            </div>

                            <Stars className="w-12 h-12 text-orange-400 mb-4" />

                            <h3 className="text-2xl font-bold text-white mb-2">
                                Stellar Evolutions
                            </h3>

                            <p className="text-gray-400 text-sm">
                                Journey through the lifecycle of stars, from nebula formation to supernova explosions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ===================================
    // RENDER: ADAPTIVE MASTERY QUIZ INTERFACE
    // ===================================

    return (
        <div className="w-full h-full bg-[#0B0D17] text-white overflow-hidden flex flex-col">
            {/* Top Bar with Exit Button */}
            <div className="bg-[#0B0D17]/95 backdrop-blur-sm border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-xl font-bold text-cyan-300">Adaptive Mastery</h2>
                    <div className="ml-4 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm">
                        Question {currentQuestionIndex + 1} / {quizQuestions.length}
                    </div>
                </div>

                <button
                    onClick={exitQuiz}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                    <span>Exit Quiz</span>
                </button>
            </div>

            {/* Main Quiz Content - Split Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT SIDE: Question & Options */}
                <div className="w-1/2 border-r border-cyan-500/20 p-8 overflow-y-auto">
                    {/* Question */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm text-gray-400 uppercase tracking-wider">Question</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-white leading-relaxed">
                            {currentQuestion.question}
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-4 mb-8">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrectOption = index === currentQuestion.correctAnswer;
                            const showCorrectness = isSubmitted;

                            return (
                                <button
                                    key={index}
                                    onClick={() => !isSubmitted && setSelectedAnswer(index)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSubmitted
                                            ? isCorrectOption
                                                ? 'border-green-500 bg-green-500/10'
                                                : isSelected
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'border-gray-700 bg-gray-800/30 opacity-50'
                                            : isSelected
                                                ? 'border-cyan-400 bg-cyan-500/10'
                                                : 'border-gray-700 bg-gray-800/30 hover:border-cyan-500/50'
                                        } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white">{option}</span>
                                        {showCorrectness && isCorrectOption && (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        )}
                                        {showCorrectness && isSelected && !isCorrectOption && (
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {!isSubmitted ? (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswer === null}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${selectedAnswer === null
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                                        }`}
                                >
                                    Submit Answer
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="px-6 py-3 border border-gray-600 rounded-lg hover:border-cyan-500/50 transition-colors flex items-center gap-2"
                                >
                                    <SkipForward className="w-4 h-4" />
                                    Skip
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={goToNextQuestion}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <span>Next Question</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Score Display */}
                    <div className="mt-6 p-4 bg-white/5 border border-cyan-500/20 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Current Score:</span>
                            <span className="text-cyan-300 font-semibold">{score} / {answeredQuestions}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Multimodal Analysis Dashboard */}
                <div className="w-1/2 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-8 overflow-y-auto">
                    {!showAnalysis ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    Submit your answer to view the multimodal analysis
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Result Badge */}
                            <div className={`p-4 rounded-lg border-2 ${isCorrect
                                    ? 'bg-green-500/10 border-green-500'
                                    : 'bg-red-500/10 border-red-500'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {isCorrect ? (
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-red-400" />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h3>
                                        <p className="text-sm text-gray-300">
                                            {isCorrect
                                                ? 'Excellent work! Review the analysis below.'
                                                : 'Let\'s learn from this. Review the explanation.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 1. EXPLANATION */}
                            <div className="bg-white/5 border border-cyan-500/30 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="w-5 h-5 text-cyan-400" />
                                    <h4 className="text-lg font-bold text-cyan-300">Explanation</h4>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    {currentQuestion.multimodalAnalysis.explanation}
                                </p>
                            </div>

                            {/* 2. ANALOGY */}
                            <div className="bg-white/5 border border-purple-500/30 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                    <h4 className="text-lg font-bold text-purple-300">Real-World Analogy</h4>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm italic">
                                    {currentQuestion.multimodalAnalysis.analogy}
                                </p>
                            </div>

                            {/* 3. FLOWCHART */}
                            <div className="bg-white/5 border border-blue-500/30 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <GitBranch className="w-5 h-5 text-blue-400" />
                                    <h4 className="text-lg font-bold text-blue-300">Process Flowchart</h4>
                                </div>
                                <div className="space-y-3">
                                    {currentQuestion.multimodalAnalysis.flowchartSteps.map((step, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 border border-blue-500 rounded-full flex items-center justify-center text-sm font-bold text-blue-300">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-300 text-sm">{step}</p>
                                                {index < currentQuestion.multimodalAnalysis.flowchartSteps.length - 1 && (
                                                    <div className="ml-4 mt-2 mb-1 w-0.5 h-4 bg-blue-500/30"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. CONCEPT MAP */}
                            <div className="bg-white/5 border border-green-500/30 rounded-lg p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Network className="w-5 h-5 text-green-400" />
                                    <h4 className="text-lg font-bold text-green-300">Related Concepts</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentQuestion.multimodalAnalysis.conceptMapTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearningTab;
