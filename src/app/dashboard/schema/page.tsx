'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import schemaData from '@/../docs/backend.json';
import { FileJson } from 'lucide-react';

export default function SchemaPage() {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileJson /> Firestore Backend Schema</CardTitle>
          <CardDescription>
            This page displays the intended structure of the Firestore database as defined in <code>docs/backend.json</code>. 
            This serves as the blueprint for the backend data model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-secondary rounded-lg text-sm overflow-auto">
            {JSON.stringify(schemaData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
