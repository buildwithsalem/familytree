import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export default function MessageThreadPage() {
  const { id } = useParams();
  const threadId = Number(id);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<any[]>({
    queryKey: [`/api/messages/thread/${threadId}`],
    queryFn: async () => {
      const res = await fetch(`/api/messages/thread/${threadId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  const { data: user } = useQuery<any>({ queryKey: [api.auth.me.path] });

  const mutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(buildUrl(api.messages.reply.path, { threadId }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/thread/${threadId}`] });
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: { body: "" },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) return <div className="p-8">Loading conversation...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-display font-bold mb-6">Conversation #{threadId}</h1>
      
      <Card className="flex-1 overflow-hidden flex flex-col mb-4">
        <CardContent 
          ref={scrollRef}
          className="p-6 overflow-y-auto space-y-4 flex-1"
        >
          {messages?.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.senderUserId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-lg ${
                msg.senderUserId === user?.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p>{msg.body}</p>
                <p className="text-[10px] opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit((data) => mutation.mutate(data.body))}
          className="flex gap-2"
        >
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Type your message..." 
                    className="min-h-[60px] resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={mutation.isPending || !form.watch("body")}
            className="self-end h-default"
          >
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}
