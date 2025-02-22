"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LMStudioAPI } from '@/lib/api';
import { LMStudioModel } from '@/lib/types';
import { PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  api: LMStudioAPI | null;
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export function Sidebar({ isOpen, onClose, api, selectedModel, onModelSelect }: SidebarProps) {
  const [models, setModels] = useState<LMStudioModel[]>([]);

  useEffect(() => {
    if (api) {
      loadModels();
    }
  }, [api]);

  const loadModels = async () => {
    try {
      const response = await api!.getModels();
      setModels(response.data.map((model: any) => ({
        id: model.id,
        name: model.id.split('/').pop(),
      })));
    } catch (error) {
      toast.error('Failed to load models');
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">LM Studio Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <Select value={selectedModel} onValueChange={onModelSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="w-full mt-4" onClick={() => {}}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Conversation history will go here */}
      </ScrollArea>
    </div>
  );
}