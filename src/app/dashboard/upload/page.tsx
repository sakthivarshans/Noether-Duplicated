
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Zap, BrainCircuit, BarChart3, Loader2, RotateCw } from 'lucide-react';
import { summarizeAndHighlightDocument, SummarizeAndHighlightDocumentOutput } from '@/ai/flows/summarize-and-highlight-document';
import { generateFlashcardsFromDocument } from '@/ai/flows/generate-flashcards-from-document';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

type Flashcard = {
  front: string;
  back: string;
}

export default function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummarizeAndHighlightDocumentOutput | null>(null);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
      setGeneratedFlashcards([]);
      setUploadProgress(0); // Start progress at 0

      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentage);
        }
      };

      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
        setUploadProgress(100); // Ensure it completes
        setTimeout(() => setUploadProgress(null), 1000); // Hide progress bar after a short delay
      };

      reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Reading Error",
            description: "There was an error reading your file.",
        });
        setUploadProgress(null);
      }

      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileDataUri) return;
    setIsProcessing(true);
    setResult(null);
    setGeneratedFlashcards([]);
    try {
        const response = await summarizeAndHighlightDocument({ documentDataUri: fileDataUri });
        setResult(response);
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not process document. The model may not be able to read this file type.",
        });
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleGenerateFlashcards = async () => {
    if(!result || !result.summary) return;
    setIsGeneratingFlashcards(true);
    try {
      const flashcardResult = await generateFlashcardsFromDocument({ documentContent: `${result.summary}\n\n${result.highlights.join('\n')}` });
      setGeneratedFlashcards(flashcardResult.flashcards);
      setFlippedStates(new Array(flashcardResult.flashcards.length).fill(false));
      toast({
        title: 'Flashcards Generated!',
        description: `Successfully created ${flashcardResult.flashcards.length} flashcards.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not generate flashcards.",
      });
    } finally {
        setIsGeneratingFlashcards(false);
    }
  }

  const handleCardClick = (index: number) => {
    setFlippedStates(prev => {
        const newFlipped = [...prev];
        newFlipped[index] = !newFlipped[index];
        return newFlipped;
    });
  }

  const InsightsSkeleton = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Upload a .pptx or .pdf file to get an AI-powered summary, highlights, and flashcards.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full">
            <label htmlFor="file-upload" className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary">
              <span className="flex items-center space-x-2">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">
                  {fileName || "Drag & drop a file or click to upload"}
                </span>
              </span>
              <Input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.pptx" />
            </label>
            {uploadProgress !== null && (
              <div className="mt-2 w-full">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>
          <Button onClick={handleUpload} disabled={!fileName || isProcessing || uploadProgress !== null} className="w-full sm:w-auto">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isProcessing ? 'Processing...' : 'Generate Insights'}
          </Button>
        </CardContent>
      </Card>

      {isProcessing && <InsightsSkeleton />}

      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5" /> Key Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                {result.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5" /> Generated Flashcards</CardTitle>
                <CardDescription>Click the button to generate flashcards from the summary.</CardDescription>
              </div>
              <Button onClick={handleGenerateFlashcards} variant="outline" size="sm" disabled={isGeneratingFlashcards}>
                {isGeneratingFlashcards ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                {isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedFlashcards.length > 0 ? (
                generatedFlashcards.map((flashcard, index) => (
                  <div key={index} className="perspective-1000 h-64" onClick={() => handleCardClick(index)}>
                      <div className={`relative w-full h-full text-left transition-transform duration-700 transform-style-3d ${flippedStates[index] ? 'rotate-y-180' : ''}`}>
                          {/* Front of card */}
                          <Card className="absolute w-full h-full backface-hidden flex flex-col justify-between">
                              <div>
                                <CardHeader>
                                    <CardTitle className="text-lg">Question</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{flashcard.front}</p>
                                </CardContent>
                              </div>
                              <CardFooter>
                                <p className="text-xs text-muted-foreground flex items-center"><RotateCw className="w-3 h-3 mr-1"/> Click to flip</p>
                              </CardFooter>
                          </Card>
                          {/* Back of card */}
                          <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between bg-secondary">
                              <div>
                                <CardHeader>
                                    <CardTitle className="text-lg">Insights</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{flashcard.back}</p>
                                </CardContent>
                              </div>
                              <CardFooter>
                                <p className="text-xs text-muted-foreground flex items-center"><RotateCw className="w-3 h-3 mr-1"/> Click to flip</p>
                              </CardFooter>
                          </Card>
                      </div>
                  </div>
                ))
              ) : (
                isGeneratingFlashcards ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="h-64">
                            <CardHeader>
                                <Skeleton className="h-5 w-20" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5 mt-2" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground col-span-full text-center py-8">No flashcards generated yet.</p>
                )
              )}
            </CardContent>
          </Card>

          {result.flowchart && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Flowchart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{result.flowchart}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      <style jsx>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}

    
