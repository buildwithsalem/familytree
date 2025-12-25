import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useLocation } from "wouter";

export default function InboxPage() {
  const [, setLocation] = useLocation();
  const { data: threads, isLoading } = useQuery<any[]>({
    queryKey: [api.messages.listThreads.path],
  });

  if (isLoading) return <div className="p-8">Loading inbox...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>
      <div className="grid gap-4">
        {threads?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No messages yet.
            </CardContent>
          </Card>
        ) : (
          threads?.map((thread) => (
            <Card 
              key={thread.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/messages/${thread.id}`)}
            >
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Conversation #{thread.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Started on {new Date(thread.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
