'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { WizardProvider, useWizard } from '@/context/WizardContext';
import LogoutButton from '@/app/dashboard/LogoutButton';
import StepIndicator from '@/components/StepIndicator';
import BusinessForm from '@/components/BusinessForm';
import ICPSelection from '@/components/ICPSelection';
import ContentPillars from '@/components/ContentPillars';
import CustomizeQuestions from '@/components/CustomizeQuestions';
import CreatorStylePicker from '@/components/CreatorStylePicker';
import ContentEditor from '@/components/ContentEditor';

function WizardContent() {
  const { state } = useWizard();

  const stepComponents: Record<number, React.ReactNode> = {
    2: <BusinessForm />,
    3: <ICPSelection />,
    4: <ContentPillars />,
    5: <CustomizeQuestions />,
    6: <CreatorStylePicker />,
    7: <ContentEditor />,
  };

  useEffect(() => {
    const setElementStyles = (el: Element, styles: Record<string, string>) => {
      const htmlElement = el as HTMLElement;
      Object.entries(styles).forEach(([key, value]) => {
        htmlElement.style.setProperty(key, value);
      });
    };
    const orbs = document.querySelectorAll('.floating-orb');
    orbs.forEach((orb) => setElementStyles(orb, { position: 'absolute' }));
    const container = document.querySelector('.relative.z-10.mx-auto.mt-20.max-w-6xl.px-6');
    if (container) {
      setElementStyles(container, { marginTop: '2rem' });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none floating-orb slow -left-14 top-24 h-64 w-64" />
      <div className="pointer-events-none floating-orb -right-20 top-36 h-72 w-72" />
      <div className="pointer-events-none floating-orb fast left-[36%] -top-10 h-28 w-28" />
      <div className="pointer-events-none floating-orb slow right-[24%] bottom-12 h-24 w-24" />
      <div className="pointer-events-none floating-orb fast left-[18%] bottom-2 h-36 w-36" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-purple-200/30 bg-gradient-to-r from-white/40 via-purple-50/30 to-white/40 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-300/40 bg-gradient-to-br from-purple-200/30 to-blue-200/30 shadow-lg shadow-purple-200/20">
              <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">B</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gradient">Brand Bhava</h1>
              <p className="text-xs text-slate-500/80">Premium LinkedIn Content Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-purple-300/30 bg-purple-100/40 px-3 py-1 text-xs font-medium text-purple-700 md:block">
              Production Workspace
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="relative z-10 mx-auto mt-20 max-w-6xl px-6">
        <div className="premium-glass rounded-2xl px-4 md:px-8">
          <StepIndicator />
        </div>
      </div>

      {/* Step Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8">
        <section className="premium-glass rounded-3xl p-6 md:p-10">
          {stepComponents[state.currentStep] || <BusinessForm />}
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
