
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Zap, Loader2, RotateCw } from 'lucide-react';
import { summarizeAndHighlightDocument, SummarizeAndHighlightDocumentOutput } from '@/ai/flows/summarize-and-highlight-document';
import { generateFlashcardsFromDocument, GenerateFlashcardsFromDocumentOutput } from '@/ai/flows/generate-flashcards-from-document';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function FlashcardsPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerateFlashcardsFromDocumentOutput | null>(null);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
      setUploadProgress(0);

      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentage);
        }
      };

      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1000);
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

  const handleGenerate = async () => {
    if (!fileDataUri) return;
    setIsProcessing(true);
    setResult(null);
    try {
      // Step 1: Get summary from the main summarization flow
      const summaryResponse = await summarizeAndHighlightDocument({ documentDataUri: fileDataUri });
      
      if (!summaryResponse || !summaryResponse.summary) {
        throw new Error("Could not generate a summary from the document.");
      }

      // Step 2: Generate flashcards from the summary
      const response = await generateFlashcardsFromDocument({ documentContent: summaryResponse.summary });
      setResult(response);
      setFlippedStates(new Array(response.flashcards.length).fill(false));
      toast({
        title: 'Flashcards Generated!',
        description: `Successfully created ${response.flashcards.length} flashcards from the document summary.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not generate flashcards. The document might be too large or in an unsupported format.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCardClick = (index: number) => {
    setFlippedStates(prev => {
        const newFlipped = [...prev];
        newFlipped[index] = !newFlipped[index];
        return newFlipped;
    });
  }

  const FlashcardSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
                <CardHeader>
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5 mt-2" />
                </CardContent>
            </Card>
        ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Flashcard Generator</CardTitle>
          <CardDescription>Upload a document to generate flashcards for studying.</CardDescription>
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
              <Input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.pptx,.txt,.md" />
            </label>
            {uploadProgress !== null && (
              <div className="mt-2 w-full">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={!fileName || isProcessing || uploadProgress !== null} className="w-full sm:w-auto">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isProcessing ? 'Generating...' : 'Generate Flashcards'}
          </Button>
        </CardContent>
      </Card>
      
      {isProcessing && <FlashcardSkeleton />}

      {result && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.flashcards.map((flashcard, index) => (
            <div key={index} className="perspective-[1000px] h-64" onClick={() => handleCardClick(index)}>
                <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d ${flippedStates[index] ? 'rotate-y-180' : ''}`}>
                    {/* Front of card */}
                    <Card className="absolute w-full h-full backface-hidden flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">Question</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center p-4">
                            <p>{flashcard.front}</p>
                        </CardContent>
                        <CardFooter>
                           <p className="text-xs text-muted-foreground flex items-center w-full justify-center"><RotateCw className="w-3 h-3 mr-1"/> Click to flip</p>
                        </CardFooter>
                    </Card>
                    {/* Back of card */}
                    <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col bg-secondary">
                        <CardHeader>
                             <CardTitle className="text-lg">Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center p-4">
                            <p>{flashcard.back}</p>
                        </CardContent>
                        <CardFooter>
                           <p className="text-xs text-muted-foreground flex items-center w-full justify-center"><RotateCw className="w-3 h-3 mr-1"/> Click to flip</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
          ))}
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
