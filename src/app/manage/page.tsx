import { createClient } from '@/lib/supabase/server';
import { getOwnedPlaces } from '@/lib/actions/business';
import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ManageBusinessesClient } from './_components/ManageBusinessesClient';

export const metadata = {
    title: 'إدارة أعمالي - دليل السويس',
};

export default async function ManagePage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Fetch owned places
    const placesRes = await getOwnedPlaces();
    const places = placesRes.success ? (placesRes.places || []) : [];

    return (
        <ManageBusinessesClient places={places} />
    );
}
