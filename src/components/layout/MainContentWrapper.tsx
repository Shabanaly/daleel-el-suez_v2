
export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 min-w-0">
            {children}
        </main>
    );
}
