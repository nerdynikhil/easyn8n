'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Plus, Download, Clock, Zap, Users, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { WorkflowWithUser, PLAN_LIMITS } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [workflows, setWorkflows] = useState<WorkflowWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    thisMonthWorkflows: 0,
    averageNodes: 0,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkflows();
    }
  }, [status]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
        
        // Calculate stats
        const total = data.workflows?.length || 0;
        const thisMonth = data.workflows?.filter((w: any) => {
          const created = new Date(w.createdAt);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length || 0;
        
        const avgNodes = total > 0 
          ? Math.round(data.workflows.reduce((acc: number, w: any) => 
              acc + (w.n8nJson?.nodes?.length || 0), 0) / total)
          : 0;

        setStats({
          totalWorkflows: total,
          thisMonthWorkflows: thisMonth,
          averageNodes: avgNodes,
        });
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadWorkflow = (workflow: any) => {
    const dataStr = JSON.stringify(workflow.n8nJson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userPlan = session?.user?.plan || 'free';
  const planLimits = PLAN_LIMITS[userPlan];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">EasyN8N</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {userPlan} plan
            </Badge>
            <Button asChild>
              <Link href="/generator">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your AI-generated n8n workflows and track your automation journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workflows</p>
                  <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{stats.thisMonthWorkflows}</p>
                  <p className="text-xs text-gray-500">
                    of {planLimits.workflowsPerMonth === -1 ? '∞' : planLimits.workflowsPerMonth} limit
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Nodes</p>
                  <p className="text-2xl font-bold">{stats.averageNodes}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Plan Status</p>
                  <p className="text-lg font-bold capitalize">{userPlan}</p>
                  {userPlan === 'free' && (
                    <Button size="sm" variant="outline" className="mt-2" asChild>
                      <Link href="/#pricing">Upgrade</Link>
                    </Button>
                  )}
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Workflows</h2>
            <Button asChild>
              <Link href="/generator">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </Button>
          </div>

          {workflows.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="mb-2">No Workflows Yet</CardTitle>
                <CardDescription className="mb-6">
                  Create your first AI-generated n8n workflow to get started with automation.
                </CardDescription>
                <Button asChild>
                  <Link href="/generator">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Workflow
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {workflow.title}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {(workflow.n8nJson as any)?.nodes?.length || 0} nodes
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadWorkflow(workflow)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Separator className="my-8" />
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to boost your productivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/generator">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Workflow
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/templates">
                  <Zap className="h-4 w-4 mr-2" />
                  Browse Templates
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/#pricing">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Tips & Resources</CardTitle>
              <CardDescription>
                Make the most of EasyN8N
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">📚 Learning Resources</p>
                <p className="text-gray-600">Check out n8n documentation for advanced workflows</p>
              </div>
              <div>
                <p className="font-medium">🎯 Best Practices</p>
                <p className="text-gray-600">Be specific in your descriptions for better results</p>
              </div>
              <div>
                <p className="font-medium">🔗 Community</p>
                <p className="text-gray-600">Join our Discord for workflow inspiration</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 