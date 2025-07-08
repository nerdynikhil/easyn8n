'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, Search, Download, ExternalLink, Filter, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TemplateWithStats, TemplateCategory } from '@/types';

const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string; emoji: string }[] = [
  { value: 'marketing', label: 'Marketing', emoji: '📧' },
  { value: 'sales', label: 'Sales & CRM', emoji: '💼' },
  { value: 'operations', label: 'Operations', emoji: '⚙️' },
  { value: 'ecommerce', label: 'E-commerce', emoji: '🛒' },
  { value: 'communication', label: 'Communication', emoji: '💬' },
  { value: 'data-processing', label: 'Data Processing', emoji: '📊' },
  { value: 'social-media', label: 'Social Media', emoji: '📱' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'hr', label: 'HR & People', emoji: '👥' },
  { value: 'development', label: 'Development', emoji: '💻' },
];

// Sample templates (in production, these would come from the database)
const SAMPLE_TEMPLATES = [
  {
    id: '1',
    title: 'Slack Notification for GitHub Issues',
    description: 'Automatically send Slack notifications when new GitHub issues are created or updated',
    category: 'development' as TemplateCategory,
    isPremium: false,
    usageCount: 245,
    nodeCount: 4,
    tags: ['github', 'slack', 'notifications', 'issues']
  },
  {
    id: '2',
    title: 'Customer Onboarding Email Sequence',
    description: 'Welcome new customers with a personalized email sequence and create tasks in your CRM',
    category: 'marketing' as TemplateCategory,
    isPremium: true,
    usageCount: 189,
    nodeCount: 7,
    tags: ['email', 'crm', 'onboarding', 'automation']
  },
  {
    id: '3',
    title: 'E-commerce Order Processing',
    description: 'Process new orders by updating inventory, sending confirmations, and creating shipping labels',
    category: 'ecommerce' as TemplateCategory,
    isPremium: true,
    usageCount: 156,
    nodeCount: 9,
    tags: ['orders', 'inventory', 'shipping', 'confirmation']
  },
  {
    id: '4',
    title: 'Google Sheets to Airtable Sync',
    description: 'Automatically sync data between Google Sheets and Airtable when rows are added or updated',
    category: 'operations' as TemplateCategory,
    isPremium: false,
    usageCount: 312,
    nodeCount: 5,
    tags: ['google-sheets', 'airtable', 'sync', 'data']
  },
  {
    id: '5',
    title: 'Social Media Post Scheduler',
    description: 'Schedule and publish content across multiple social media platforms from a central spreadsheet',
    category: 'social-media' as TemplateCategory,
    isPremium: true,
    usageCount: 98,
    nodeCount: 8,
    tags: ['social-media', 'scheduling', 'content', 'automation']
  },
  {
    id: '6',
    title: 'Invoice Generation and Delivery',
    description: 'Generate professional invoices and automatically send them to customers via email',
    category: 'finance' as TemplateCategory,
    isPremium: false,
    usageCount: 134,
    nodeCount: 6,
    tags: ['invoices', 'email', 'finance', 'automation']
  },
];

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [templates, setTemplates] = useState(SAMPLE_TEMPLATES);
  const [loading, setLoading] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const downloadTemplate = (template: any) => {
    // In production, this would fetch the actual n8n JSON from the database
    const sampleWorkflow = {
      id: template.id,
      name: template.title,
      nodes: Array.from({ length: template.nodeCount }, (_, i) => ({
        id: `node_${i}`,
        name: `Node ${i + 1}`,
        type: i === 0 ? 'Trigger' : i === template.nodeCount - 1 ? 'Action' : 'Process',
        typeVersion: 1,
        position: [i * 200, 100],
        parameters: {}
      })),
      connections: {},
      active: false
    };

    const dataStr = JSON.stringify(sampleWorkflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.title.replace(/\s+/g, '_').toLowerCase()}.json`;
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
            {session ? (
              <>
                <Badge variant="secondary">
                  {session.user?.plan || 'free'} plan
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/generator">Create Workflow</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/generator">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Workflow Templates</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from our curated collection of professional n8n workflows. 
            Customize and download instantly, or use as inspiration for your own automations.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {TEMPLATE_CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.emoji} {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
            {selectedCategory !== 'all' && (
              <span> in {TEMPLATE_CATEGORIES.find(c => c.value === selectedCategory)?.label}</span>
            )}
          </p>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="mb-2">No Templates Found</CardTitle>
              <CardDescription className="mb-6">
                Try adjusting your search or browse a different category.
              </CardDescription>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                View All Templates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {template.title}
                        </CardTitle>
                        {template.isPremium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-3">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{template.nodeCount} nodes</span>
                    <span>{template.usageCount} uses</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {template.isPremium && (!session || session.user?.plan === 'free') ? (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link href="/#pricing">
                          Upgrade to Use
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => downloadTemplate(template)} className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Use our AI workflow generator to create custom automations tailored to your specific needs.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/generator">
                  Create Custom Workflow
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 