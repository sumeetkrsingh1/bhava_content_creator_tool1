import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Network,
  Target,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const services = [
  {
    number: "01",
    icon: Network,
    title: "LinkedIn Content & Authority Building",
    body: "Position yourself as a thought leader through consistent, strategic content that earns trust and drives inbound interest.",
    points: [
      "Profile optimization & headline rewrite",
      "Weekly content creation & scheduling",
      "Engagement strategy",
      "Analytics & monthly performance review",
    ],
    color: "cyan",
  },
  {
    number: "02",
    icon: Building2,
    title: "Company Page Optimization & Revamping",
    body: "Transform your company LinkedIn page into a credibility engine that attracts talent, partners, and clients.",
    points: [
      "Full page audit & competitive analysis",
      "Brand-aligned content calendar",
      "Banner & visual asset creation guidance",
      "Follower growth strategy",
    ],
    color: "blue",
  },
  {
    number: "03",
    icon: Target,
    title: "B2B Lead Generation",
    body: "Identify, connect, and nurture high-value prospects directly through LinkedIn outreach without cold email blasts.",
    points: [
      "Ideal Client Profile definition",
      "Targeted outreach sequences",
      "Message templates & follow-up cadences",
      "Pipeline tracking & reporting",
    ],
    color: "violet",
  },
];

const logos = ["Deloitte.", "kotak", "intuitive apps", "KPMG", "CRAKCODE", "tcs"];

const serviceAccent = {
  cyan: {
    number: "text-[#20c8ef]/30",
    icon: "text-[#20c8ef] bg-[#20c8ef]/10 border-[#20c8ef]/20",
    check: "text-[#20c8ef]",
  },
  blue: {
    number: "text-[#3679f4]/30",
    icon: "text-[#3679f4] bg-[#3679f4]/10 border-[#3679f4]/20",
    check: "text-[#3679f4]",
  },
  violet: {
    number: "text-[#9b75ff]/30",
    icon: "text-[#9b75ff] bg-[#9b75ff]/10 border-[#9b75ff]/20",
    check: "text-[#9b75ff]",
  },
};

