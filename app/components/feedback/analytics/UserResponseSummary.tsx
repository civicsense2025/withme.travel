'use client';

import { useState } from 'react';
import { Question, QuestionType, Response, ResponseSession } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserResponseSummaryProps {
  tripId: string;
  tripName?: string;
  formTitle?: string;
  questions: Question[];
  responses: Response[];
  sessions: ResponseSession[];
  memberCount?: number;
  isLoading?: boolean;
}

export function UserResponseSummary({
  tripId,
  tripName = 'Trip',
  formTitle = 'Preferences',
  questions,
  responses,
  sessions,
  memberCount = 0,
  isLoading = false,
}: UserResponseSummaryProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  // If still loading
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded-md"></div>
        <div className="h-64 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  // Calculate participation rate
  const participationRate = memberCount > 0 ? Math.round((sessions.length / memberCount) * 100) : 0;

  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

  // Group responses by question
  const responsesByQuestion = questions.reduce(
    (acc, question) => {
      acc[question.id] = responses.filter((r) => r.questionId === question.id);
      return acc;
    },
    {} as Record<string, Response[]>
  );

  // Function to generate summary for a specific question type
  const getQuestionSummary = (question: Question) => {
    const questionResponses = responsesByQuestion[question.id] || [];

    if (questionResponses.length === 0) {
      return <div className="text-muted-foreground text-center py-4">No responses yet</div>;
    }

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.YES_NO: {
        // For choice questions, count occurrences of each option
        const counts: Record<string, number> = {};
        questionResponses.forEach((response) => {
          const value = Array.isArray(response.value) ? response.value : [response.value];

          value.forEach((v) => {
            counts[v] = (counts[v] || 0) + 1;
          });
        });

        // Convert to chart data
        const chartData = Object.entries(counts).map(([label, count]) => ({
          name:
            question.type === QuestionType.YES_NO
              ? label === 'true'
                ? 'Yes'
                : 'No'
              : (question as any).options?.find((o: any) => o.value === label || o.label === label)
                  ?.label || label,
          value: count,
        }));

        return (
          <div className="space-y-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Based on {questionResponses.length} responses
            </div>
          </div>
        );
      }

      case QuestionType.RATING:
      case QuestionType.NPS:
      case QuestionType.NUMERIC_SCALE: {
        // For numeric ratings, calculate average and distribution
        const values = questionResponses.map((r) => Number(r.value));
        const average = values.reduce((sum, v) => sum + v, 0) / values.length;

        // Count occurrences of each rating
        const distribution: Record<number, number> = {};
        values.forEach((value) => {
          distribution[value] = (distribution[value] || 0) + 1;
        });

        // Convert to chart data
        const chartData = Object.entries(distribution)
          .map(([rating, count]) => ({
            name: rating,
            value: count,
          }))
          .sort((a, b) => Number(a.name) - Number(b.name));

        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold">{average.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-2">average rating</span>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} responses`, 'Count']}
                    labelFormatter={(value) => `Rating: ${value}`}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Based on {questionResponses.length} responses
            </div>
          </div>
        );
      }

      case QuestionType.DRAG_RANK: {
        // For ranking questions, calculate average rank for each option
        const ranks: Record<string, number[]> = {};

        questionResponses.forEach((response) => {
          const value = response.value as string[];
          value.forEach((optionValue, index) => {
            if (!ranks[optionValue]) {
              ranks[optionValue] = [];
            }
            ranks[optionValue].push(index + 1);
          });
        });

        // Calculate average rank for each option
        const averageRanks = Object.entries(ranks).map(([optionValue, rankList]) => {
          const averageRank = rankList.reduce((sum, rank) => sum + rank, 0) / rankList.length;
          const optionLabel =
            (question as any).options?.find(
              (o: any) => o.value === optionValue || o.id === optionValue
            )?.label || optionValue;

          return {
            name: optionLabel,
            value: averageRank,
          };
        });

        // Sort by average rank (lower is better)
        averageRanks.sort((a, b) => a.value - b.value);

        return (
          <div className="space-y-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={averageRanks}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, (question as any).options?.length || 5]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    formatter={(value) => [
                      `${typeof value === 'number' ? value.toFixed(1) : value}`,
                      'Avg. Rank',
                    ]}
                    labelFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Based on {questionResponses.length} responses • Lower rank is better
            </div>
          </div>
        );
      }

      case QuestionType.BUDGET_ALLOCATOR: {
        // For budget allocators, calculate average allocation per category
        const allocations: Record<string, number[]> = {};

        questionResponses.forEach((response) => {
          const value = response.value as Record<string, number>;
          Object.entries(value).forEach(([category, amount]) => {
            if (!allocations[category]) {
              allocations[category] = [];
            }
            allocations[category].push(amount);
          });
        });

        // Calculate average allocation for each category
        const averageAllocations = Object.entries(allocations).map(([categoryId, amounts]) => {
          const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
          const categoryLabel =
            (question as any).categories?.find(
              (c: any) => c.value === categoryId || c.id === categoryId
            )?.label || categoryId;

          return {
            name: categoryLabel,
            value: average,
          };
        });

        // Sort by average allocation (higher first)
        averageAllocations.sort((a, b) => b.value - a.value);

        return (
          <div className="space-y-4">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={averageAllocations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {averageAllocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `${typeof value === 'number' ? value.toFixed(1) : value}%`,
                      'Allocation',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Average budget allocation across {questionResponses.length} responses
            </div>
          </div>
        );
      }

      case QuestionType.ACTIVITY_INTEREST: {
        // For activity interest, calculate average interest level for each activity
        const interestLevels: Record<string, number[]> = {};

        questionResponses.forEach((response) => {
          const value = response.value as Record<string, number>;
          Object.entries(value).forEach(([activityId, level]) => {
            if (!interestLevels[activityId]) {
              interestLevels[activityId] = [];
            }
            interestLevels[activityId].push(level);
          });
        });

        // Calculate average interest for each activity
        const averageInterest = Object.entries(interestLevels).map(([activityId, levels]) => {
          const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
          const activityLabel =
            (question as any).activities?.find((a: any) => a.id === activityId)?.label ||
            activityId;

          return {
            name: activityLabel,
            value: average,
          };
        });

        // Sort by average interest (higher first)
        averageInterest.sort((a, b) => b.value - a.value);

        return (
          <div className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={averageInterest}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    formatter={(value) => [
                      `${typeof value === 'number' ? value.toFixed(1) : value}`,
                      'Avg. Interest',
                    ]}
                    labelFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Average interest level (1-5) across {questionResponses.length} responses
            </div>
          </div>
        );
      }

      // For text questions and other types, show a simplified summary
      default:
        return (
          <div className="py-4">
            <div className="text-center text-sm">
              {questionResponses.length} {questionResponses.length === 1 ? 'response' : 'responses'}{' '}
              collected
            </div>
            <div className="mt-2 text-center">
              <button className="text-primary hover:underline text-sm">
                View individual responses
              </button>
            </div>
          </div>
        );
    }
  };

  // Filter questions to show only those that make sense in a summary
  // (exclude welcome screens, instructions, etc.)
  const summarizableQuestions = questions.filter(
    (q) =>
      ![
        QuestionType.WELCOME,
        QuestionType.THANK_YOU,
        QuestionType.INSTRUCTIONS,
        QuestionType.STATEMENT,
      ].includes(q.type)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{formTitle}</CardTitle>
          <CardDescription>Summary of responses for {tripName}</CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{memberCount}</div>
              <div className="text-sm text-muted-foreground">Trip Members</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{participationRate}%</div>
              <div className="text-sm text-muted-foreground">Participation</div>
            </div>
          </div>

          {summarizableQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions available for summary
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={expandedSection || 'overview'}
              onValueChange={setExpandedSection}
              className="w-full"
            >
              {summarizableQuestions.map((question) => (
                <AccordionItem key={question.id} value={question.id}>
                  <AccordionTrigger className="text-left">{question.title}</AccordionTrigger>
                  <AccordionContent>{getQuestionSummary(question)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {sessions.length > 0 && (
        <div className="text-sm text-right">
          <button className="text-primary hover:underline">Download responses (CSV)</button>
        </div>
      )}
    </div>
  );
}
