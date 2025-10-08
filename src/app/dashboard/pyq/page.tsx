
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Zap, Clipboard, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAnswersForPYQ } from '@/ai/flows/generate-answers-for-pyq';
import { Skeleton } from '@/components/ui/skeleton';

export default function PYQPage() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text) return;
    setIsProcessing(true);
    setResult(null);
    try {
      const response = await generateAnswersForPYQ({ pyqContent: text });
      setResult(response.answers);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not generate answers.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast({
      title: 'Copied to clipboard!',
      description: 'The generated answers have been copied.',
    });
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pyq_answers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const fileContent = loadEvent.target?.result as string;
        // This is a simplified text extraction. For PDFs, a server-side extraction would be better.
        setText(fileContent);
      };
      reader.readAsText(file);
    }
  };

  const AnswerSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PYQ Answer Generator</CardTitle>
          <CardDescription>Paste the content of a PYQ file (or upload it) to get detailed, AI-generated answers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your questions here..."
            className="min-h-[200px] text-base"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="w-full sm:w-auto">
              <label htmlFor="file-upload" className="flex items-center cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Upload File
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md" />
              </label>
            </Button>
            <Button onClick={handleGenerate} disabled={!text || isProcessing} className="w-full sm:w-auto">
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              {isProcessing ? 'Generating...' : 'Generate Answers'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isProcessing && <AnswerSkeleton />}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Answers</CardTitle>
              <CardDescription>Here are the detailed answers for your questions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleCopy}><Clipboard className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none p-4 bg-secondary rounded-lg">
              <pre className="whitespace-pre-wrap bg-transparent p-0 font-body">{result}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
