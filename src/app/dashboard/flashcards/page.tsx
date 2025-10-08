
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Zap, BrainCircuit, Loader2, RotateCw } from 'lucide-react';
import { generateFlashcardsFromDocument, GenerateFlashcardsFromDocumentOutput } from '@/ai/flows/generate-flashcards-from-document';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlashcardsPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerateFlashcardsFromDocumentOutput | null>(null);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const fileContent = loadEvent.target?.result as string;
        // For simplicity, we are assuming text content.
        // For PDF/DOCX, more complex parsing is needed.
        // We'll use a simplified version for this example.
        if (file.type === "application/pdf" || file.type.includes("word")) {
             // In a real app, you would use a library like pdf.js or mammoth.js to extract text.
             // For this prototype, we'll just use a placeholder.
             setDocumentContent(`Content of ${file.name}`);
        } else {
            setDocumentContent(fileContent);
        }
        
      };
      if (file.type === "application/pdf" || file.type.includes("word")) {
        reader.readAsDataURL(file); // Reading as data URL for simplicity
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleGenerate = async () => {
    if (!documentContent) return;
    setIsProcessing(true);
    try {
      const response = await generateFlashcardsFromDocument({ documentContent });
      setResult(response);
      setFlippedStates(new Array(response.flashcards.length).fill(false));
    } catch (e) {
      console.error(e);
      // You might want to show a toast notification here
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
          </div>
          <Button onClick={handleGenerate} disabled={!fileName || isProcessing} className="w-full sm:w-auto">
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
                                 <CardTitle className="text-lg">Answer</CardTitle>
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
