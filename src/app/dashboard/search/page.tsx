'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { enhancedTopicSearch, EnhancedTopicSearchOutput } from '@/ai/flows/enhanced-topic-search';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [query, setQuery] = useState("Newton's Laws of Motion");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<EnhancedTopicSearchOutput | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setResult(null);
    try {
      const response = await enhancedTopicSearch({ topic: query });
      setResult(response);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Could not perform search.",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const SearchSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Topic Search</CardTitle>
          <CardDescription>Enter a topic to get an AI-powered summary and relevant links.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., Quantum Physics, Cellular Respiration"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !query}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline ml-2">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isSearching && <SearchSkeleton />}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>AI Summary for &ldquo;{query}&rdquo;</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="prose dark:prose-invert max-w-none">
                <p>{result.summary}</p>
             </div>
             {result.references && result.references.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">References</h3>
                    <ul className="space-y-3">
                        {result.references.map((ref, index) => (
                            <li key={index}>
                                <Link href={ref.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                   <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary"/>
                                   <div>
                                     <p className="font-medium text-primary group-hover:underline">{ref.title}</p>
                                     <p className="text-xs text-muted-foreground truncate">{ref.url}</p>
                                   </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
             )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
