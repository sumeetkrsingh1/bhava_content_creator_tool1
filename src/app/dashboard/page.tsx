'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { WizardProvider, useWizard } from '@/context/WizardContext';
import HistorySidebar from '@/components/HistorySidebar';
import StepIndicator from '@/components/StepIndicator';
import BusinessForm from '@/components/BusinessForm';
import ICPSelection from '@/components/ICPSelection';
import ContentPillars from '@/components/ContentPillars';
import CustomizeQuestions from '@/components/CustomizeQuestions';
import CreatorStylePicker from '@/components/CreatorStylePicker';
import ContentEditor from '@/components/ContentEditor';

function WizardContent({ userName, isSidebarOpen, onMenuToggle }: { userName: string | null; isSidebarOpen: boolean; onMenuToggle: (isOpen: boolean) => void }) {
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

  const handleCloseSidebar = () => {
    onMenuToggle(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar onMenuToggle={onMenuToggle} userName={userName} isMenuOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Fixed Position */}
        <HistorySidebar isOpen={true} />

        {/* Sidebar Overlay - Mobile only */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 md:hidden"
            onClick={handleCloseSidebar}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </div>
        )}

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <HistorySidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto md:ml-64">
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none floating-orb slow -left-14 top-24 h-64 w-64" />
            <div className="pointer-events-none floating-orb -right-20 top-36 h-72 w-72" />
            <div className="pointer-events-none floating-orb fast left-[36%] -top-10 h-28 w-28" />
            <div className="pointer-events-none floating-orb slow right-[24%] bottom-12 h-24 w-24" />
            <div className="pointer-events-none floating-orb fast left-[18%] bottom-2 h-36 w-36" />

            {/* Step Indicator */}
            <div className="relative z-10 mx-auto mt-8 max-w-6xl px-6">
              <div className="premium-glass rounded-lg px-4 md:px-8">
                <StepIndicator />
              </div>
            </div>

            {/* Step Content */}
            <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8">
              <section className="premium-glass rounded-lg p-6 md:p-10">
                {stepComponents[state.currentStep] || <BusinessForm />}
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      } else {
        // Try to get full_name from users table first
        const { data: userData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        const name = userData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Creator';
        setUserName(name);
      }
    };
    checkAuth();
  }, [router]);

  const handleMenuToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  return (
    <WizardProvider>
      <WizardContent userName={userName} isSidebarOpen={isSidebarOpen} onMenuToggle={handleMenuToggle} />
    </WizardProvider>
  );
}
