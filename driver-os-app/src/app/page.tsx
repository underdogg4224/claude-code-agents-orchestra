import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Welcome to Driver OS v2
        </h1>
        <p className="text-lg md:text-xl text-center text-muted-foreground mb-8">
          AI-powered assessment tool for construction companies
        </p>

        <div className="flex flex-col items-center gap-4 mb-16">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/intake/step-1">
              Start Your Free Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Discover your top 3 AI quick wins in just 5 minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Quick Assessment</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get instant insights into operational improvements through our 4-step process
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Leverage AI to identify quick wins tailored to your business needs
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Actionable Results</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive detailed reports with implementation guidance within 24-48 hours
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
