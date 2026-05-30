export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // Fetch all sessions for this user
  const { data: sessions, error: sessionsError } = await supabase
    .from('generation_sessions')
    .select('id, title, created_at, business_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessionsError) {
    console.error('Fetch sessions error:', sessionsError);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ sessions: [] });
  }

  // Get unique business IDs
  const businessIds = [...new Set(sessions.map(s => s.business_id).filter(Boolean))];

  // Fetch all business data, ICPs, pillars, customizations, styles, and contents for these businesses
  const [
    { data: businesses },
    { data: icps },
    { data: pillars },
    { data: customizations },
    { data: businessStyles },
    { data: contents },
  ] = await Promise.all([
    supabase.from('businesses').select('id, business_name, industry_niche, target_market, product_service, business_goals, unique_selling_points, reason').in('id', businessIds),
    supabase.from('icps').select('id, name, title, demographics, pain_points, goals, online_platforms, business_id').in('business_id', businessIds),
    supabase.from('content_pillars').select('id, name, description, topics, business_id').in('business_id', businessIds),
    supabase.from('customisation_answers').select('brand_personality, audience_emotion, communication_style, unique_perspective, target_age_range, business_id').in('business_id', businessIds),
    supabase.from('business_styles').select('business_id, style_id').in('business_id', businessIds),
    supabase.from('generated_contents').select('id, business_id, hook, body, cta, version, creator_style_id, generation_group').in('business_id', businessIds).order('generation_group', { ascending: false }).order('version', { ascending: true }),
  ]);

  // Resolve all style IDs
  const allStyleIds = [...new Set((businessStyles || []).map((bs: any) => bs.style_id).filter(Boolean))];
  const { data: styleDetails } = await supabase.from('creator_styles').select('*').in('id', allStyleIds);
  const styleMap = new Map((styleDetails || []).map((s: any) => [s.id, s]));

  // Build a map of business_id -> business data
  const businessMap = new Map((businesses || []).map((b: any) => [b.id, b]));
  const icpMap = new Map((icps || []).map((i: any) => [i.business_id, i]));
  const pillarsMap = new Map<string, any[]>();
  (pillars || []).forEach((p: any) => {
    if (!pillarsMap.has(p.business_id)) pillarsMap.set(p.business_id, []);
    pillarsMap.get(p.business_id)!.push(p);
  });
  const customizationMap = new Map((customizations || []).map((c: any) => [c.business_id, c]));
  const stylesMap = new Map<string, any[]>();
  (businessStyles || []).forEach((bs: any) => {
    if (!stylesMap.has(bs.business_id)) stylesMap.set(bs.business_id, []);
    stylesMap.get(bs.business_id)!.push(bs);
  });
  const contentsMap = new Map<string, any[]>();
  (contents || []).forEach((c: any) => {
    if (!contentsMap.has(c.business_id)) contentsMap.set(c.business_id, []);
    contentsMap.get(c.business_id)!.push(c);
  });

  // Build the full response per session
  const sessionsWithData = sessions.map((session: any) => {
    const bizId = session.business_id;
    const biz = businessMap.get(bizId);
    const icp = icpMap.get(bizId);
    const businessPillars = pillarsMap.get(bizId) || [];
    const customization = customizationMap.get(bizId);
    const bsList = stylesMap.get(bizId) || [];
    const contentList = contentsMap.get(bizId) || [];

    const resolvedStyles = bsList
      .map((bs: any) => styleMap.get(bs.style_id))
      .filter(Boolean);

    return {
      session: {
        id: session.id,
        title: session.title,
        created_at: session.created_at,
      },
      businessData: biz ? {
        businessName: biz.business_name,
        industryNiche: biz.industry_niche,
        targetMarket: biz.target_market,
        productService: biz.product_service,
        businessGoals: biz.business_goals,
        uniqueSellingPoints: biz.unique_selling_points,
        reason: biz.reason ?? '',
      } : null,
      selectedICP: icp ? {
        id: icp.id,
        name: icp.name,
        title: icp.title,
        demographics: icp.demographics,
        painPoints: icp.pain_points,
        goals: icp.goals,
        onlinePlatforms: icp.online_platforms,
      } : null,
      pillars: businessPillars.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        topics: p.topics || [],
      })),
      customizationAnswers: customization ? {
        brandPersonality: customization.brand_personality,
        audienceEmotion: customization.audience_emotion,
        communicationStyle: customization.communication_style,
        uniquePerspective: customization.unique_perspective,
        targetAgeRange: customization.target_age_range || undefined,
      } : null,
      selectedStyles: resolvedStyles,
      generatedContent: contentList.map((c: any) => ({
        id: c.id,
        hook: c.hook,
        body: c.body,
        cta: c.cta,
        version: c.version,
        creator_style_id: c.creator_style_id,
        generationGroup: c.generation_group ?? 1,
      })),
    };
  });

  return NextResponse.json({ sessions: sessionsWithData });
}
