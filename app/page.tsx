"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LMStudioAPI } from "@/lib/api";
import { MenuIcon, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [endpoint, setEndpoint] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [api, setApi] = useState<LMStudioAPI | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("");
  const [isHttps, setIsHttps] = useState(false);

  useEffect(() => {
    setIsHttps(window.location.protocol === "https:");
  }, []);

  const handleConnect = async () => {
    if (!endpoint) {
      toast.error("Please enter an endpoint URL");
      return;
    }

    // Check if trying to connect to HTTP endpoint from HTTPS
    if (isHttps && endpoint.startsWith("http://")) {
      toast.error(
        "Cannot connect to HTTP endpoint from HTTPS. Please use the HTTP version of this site."
      );
      return;
    }

    try {
      const newApi = new LMStudioAPI(endpoint);
      const connected = await newApi.testConnection();

      if (connected) {
        setApi(newApi);
        setIsConnected(true);
        toast.success("Connected to LM Studio API");
      } else {
        toast.error("Failed to connect to LM Studio API");
      }
    } catch (error) {
      toast.error("Error connecting to LM Studio API");
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
              {isConnected ? "Connected" : "Connect"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {isConnected ? (
            <Chat api={api!} selectedModel={selectedModel} />
          ) : (
            <div className="h-full flex items-center justify-center flex-col gap-4 p-4 text-center">
              {isHttps && (
                <Alert variant="destructive" className="max-w-xl mb-4">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>HTTPS Connection Warning</AlertTitle>
                  <AlertDescription>
                    You are currently using the HTTPS version of this site. To
                    connect to a local LM Studio instance (HTTP), please{" "}
                    <a
                      href={window.location.href.replace("https://", "http://")}
                      className="underline font-medium"
                    >
                      switch to the HTTP version
                    </a>
                    .
                  </AlertDescription>
                </Alert>
              )}
              <h1 className="text-2xl font-bold">
                Welcome to LM Studio Chat Interface
              </h1>
              <p className="text-muted-foreground max-w-md">
                Please enter your LM Studio API endpoint to get started. For
                local usage, use something like http://192.168.1.10:8080.{" "}
                {isHttps &&
                  "Note: Local connections require using the HTTP version of this site."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
