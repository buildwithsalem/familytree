import { useInvites, useCreateInvite } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const { data: user } = useUser();
  const { data: invites, isLoading } = useInvites();
  const { mutate: createInvite, isPending } = useCreateInvite();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-destructive">Access Denied</div>;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createInvite({ email }, { onSuccess: () => setEmail("") });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Invite code copied to clipboard." });
  };

  return (
    <div className="space-y-8 animate-enter max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and invitations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Invitation</CardTitle>
          <CardDescription>Generate a new invite code for a family member</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input 
              placeholder="Enter email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Code
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites?.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell className="font-mono text-xs">{invite.code}</TableCell>
                    <TableCell>
                      {invite.usedAt ? (
                        <span className="text-muted-foreground bg-muted px-2 py-1 rounded-full text-xs">Used</span>
                      ) : (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-bold">Active</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                       {new Date(invite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!invite.usedAt && (
                        <Button variant="ghost" size="icon" onClick={() => copyCode(invite.code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {invites?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No invites created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
