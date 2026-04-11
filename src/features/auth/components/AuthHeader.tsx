import Image from "next/image";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="w-16 h-16 bg-elevated rounded-2xl flex items-center justify-center border border-border-subtle shadow-sm mb-6 rotate-3 overflow-hidden">
        <Image
          src="/favicon-circular.ico"
          alt="دليل السويس"
          width={48}
          height={48}
          className="w-12 h-12 object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight text-center">
        {title}
      </h1>
      <p className="text-text-muted font-medium text-sm text-center">
        {subtitle}
      </p>
    </div>
  );
}
