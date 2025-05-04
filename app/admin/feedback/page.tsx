import { redirect } from 'next/navigation';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { TABLES } from '@/utils/constants/database';

export default async function FeedbackAdminPage() {
  const supabase = await getServerComponentClient();
  
  // Check if user is authenticated and has admin role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login?redirect=/admin/feedback');
  }
  
  // Fetch feedback forms
  const { data: forms, error: formsError } = await supabase
    .from('feedback_forms')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (formsError) {
    console.error('Error fetching feedback forms:', formsError);
  }
  
  // Fetch feedback session count
  const { data: sessionCount, error: sessionCountError } = await supabase
    .from('feedback_sessions')
    .select('id', { count: 'exact', head: true });
  
  if (sessionCountError) {
    console.error('Error fetching session count:', sessionCountError);
  }
  
  // Fetch latest feedback responses
  const { data: latestResponses, error: responsesError } = await supabase
    .from('feedback_responses')
    .select(`
      id,
      value,
      created_at,
      feedback_sessions!inner (
        id,
        form_id,
        respondent_id,
        metadata
      ),
      feedback_questions!inner (
        id,
        title,
        question_type
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (responsesError) {
    console.error('Error fetching latest responses:', responsesError);
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Feedback Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-medium mb-2">Forms</h3>
          <p className="text-3xl font-bold">{forms?.length || 0}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-medium mb-2">Responses</h3>
          <p className="text-3xl font-bold">{(sessionCount as any)?.count || 0}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-medium mb-2">Latest Response</h3>
          <p className="text-lg">
            {latestResponses && latestResponses.length > 0 
              ? new Date(latestResponses[0].created_at).toLocaleString() 
              : 'No responses yet'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Forms</h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {forms && forms.length > 0 ? (
                    forms.map((form) => (
                      <tr key={form.id} className="border-t">
                        <td className="px-4 py-3">{form.title}</td>
                        <td className="px-4 py-3">{form.feedback_type}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {form.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{new Date(form.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground">No forms found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Responses</h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Question</th>
                    <th className="px-4 py-3 text-left font-medium">Response</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {latestResponses && latestResponses.length > 0 ? (
                    latestResponses.map((response) => (
                      <tr key={response.id} className="border-t">
                        <td className="px-4 py-3">{(response.feedback_questions as any).title}</td>
                        <td className="px-4 py-3">{
                          typeof response.value === 'object' 
                            ? JSON.stringify(response.value) 
                            : String(response.value)
                        }</td>
                        <td className="px-4 py-3">{new Date(response.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-muted-foreground">No responses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 