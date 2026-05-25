'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, LayoutDashboard, Users, Receipt, Utensils, Activity, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

interface TourStep {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    highlightSelector?: string;
    image?: string;
    targetPath?: string;
    tip: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        title: "Welcome to HostelCare",
        description: "Your all-in-one premium multi-tenant Hostel Management System. Track students, coordinate branches, record expenses, plan meals, and monitor live audit trails effortlessly.",
        icon: Sparkles,
        color: "from-blue-500 to-indigo-500 text-blue-500",
        image: "/guide_welcome.png",
        tip: "👋 Let's take a quick 1-minute visual tour to see exactly how to navigate and manage your hostel."
    },
    {
        title: "Dynamic Branch Selector",
        description: "Switch between branches instantly! Located at the top right of your screen, this selector toggles all metrics, students, and financial reports context-wide.",
        icon: LayoutDashboard,
        color: "from-emerald-500 to-teal-500 text-emerald-500",
        highlightSelector: ".branch-selector-trigger",
        image: "/guide_branches.png",
        tip: "💡 Click this dropdown to toggle branch filters, or create a brand new branch for your hostel chain!"
    },
    {
        title: "Resident & Student Directory",
        description: "Easily manage resident check-ins, monthly rents, outstanding dues, and cash collections. You can also import bulk data instantly using our spreadsheet drag-and-drop tool.",
        icon: Users,
        color: "from-violet-500 to-purple-500 text-violet-500",
        highlightSelector: "#sidebar-nav-students",
        image: "/guide_students.png",
        targetPath: "/students",
        tip: "👉 Click 'Students' in the sidebar, then click '+ Add Student' or select 'Excel Uploader' for bulk CSV imports."
    },
    {
        title: "Operational Expenses",
        description: "Log daily operational expenses, utility bills, maintenance charges, and groceries. Categorise outflows in real-time under custom categories to maintain profit margins.",
        icon: Receipt,
        color: "from-rose-500 to-orange-500 text-rose-500",
        highlightSelector: "#sidebar-nav-expenses",
        image: "/guide_expenses.png",
        targetPath: "/expenses",
        tip: "👉 Click 'Expenses' in the sidebar, then select 'Log New Expense' and assign it under custom categories."
    },
    {
        title: "Weekly Mess & Food Planner",
        description: "Plan nutritious meals for Breakfast, Lunch, Tea, and Dinner. Switch on the 'Student View' to publish the live menu to students on their own devices.",
        icon: Utensils,
        color: "from-amber-500 to-yellow-500 text-amber-500",
        highlightSelector: "#sidebar-nav-food",
        image: "/guide_food.png",
        targetPath: "/food",
        tip: "👉 Click 'Food Menu' in the sidebar to design your menu, customize recipes, and save weekly food schedules."
    },
    {
        title: "Activity Audit Logs",
        description: "Total administrative transparency! Every resident added, payment processed, or branch created records a detailed state-change diff logged in real-time.",
        icon: Activity,
        color: "from-fuchsia-500 to-pink-500 text-fuchsia-500",
        highlightSelector: "#sidebar-nav-activity",
        image: "/guide_welcome.png",
        targetPath: "/activity",
        tip: "👉 Click 'Activity' in the sidebar to inspect all historical edits, performed administrative tasks, and audit logs."
    }
];

