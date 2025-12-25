import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useInvites() {
  return useQuery({
    queryKey: [api.invites.list.path],
    queryFn: async () => {
      const res = await fetch(api.invites.list.path);
      if (!res.ok) throw new Error("Failed to fetch invites");
      return api.invites.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch(api.invites.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create invite");
      return api.invites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invites.list.path] });
      toast({ title: "Invite sent", description: "An invitation code has been generated." });
    },
  });
}
