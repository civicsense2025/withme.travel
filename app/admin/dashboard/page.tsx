import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl leading-loose font-bold">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>Select an option from the sidebar to manage site data.</CardDescription>
        </CardHeader>
      </Card>
      {/* Add more dashboard widgets or summaries here later */}
    </div>
  );
} 