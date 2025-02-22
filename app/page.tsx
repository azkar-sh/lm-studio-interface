"use client";

import { useState } from 'react';
import { Chat } from '@/components/chat';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LMStudioAPI } from '@/lib/api';
import { MenuIcon } from 'lucide-react';

export default function Home() {
  const [endpoint, setEndpoint] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [api, setApi] = useState<LMStudioAPI | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');

  const handleConnect = async () => {
    if (!endpoint) {
      toast.error('Please enter an endpoint URL');
      return;
    }

    try {
      const newApi = new LMStudioAPI(endpoint);
      const connected = await newApi.testConnection();

      if (connected) {
        setApi(newApi);
        setIsConnected(true);
        toast.success('Connected to LM Studio API');
      } else {
        toast.error('Failed to connect to LM Studio API');
      }
    } catch (error) {
      toast.error('Error connecting to LM Studio API');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        api={api}
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Enter LM Studio API endpoint (e.g., http://192.168.1.10:8080)"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleConnect} disabled={isConnected}>
              {isConnected ? 'Connected' : 'Connect'}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {isConnected ? (
            <Chat api={api!} selectedModel={selectedModel} />
          ) : (
            <div className="h-full flex items-center justify-center flex-col gap-4 p-4 text-center">
              <h1 className="text-2xl font-bold">Welcome to LM Studio Chat Interface</h1>
              <p className="text-muted-foreground max-w-md">
                Please enter your LM Studio API endpoint to get started. For local usage,
                use something like http://192.168.1.10:8080. For remote servers,
                use https://your-server.com:443
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}