export default function RefPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#eaf7ff] text-brand-dark dark:bg-brand-deep dark:text-brand-star">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl dark:border-brand-layer3/20 dark:bg-brand-deep/85">
        <div className="mx-auto flex h-24 max-w-[1660px] items-center justify-between px-6 sm:px-10 lg:px-24">
          <Link href="/ref" aria-label="Brand Bhava reference page" className="flex items-center">
            <Image
              src="/brandBhavaLogo-transparent.png"
              alt="Brand Bhava"
              width={74}
              height={74}
              className="h-14 w-14 object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-10 text-lg font-semibold text-slate-600 dark:text-brand-star/80 md:flex">
            <Link href="#about" className="transition hover:text-brand-primary">
              About
            </Link>
            <Link href="#services" className="transition hover:text-brand-primary">
              Services
            </Link>
            <Link href="#testimonials" className="transition hover:text-brand-primary">
              Testimonials
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#2a6fe3] px-8 py-3 text-[#1b6fff] transition hover:bg-[#2a6fe3] hover:text-white"
            >
              Book a Call
            </Link>
            <ThemeToggle />
          </nav>

          <Link
            href="/login"
            className="rounded-full border border-[#2a6fe3] px-5 py-2 text-sm font-bold text-[#1b6fff] md:hidden"
          >
            Book
          </Link>
        </div>
      </header>

      <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[linear-gradient(115deg,#19358d_0%,#1f56e0_42%,#072742_100%)] px-6 py-20 text-white sm:px-10 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_20%,rgba(57,144,255,0.42),transparent_28%),radial-gradient(circle_at_38%_82%,rgba(0,210,255,0.18),transparent_35%)]" />
        <div className="bb-ribbon bb-ribbon-one" />
        <div className="bb-ribbon bb-ribbon-two" />
        <div className="bb-ribbon bb-ribbon-three" />

        <div className="relative z-10 grid min-h-[760px] max-w-[1660px] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <p className="mb-10 text-sm font-bold uppercase tracking-[0.24em] text-[#00d2ff] sm:text-lg">
              Intelligence & Systems
            </p>
            <h1 className="font-display text-6xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-[6.9rem]">
              Clarity in
              <br />
              Complexity.
              <span className="mt-8 block bg-[linear-gradient(90deg,#7969ff,#b45cf3)] bg-clip-text text-transparent">
                Structure in
                <br />
                Growth.
              </span>
            </h1>
            <p className="mt-16 max-w-3xl text-2xl font-semibold leading-relaxed text-white/78">
              Brand Bhava helps founders, executives, and technical leaders construct an
              insightful, analytical LinkedIn presence to capture the right opportunities.
            </p>
            <div className="mt-16 flex flex-col gap-5 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-[#2f74ea] px-12 py-5 text-center text-xl font-bold shadow-[0_22px_48px_rgba(0,39,111,0.26)] transition hover:bg-[#0050ff]"
              >
                Construct Your Brand
              </Link>
              <Link
                href="#services"
                className="rounded-full border border-white/18 px-12 py-5 text-center text-xl font-bold text-white transition hover:border-white/35 hover:bg-white/8"
              >
                Analyze the Framework
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[680px] lg:block">
            <div className="absolute right-16 top-16 w-[390px] rounded-[2rem] border border-white/12 bg-white/14 p-9 shadow-[0_28px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#4c9dff]/28">
                <BarChart3 className="h-7 w-7 text-[#00d2ff]" />
              </div>
              <h2 className="text-3xl font-bold">System Insights</h2>
              <p className="mt-4 text-xl font-semibold leading-relaxed text-white/68">
                Data-driven growth trajectory matching scale requirements.
              </p>
            </div>
            <div className="absolute bottom-20 left-12 w-[430px] rounded-[2rem] border border-white/12 bg-white/14 p-9 shadow-[0_28px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#8069ff]/36">
                <Zap className="h-7 w-7 text-[#a577ff]" />
              </div>
              <h2 className="text-3xl font-bold">Performance Nodes</h2>
              <div className="mt-8 h-2 rounded-full bg-white/12">
                <div className="h-full w-[86%] rounded-full bg-[linear-gradient(90deg,#8f6aff,#ff4eaa)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-[#edf8ff] px-6 py-24 dark:bg-brand-dark sm:px-10 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(0,210,255,0.14),transparent_20%),linear-gradient(168deg,transparent_0_72%,rgba(209,240,255,0.95)_72%)]" />
        <div className="relative z-10 mx-auto grid max-w-[1660px] items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div className="max-w-3xl">
            <p className="text-lg font-bold uppercase tracking-[0.12em] text-[#9a78ff]">
              Brand Framework
            </p>
            <h2 className="mt-7 font-display text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
              Constructed by{" "}
              <span className="bg-[linear-gradient(90deg,#7467ff,#e348aa)] bg-clip-text text-transparent">
                Experts
              </span>
            </h2>
            <div className="mt-4 space-y-7 text-2xl leading-relaxed text-slate-700 dark:text-brand-star/72">
              <p>
                Bhavna is a systems-focused LinkedIn specialist helping founders,
                consultants, and tech leaders bring structure to how their business grows.
              </p>
              <p>
                Her approach filters out the noise. By applying data-driven strategy and
                clear formatting, she constructs a digital presence that signals authority
                and captures demand.
              </p>
            </div>
            <div className="mt-12 grid max-w-3xl grid-cols-3 gap-8">
              {[
                ["50+", "Systems Deployed", "text-[#20c8ef]"],
                ["3M+", "Organic Impressions", "text-[#3679f4]"],
                ["5 Yrs", "LinkedIn Analytics", "text-[#9b75ff]"],
              ].map(([value, label, color]) => (
                <div key={label}>
                  <p className={`text-5xl font-bold ${color}`}>{value}</p>
                  <p className="mt-3 text-xl text-slate-700 dark:text-brand-star/70">{label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-14 inline-flex rounded-full bg-[#2f74ea] px-10 py-5 text-xl font-bold text-white shadow-[0_20px_44px_rgba(42,111,227,0.24)] transition hover:bg-[#0050ff]"
            >
              Initiate Consultation
            </Link>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <div className="absolute inset-8 rounded-full bg-[linear-gradient(145deg,#0900ff,#142176)] shadow-[0_22px_60px_rgba(42,111,227,0.25)]" />
            <div className="absolute inset-3 rounded-full border-[10px] border-[#5fbef6] shadow-[0_0_0_8px_rgba(130,112,255,0.75)]" />
            <div className="absolute inset-24 flex items-center justify-center rounded-full bg-white/88 text-center text-7xl font-bold text-[#1e6ef2] shadow-inner">
              BB
            </div>
            <div className="absolute right-2 top-0 h-20 w-20 rounded-full bg-[#23aee9] shadow-xl" />
            <div className="absolute bottom-6 right-0 h-32 w-32 rounded-full bg-[#c451bf] shadow-xl" />
          </div>
        </div>
      </section>

      <section id="testimonials" className="border-y border-[#cbe9f7] bg-[#eaf7ff] px-6 py-24 dark:border-brand-layer3/20 dark:bg-brand-deep sm:px-10 lg:px-24">
        <div className="mx-auto max-w-[1660px]">
          <p className="text-center text-lg font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-brand-star/55">
            Trusted by teams at
          </p>
          <div className="mt-20 grid grid-cols-2 items-center gap-14 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <div key={logo} className="flex justify-center">
                <span className="bg-white/55 px-4 py-2 text-3xl font-black tracking-tight text-slate-900 shadow-sm dark:bg-white/10 dark:text-brand-star">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#eaf7ff] px-6 py-28 dark:bg-brand-deep sm:px-10 lg:px-24">
        <div className="mx-auto max-w-[1660px]">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-lg font-bold uppercase tracking-[0.12em] text-[#3679f4]">
              System Offerings
            </p>
            <h2 className="mt-5 font-display text-6xl font-bold leading-tight tracking-tight sm:text-7xl">
              3 Core{" "}
              <span className="bg-[linear-gradient(90deg,#7667ff,#df46ad)] bg-clip-text text-transparent">
                Architectures
              </span>
            </h2>
            <p className="mx-auto mt-10 max-w-4xl text-3xl leading-relaxed text-slate-700 dark:text-brand-star/70">
              Whether constructing personal authority, establishing company presence, or
              optimizing lead generation, we provide the required framework.
            </p>
          </div>

          <div className="mt-28 grid gap-10 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              const accent = serviceAccent[service.color as keyof typeof serviceAccent];

              return (
                <article
                  key={service.number}
                  className="min-h-[640px] border border-[#b7dcf8] bg-white/22 p-14 backdrop-blur-sm dark:border-brand-layer3/25 dark:bg-white/6"
                >
                  <p className={`text-8xl font-bold ${accent.number}`}>
                    {service.number}
                  </p>
                  <div className={`mt-14 flex h-16 w-16 items-center justify-center rounded-full border ${accent.icon}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-12 text-4xl font-bold leading-tight">
                    {service.title}
                  </h3>
                  <p className="mt-8 text-2xl leading-relaxed text-slate-600 dark:text-brand-star/68">
                    {service.body}
                  </p>
                  <ul className="mt-12 space-y-5 text-xl text-slate-600 dark:text-brand-star/68">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-4">
                        <CheckCircle2 className={`mt-1 h-6 w-6 shrink-0 ${accent.check}`} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf7ff] px-6 py-28 dark:bg-brand-deep sm:px-10 lg:px-24">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-[#c3d9eb] bg-white/20 px-8 py-24 text-center shadow-[0_20px_80px_rgba(42,111,227,0.1)] backdrop-blur-md dark:border-brand-layer3/25 dark:bg-white/6">
          <p className="text-lg font-bold uppercase tracking-[0.12em] text-[#3679f4]">
            System Integration
          </p>
          <h2 className="mx-auto mt-7 max-w-4xl font-display text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Ready to scale your{" "}
            <span className="bg-[linear-gradient(90deg,#7667ff,#df46ad)] bg-clip-text text-transparent">
              technical credibility?
            </span>
          </h2>
          <p className="mx-auto mt-9 max-w-4xl text-2xl leading-relaxed text-slate-600 dark:text-brand-star/70">
            If this approach aligns with your goals, let&apos;s build the infrastructure
            together.
          </p>
          <Link
            href="/login"
            className="mt-16 inline-flex rounded-full bg-[#2f74ea] px-16 py-6 text-2xl font-bold text-white shadow-[0_20px_44px_rgba(42,111,227,0.24)] transition hover:bg-[#0050ff]"
          >
            Initialize System Assessment
          </Link>
          <p className="mt-8 text-lg text-slate-400">
            30-minute logical review. Direct and analytical insight.
          </p>
        </div>
      </section>
    </main>
  );
}
