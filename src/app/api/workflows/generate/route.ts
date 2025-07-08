import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/database';
import { generateWorkflowWithOpenAI, validateWorkflow } from '@/lib/ai/openai';
import { WorkflowGenerationRequest, ApiResponse, PLAN_LIMITS } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json() as WorkflowGenerationRequest;
    
    if (!body.description?.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Workflow description is required'
      }, { status: 400 });
    }

    // Get user and check plan limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            workflows: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Check plan limits
    const planLimits = PLAN_LIMITS[user.plan];
    if (planLimits.workflowsPerMonth !== -1 && user._count.workflows >= planLimits.workflowsPerMonth) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Monthly workflow limit reached. Please upgrade your plan.'
      }, { status: 403 });
    }

    // Record generation start time for analytics
    const startTime = Date.now();

    try {
      // Generate workflow using AI
      const workflow = await generateWorkflowWithOpenAI(body);
      
      // Validate the generated workflow
      const isValid = await validateWorkflow(workflow);
      if (!isValid) {
        throw new Error('Generated workflow failed validation');
      }

      // Save workflow to database
      const savedWorkflow = await prisma.workflow.create({
        data: {
          userId: user.id,
          title: workflow.name,
          description: body.description,
          n8nJson: workflow,
        }
      });

      // Track usage
      const generationTime = Date.now() - startTime;
      await prisma.usageLog.create({
        data: {
          userId: user.id,
          action: 'workflow_generated',
          workflowId: savedWorkflow.id,
          metadata: {
            generationTime,
            nodeCount: workflow.nodes?.length || 0,
            complexity: body.complexity,
            category: body.category,
          }
        }
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          workflow: savedWorkflow,
          n8nJson: workflow,
          generationTime
        }
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Still track the failed attempt
      await prisma.usageLog.create({
        data: {
          userId: user.id,
          action: 'workflow_generated',
          metadata: {
            error: aiError instanceof Error ? aiError.message : 'Unknown error',
            generationTime: Date.now() - startTime,
            complexity: body.complexity,
            category: body.category,
          }
        }
      });

      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to generate workflow. Please try again or simplify your request.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Workflow generation API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 