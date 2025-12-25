import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPerson, type InsertRelationship, type InsertMedia } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function usePeople(search?: string, tag?: string, living?: string) {
  const queryKey = [api.people.list.path, search, tag, living].filter(Boolean);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (tag) params.append("tag", tag);
      if (living) params.append("living", living);

      const url = `${api.people.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch people");
      return api.people.list.responses[200].parse(await res.json());
    },
  });
}

export function usePerson(id: number) {
  return useQuery({
    queryKey: [api.people.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.people.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch person");
      return api.people.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertPerson) => {
      // Coerce dates to ISO string dates if needed, handled by zod
      const res = await fetch(api.people.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create person");
      return api.people.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      toast({ title: "Person added", description: "Successfully added new family member." });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertPerson>) => {
      const url = buildUrl(api.people.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update person");
      return api.people.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, id] });
      toast({ title: "Updated", description: "Person details updated successfully." });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.people.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete person");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.people.list.path] });
      toast({ title: "Deleted", description: "Person removed from family tree." });
    },
  });
}

export function useAddRelationship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertRelationship) => {
      const res = await fetch(api.relationships.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add relationship");
      return api.relationships.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { fromPersonId, toPersonId }) => {
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, fromPersonId] });
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, toPersonId] });
      toast({ title: "Connected", description: "Family relationship established." });
    },
  });
}

export function useAddMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertMedia) => {
      const res = await fetch(api.media.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add media");
      return api.media.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { personId }) => {
      queryClient.invalidateQueries({ queryKey: [api.people.get.path, personId] });
      toast({ title: "Media added", description: "Photo/Video added to gallery." });
    },
  });
}