export default function OnboardingTour() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    // Track active spotlight bounds
    useEffect(() => {
        if (!isOpen) {
            setHighlightRect(null);
            return;
        }

        const activeStep = TOUR_STEPS[currentStep];
        if (!activeStep?.highlightSelector) {
            setHighlightRect(null);
            return;
        }

        const updateHighlight = () => {
            const el = document.querySelector(activeStep.highlightSelector!);
            if (el) {
                setHighlightRect(el.getBoundingClientRect());
            } else {
                setHighlightRect(null);
            }
        };

        // Measure immediately
        updateHighlight();

        // Attach listeners for window resize/scroll to keep spotlight locked in place
        window.addEventListener('resize', updateHighlight);
        window.addEventListener('scroll', updateHighlight);

        // Keep polling slightly since page navigation transitions might shift layouts
        const interval = setInterval(updateHighlight, 300);

        return () => {
            window.removeEventListener('resize', updateHighlight);
            window.removeEventListener('scroll', updateHighlight);
            clearInterval(interval);
        };
    }, [isOpen, currentStep, pathname]);

    // Auto-start for first-time login users
    useEffect(() => {
        const tourCompleted = localStorage.getItem('hostelcare_tour_completed');
        if (!tourCompleted) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // Custom Event Listener to launch tour from anywhere (e.g. Sidebar Quick Guide)
    useEffect(() => {
        const handleStartTour = () => {
            setCurrentStep(0);
            setIsOpen(true);
        };
        window.addEventListener('hostelcare:start-tour', handleStartTour);
        return () => window.removeEventListener('hostelcare:start-tour', handleStartTour);
    }, []);

    const activeStep = TOUR_STEPS[currentStep];
    const StepIcon = activeStep?.icon || Sparkles;

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            const nextStep = TOUR_STEPS[currentStep + 1];
            // Auto navigate to correct tab path if specified to show it in action
            if (nextStep.targetPath && pathname !== nextStep.targetPath) {
                router.push(nextStep.targetPath);
            }
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            const prevStep = TOUR_STEPS[currentStep - 1];
            if (prevStep.targetPath && pathname !== prevStep.targetPath) {
                router.push(prevStep.targetPath);
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('hostelcare_tour_completed', 'true');
        setIsOpen(false);
    };

    return (
        <>
            {/* CSS Animation Keyframes for Click Cursor Simulation & Glowing spotlight */}
            <style jsx global>{`
                @keyframes hostelcare-click {
                    0% { transform: translate(0, 0) scale(1); }
                    40% { transform: translate(-8px, -8px) scale(1); }
                    50% { transform: translate(-8px, -8px) scale(0.8); }
                    60% { transform: translate(-8px, -8px) scale(1); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                .cursor-sim-animate {
                    animation: hostelcare-click 2s infinite ease-in-out;
                }
            `}</style>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden pointer-events-none">
                        
                        {/* 1. Frosted Backdrop Mask with Cutout Spotlight via Box-Shadow */}
                        {highlightRect ? (
                            <div 
                                className="fixed z-40 border-[3px] border-blue-500/80 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 pointer-events-auto"
                                style={{
                                    top: highlightRect.top - 6,
                                    left: highlightRect.left - 6,
                                    width: highlightRect.width + 12,
                                    height: highlightRect.height + 12,
                                    boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.65)',
                                }}
                            >
                                {/* Animated Cursor Click Pointer Hand inside spotlight */}
                                <div className="absolute -bottom-8 -right-6 z-50 cursor-sim-animate pointer-events-none">
                                    <svg 
                                        className="w-10 h-10 text-white fill-blue-500 stroke-zinc-950 stroke-[1.5] filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74l.3-.1a2.49 2.49 0 0 1 3.2 3.2l-4.5 4.5a3.5 3.5 0 0 1-4.95 0l-2.5-2.5a1.5 1.5 0 0 1 2.12-2.12l1.03 1.03.3-.3v-3.71z" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleComplete}
                                className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm z-40 pointer-events-auto"
                            />
                        )}

                        {/* 2. Premium Tour Dialog Card */}
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 15 }}
                            transition={{ type: "spring", damping: 25, stiffness: 240 }}
                            className="relative w-full max-w-lg z-50 pointer-events-auto"
                        >
                            <Card className="overflow-hidden border border-white/20 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl rounded-3xl">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                                            <HelpCircle className="w-4 h-4 text-blue-500" />
                                            <span>HostelCare Quick Guide</span>
                                        </div>
                                        <button 
                                            onClick={handleComplete}
                                            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" />
                                        </button>
                                    </div>

                                    {/* Body with Image Crop Fix & Content Transitions */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentStep}
                                            initial={{ x: 12, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -12, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-5 min-h-[24rem] flex flex-col justify-center text-center items-center"
                                        >
                                            {/* Visual Illustration - Crop Fixed with object-contain */}
                                            {activeStep.image && (
                                                <div className="w-full h-48 md:h-52 overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center p-2 relative group">
                                                    <img 
                                                        src={activeStep.image} 
                                                        alt={activeStep.title}
                                                        className="w-full h-full object-contain transition-transform duration-500 hover:scale-102"
                                                    />
                                                </div>
                                            )}

                                            {/* Icon Wrapper */}
                                            <div className={cn(
                                                "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-tr shadow-md shrink-0",
                                                activeStep.color.split(' ')[0],
                                                activeStep.color.split(' ')[1]
                                            )}>
                                                <StepIcon className="w-5 h-5 text-white" />
                                            </div>

                                            {/* Title & Desc */}
                                            <div className="space-y-2">
                                                <h3 className="text-lg md:text-xl font-bold text-zinc-950 dark:text-zinc-50">
                                                    {activeStep.title}
                                                </h3>
                                                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                                                    {activeStep.description}
                                                </p>
                                            </div>

                                            {/* Actionable visual tip panel */}
                                            <div className="w-full p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-950/20 text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed max-w-md">
                                                {activeStep.tip}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Footer & Progress Controls */}
                                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
                                        {/* Step Dots Indicator */}
                                        <div className="flex gap-2">
                                            {TOUR_STEPS.map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={cn(
                                                        "h-1.5 rounded-full transition-all duration-300",
                                                        i === currentStep 
                                                            ? "w-5 bg-blue-500" 
                                                            : "w-1.5 bg-zinc-200 dark:bg-zinc-800"
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex gap-2">
                                            {currentStep > 0 && (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={handleBack}
                                                    className="rounded-xl flex items-center gap-1 text-zinc-600 dark:text-zinc-400 text-xs"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                    Back
                                                </Button>
                                            )}
                                            <Button 
                                                onClick={handleNext}
                                                className="rounded-xl flex items-center gap-1 bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-md font-medium text-xs py-2 px-4"
                                            >
                                                {currentStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}
                                                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
