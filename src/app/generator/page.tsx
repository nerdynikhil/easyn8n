'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Bot, User, Loader2, Download, ExternalLink, Zap } from 'lucide-react';
import { N8NWorkflow, WorkflowGenerationRequest, ApiResponse } from '@/types';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'workflow';
  content: string;
  workflow?: N8NWorkflow;
  timestamp: Date;
}

export default function WorkflowGeneratorPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI workflow assistant. Describe the automation you'd like to create and I'll generate a professional n8n workflow for you. For example: 'Send a Slack notification when a new customer signs up' or 'Automatically backup Google Sheets to Dropbox weekly'.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || status !== 'authenticated') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '🔄 Analyzing your requirements and generating workflow...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, loadingMessage]);

      const request: WorkflowGenerationRequest = {
        description: userMessage.content,
        complexity: 'medium',
        category: detectCategory(userMessage.content),
      };

      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result: ApiResponse = await response.json();

      // Remove loading message
      setMessages(prev => prev.slice(0, -1));

      if (result.success && result.data) {
        const { workflow, n8nJson, generationTime } = result.data;
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `✅ Perfect! I've generated a professional n8n workflow for you in ${generationTime}ms. The workflow includes ${n8nJson.nodes?.length || 0} nodes and follows n8n best practices.`,
          timestamp: new Date(),
        };

        const workflowMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'workflow',
          content: workflow.title,
          workflow: n8nJson,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, successMessage, workflowMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `❌ ${result.error || 'Something went wrong. Please try again with a more specific description.'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: '❌ Network error. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWorkflow = (workflow: N8NWorkflow, filename: string) => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/\s+/g, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
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
              Please sign in to use the workflow generator
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
              {session?.user?.plan || 'free'} plan
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  AI Workflow Generator
                </CardTitle>
                <CardDescription>
                  Describe your automation needs and I'll create a professional n8n workflow
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        {message.type === 'user' ? (
                          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        {message.type === 'workflow' ? (
                          <WorkflowCard 
                            workflow={message.workflow!}
                            title={message.content}
                            onDownload={() => downloadWorkflow(message.workflow!, message.content)}
                          />
                        ) : (
                          <div className={`p-3 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground ml-8' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your automation (e.g., Send email when form is submitted)"
                    disabled={isGenerating}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isGenerating || !input.trim()}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Be specific about triggers:</p>
                  <p className="text-gray-600">"When a new order is placed" vs "when something happens"</p>
                </div>
                <div>
                  <p className="font-medium">Mention the tools you use:</p>
                  <p className="text-gray-600">"Send to Slack" or "Update Google Sheets"</p>
                </div>
                <div>
                  <p className="font-medium">Include desired outcomes:</p>
                  <p className="text-gray-600">"Send confirmation email and create task"</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Popular Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Send Slack notification for new GitHub issues',
                  'Backup Google Sheets to Dropbox weekly',
                  'Create Notion task from Typeform submission',
                  'Send welcome email to new customers',
                  'Sync Airtable records with CRM'
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                    disabled={isGenerating}
                  >
                    {example}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkflowCardProps {
  workflow: N8NWorkflow;
  title: string;
  onDownload: () => void;
}

function WorkflowCard({ workflow, title, onDownload }: WorkflowCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              {workflow.nodes?.length || 0} nodes • Ready to import
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Generated
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-3">
          <Button size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download JSON
          </Button>
          <Button size="sm" variant="outline">
            <ExternalLink className="h-4 w-4 mr-1" />
            Open in n8n
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>Nodes: {workflow.nodes?.map(n => n.type).join(', ')}</p>
          <p>Ready for production use in n8n</p>
        </div>
      </CardContent>
    </Card>
  );
}

function detectCategory(description: string): string {
  const keywords = {
    marketing: ['email', 'campaign', 'newsletter', 'social', 'lead'],
    sales: ['crm', 'customer', 'deal', 'lead', 'sales'],
    operations: ['backup', 'sync', 'monitor', 'alert', 'report'],
    ecommerce: ['order', 'purchase', 'payment', 'inventory', 'shop'],
    communication: ['slack', 'teams', 'discord', 'notification'],
  };

  const lowerDesc = description.toLowerCase();
  
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => lowerDesc.includes(term))) {
      return category;
    }
  }
  
  return 'other';
} 