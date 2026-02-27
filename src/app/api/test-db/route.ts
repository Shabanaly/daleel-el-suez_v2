import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = createAdminClient()

        // اختبار الاتصال - جلب الأحياء
        const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('*')
            .order('id')

        if (districtsError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'خطأ في الاتصال بقاعدة البيانات',
                    error: districtsError.message,
                    hint: 'تأكد من تنفيذ ملف supabase/schema.sql في Supabase Dashboard'
                },
                { status: 500 }
            )
        }

        // جلب المناطق مع أحيائها
        const { data: areas } = await supabase
            .from('areas')
            .select('*, districts(name)')
            .order('district_id')

        // جلب التصنيفات
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .order('type')

        return NextResponse.json({
            success: true,
            message: '✅ الاتصال بقاعدة البيانات نجح!',
            data: {
                districts_count: districts?.length ?? 0,
                areas_count: areas?.length ?? 0,
                categories_count: categories?.length ?? 0,
                districts,
                areas,
                categories,
            }
        })
    } catch (err) {
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        )
    }
}
