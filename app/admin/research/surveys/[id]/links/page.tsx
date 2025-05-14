'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Clipboard, CopyCheck, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Form schema for generating links
const formSchema = z.object({
  email: z.string().email('Valid email required').optional(),
  name: z.string().optional(),
  bulk_count: z.coerce.number().int().min(1).max(100).optional(),
  add_user_info: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function SurveyLinksPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      bulk_count: 5,
      add_user_info: false,
    },
  });

  // Watch form values to determine UI state
  const addUserInfo = form.watch('add_user_info');

  // Fetch survey and links
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch survey
      const surveyRes = await fetch(`/api/research/surveys/${params.id}`);
      if (!surveyRes.ok) throw new Error('Failed to fetch survey');
      const surveyData = await surveyRes.json();
      
      // Fetch survey links
      const linksRes = await fetch(`/api/research/surveys/${params.id}/links`);
      if (!linksRes.ok) throw new Error('Failed to fetch survey links');
      const linksData = await linksRes.json();
      
      setSurvey(surveyData.survey);
      setLinks(linksData.links || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load survey and links',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Generate survey link(s)
  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    try {
      const requestData: any = {
        survey_id: params.id,
      };
      
      // Handle bulk vs single link generation
      if (bulkMode) {
        requestData.bulk_count = values.bulk_count;
      } else if (values.add_user_info) {
        // Add user info if specified
        requestData.user_info = {
          email: values.email,
          name: values.name,
        };
      }
      
      const response = await fetch(`/api/research/surveys/${params.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate survey links');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: bulkMode 
          ? `Generated ${values.bulk_count} survey links successfully` 
          : 'Survey link generated successfully',
      });
      
      // Refresh the links list
      fetchData();
      
      // Reset form
      form.reset({
        email: '',
        name: '',
        bulk_count: 5,
        add_user_info: false,
      });
    } catch (error) {
      console.error('Error generating survey links:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate survey links',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy link to clipboard
  const copyLink = (link: any) => {
    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/user-testing/survey/${link.token}`;
    
    navigator.clipboard.writeText(surveyUrl)
      .then(() => {
        setCopiedLinkId(link.id);
        setTimeout(() => setCopiedLinkId(null), 2000);
        
        toast({
          title: 'Copied!',
          description: 'Survey link copied to clipboard',
        });
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast({
          title: 'Error',
          description: 'Failed to copy link to clipboard',
          variant: 'destructive',
        });
      });
  };

  // Delete a survey link
  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? Any responses tied to it will be orphaned.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/research/surveys/${params.id}/links/${linkId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete link');
      }
      
      toast({
        title: 'Success',
        description: 'Link deleted successfully',
      });
      
      // Refresh the links list
      fetchData();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete link',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Survey Links</h1>
          {survey && (
            <p className="text-muted-foreground">{survey.name || survey.title || 'Untitled Survey'}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-64" />
      ) : (
        <>
          {/* Generate Links Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Survey Links</CardTitle>
              <CardDescription>
                Create unique links for user testing sessions and survey distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-sm font-medium">Single link</span>
                <Switch
                  checked={bulkMode}
                  onCheckedChange={setBulkMode}
                />
                <span className="text-sm font-medium">Bulk generation</span>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {!bulkMode && (
                    <>
                      <FormField
                        control={form.control}
                        name="add_user_info"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Add User Information</FormLabel>
                              <FormDescription>
                                Attach user details to this survey link
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {addUserInfo && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>User Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>User Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {bulkMode && (
                    <FormField
                      control={form.control}
                      name="bulk_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Links to Generate</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="100" {...field} />
                          </FormControl>
                          <FormDescription>
                            Generate up to 100 unique links at once
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : bulkMode ? 'Generate Links' : 'Generate Link'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Links List Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Survey Links</CardTitle>
                <CardDescription>
                  Manage and distribute your survey links
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchData}
                title="Refresh links"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No links generated yet</p>
                  <Button
                    variant="outline"
                    onClick={() => form.handleSubmit(onSubmit)()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate your first link
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>User Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-mono text-xs">
                          {link.token.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {link.user_info ? (
                            <div>
                              <div>{link.user_info.name || 'No name'}</div>
                              <div className="text-xs text-muted-foreground">{link.user_info.email || 'No email'}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={link.status === 'active' ? "default" : "secondary"}>
                            {link.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(link.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {link.response_count || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyLink(link)}
                              title="Copy link"
                            >
                              {copiedLinkId === link.id ? (
                                <CopyCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clipboard className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteLink(link.id)}
                              title="Delete link"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 