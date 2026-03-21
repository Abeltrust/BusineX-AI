import { ArrowRight, Building2, CircleDollarSign, ClipboardList, Target, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useRouter } from '../router/useRouter';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: Target,
    title: 'Strategic Direction',
    text: 'Translate company context into priorities that fit the current stage of the business.',
  },
  {
    icon: ClipboardList,
    title: 'Execution Tracking',
    text: 'Convert strategic guidance into owned tasks, deadlines, and operating cadence.',
  },
  {
    icon: Users,
    title: 'Pipeline Management',
    text: 'Track prospects, proposals, and follow-up activity without leaving the workspace.',
  },
  {
    icon: CircleDollarSign,
    title: 'Financial Visibility',
    text: 'Keep cash position, burn rate, and commercial value in view during critical growth periods.',
  },
];

export function HomePage() {
  const { navigate } = useRouter();
  const { workspace } = useWorkspace();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 md:space-y-16"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Pill>Professional founder operations</Pill>
          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[0.92] tracking-tight md:text-7xl">
            Run strategy, execution, pipeline, and business reviews from one operating workspace.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
            BusineX AI helps founders structure the business, generate an operating plan, track execution, and
            diagnose bottlenecks without switching between disconnected tools.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="text-base" onClick={() => navigate('/setup')}>
              Create Workspace <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant={workspace ? 'outline' : 'ghost'}
              className="text-base"
              disabled={!workspace}
              onClick={() => navigate('/workspace')}
            >
              Resume Workspace
            </Button>
          </div>
        </div>

        <Card className="panel-strong overflow-hidden text-white">
          <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
              <Pill>Operating model</Pill>
              <Building2 className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="grid gap-4">
              {[
                'Capture core company context, goals, customer focus, and financial assumptions.',
                'Generate an execution-ready plan with priorities, milestones, risks, and finance notes.',
                'Operate from a dedicated workspace for delivery, CRM, and runway visibility.',
                'Run structured business reviews when the company hits growth or execution friction.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <feature.icon className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-bold">{feature.title}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{feature.text}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
