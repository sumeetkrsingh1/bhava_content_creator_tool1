import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { BusinessData, ICP, ContentPillar, CustomizationAnswers, CreatorStyle, GeneratedContent } from '@/types';

type BusinessStyleRow = {
  style_id: string;
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // Fetch session meta including title maybe stored in generation_sessions
  const { data: session, error: sessionError } = await supabase
    .from('generation_sessions')
    .select('id, title, business_id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (sessionError || !session) {
    console.error('Session lookup error:', sessionError);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const businessId = session.business_id;

  // Fetch related data
  const [{ data: businessData }, { data: icpData }, { data: pillars }, { data: customization }, { data: styles }, { data: contents }] = await Promise.all([
    supabase.from('businesses').select('business_name, industry_niche, target_market, product_service, business_goals, unique_selling_points').eq('id', businessId).single(),
    supabase.from('icps').select('id, name, title, demographics, pain_points, goals, online_platforms, business_id').eq('business_id', businessId).maybeSingle(),
    supabase.from('content_pillars').select('id, name, description, topics').eq('business_id', businessId),
    supabase.from('customisation_answers').select('brand_personality, audience_emotion, communication_style, unique_perspective').eq('business_id', businessId).maybeSingle(),
    supabase.from('business_styles').select('style_id').eq('business_id', businessId),
    supabase.from('generated_contents').select('id, hook, body, cta, version, creator_style_id').eq('business_id', businessId),
  ]);

  // Resolve styles
  const styleIds = ((styles || []) as BusinessStyleRow[]).map((s) => s.style_id);
  const { data: styleDetails } = await supabase.from('creator_styles').select('*').in('id', styleIds);

  const response = {
    businessData: businessData ? {
      businessName: businessData.business_name,
      industryNiche: businessData.industry_niche,
      targetMarket: businessData.target_market,
      productService: businessData.product_service,
      businessGoals: businessData.business_goals,
      uniqueSellingPoints: businessData.unique_selling_points,
    } as BusinessData : null,
    selectedICP: icpData ? {
      id: icpData.id,
      name: icpData.name,
      title: icpData.title,
      demographics: icpData.demographics,
      painPoints: icpData.pain_points,
      goals: icpData.goals,
      onlinePlatforms: icpData.online_platforms,
    } as ICP : null,
    pillars: pillars as ContentPillar[],
    customizationAnswers: customization as CustomizationAnswers | null,
    selectedStyles: styleDetails as CreatorStyle[],
    generatedContent: contents as GeneratedContent[],
  };

  return NextResponse.json(response);
}
