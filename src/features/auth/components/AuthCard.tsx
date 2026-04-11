interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[440px] px-2 md:px-4 py-8 md:py-12">
      <div className="bg-surface/90 backdrop-blur-xl p-5 md:p-10 rounded-3xl md:rounded-4xl border border-border-subtle shadow-2xl relative overflow-hidden flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
