'use client';

interface MarketStepIndicatorProps {
    currentStep: number;
}

const steps = [
    { id: 1, label: 'بيانات أساسية' },
    { id: 2, label: 'السعر والتواصل' },
    { id: 3, label: 'صور الإعلان' },
];

export function MarketStepIndicator({ currentStep }: MarketStepIndicatorProps) {
    return (
        <div className="mb-10 md:mb-14 relative w-full px-4">
            {/* Container for the progress line */}
            <div className="absolute top-4 md:top-5 right-[16.66%] left-[16.66%] h-[2px] bg-border-subtle/60 z-0" />

            {/* Active progress line layer */}
            <div
                className="absolute top-4 md:top-5 right-[16.66%] h-[2px] bg-primary z-0 transition-all duration-500 ease-in-out"
                style={{
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : '66.66%'
                }}
            />

            <div className="relative z-10 flex items-center justify-between">
                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className="relative flex items-center justify-center">
                                <div
                                    className={`
                                        w-8 h-8 md:w-10 md:h-10
                                        flex items-center justify-center
                                        rounded-full text-xs md:text-sm font-black
                                        transition-all duration-500 relative z-20 border-2
                                        ${isActive
                                            ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30'
                                            : isCompleted
                                                ? 'bg-primary border-primary text-white'
                                                : 'bg-background border-border-subtle text-text-muted/40'}
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>
                            </div>

                            <span
                                className={`
                                    mt-3 text-[10px] md:text-xs font-black tracking-tight text-center px-1
                                    transition-colors duration-300
                                    ${isActive ? 'text-primary' : 'text-text-muted/50'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
