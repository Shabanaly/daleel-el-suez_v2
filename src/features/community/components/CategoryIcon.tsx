import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    // Emojis (Fallback for existing DB data)
    '📰': Icons.Newspaper,
    '🔧': Icons.Wrench,
    '💼': Icons.Briefcase,
    '❓': Icons.HelpCircle,
    '💬': Icons.MessageSquare,

    // Lucide Names (For future-proof DB data)
    'Newspaper': Icons.Newspaper,
    'Wrench': Icons.Wrench,
    'Briefcase': Icons.Briefcase,
    'HelpCircle': Icons.HelpCircle,
    'MessageSquare': Icons.MessageSquare,
    'LayoutGrid': Icons.LayoutGrid,
    'Layers': Icons.Layers,
    'All': Icons.LayoutGrid
};

interface CategoryIconProps extends LucideProps {
    name: string;
}

export default function CategoryIcon({ name, ...props }: CategoryIconProps) {
    // Try to find in map first
    let IconComponent = iconMap[name];

    // If not in map, check if it's a direct Lucide name string
    if (!IconComponent) {
        IconComponent = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
    }

    // Fallback to LayoutGrid if nothing found
    if (!IconComponent) {
        IconComponent = Icons.LayoutGrid;
    }

    return <IconComponent {...props} />;
}
