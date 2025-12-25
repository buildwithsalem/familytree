import { usePeople, useCreatePerson } from "@/hooks/use-people";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Filter, User } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonSchema } from "@shared/schema";
import { z } from "zod";

export default function PeopleList() {
  const [search, setSearch] = useState("");
  const [filterLiving, setFilterLiving] = useState<string>("all");
  const { data: people, isLoading } = usePeople(search, undefined, filterLiving === "all" ? undefined : filterLiving);
  const { mutate: createPerson, isPending: isCreating } = useCreatePerson();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<z.infer<typeof insertPersonSchema>>({
    resolver: zodResolver(insertPersonSchema),
    defaultValues: {
      isLiving: true,
      gender: "MALE"
    }
  });

  const onSubmit = (data: z.infer<typeof insertPersonSchema>) => {
    createPerson(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Family Directory</h1>
          <p className="text-muted-foreground">Browse all recorded family members</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary">Add New Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...form.register("fullName")} placeholder="e.g. Adebayo Falohun" />
                  {form.formState.errors.fullName && <p className="text-destructive text-sm">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nickname (Optional)</Label>
                  <Input {...form.register("nickname")} placeholder="e.g. Bayo" />
                </div>
                <div className="space-y-2">
                  <Label>Maiden Name (Optional)</Label>
                  <Input {...form.register("maidenName")} placeholder="For married women" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={(v) => form.setValue("gender", v)} defaultValue="MALE">
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" {...form.register("birthDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Birth Place</Label>
                  <Input {...form.register("birthPlace")} placeholder="City, Country" />
                </div>
                <div className="space-y-2">
                  <Label>Current City</Label>
                  <Input {...form.register("currentCity")} placeholder="Where they live now" />
                </div>
              </div>

              <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                <Switch 
                  id="is-living" 
                  checked={form.watch("isLiving")}
                  onCheckedChange={(checked) => form.setValue("isLiving", checked)}
                />
                <Label htmlFor="is-living" className="cursor-pointer">This person is living</Label>
              </div>

              {!form.watch("isLiving") && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>Date of Death</Label>
                  <Input type="date" {...form.register("deathDate")} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Biography / Notes</Label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...form.register("biography")} 
                  placeholder="Share a short bio or memory..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-background" 
            placeholder="Search by name, city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterLiving} onValueChange={setFilterLiving}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="true">Living Only</SelectItem>
              <SelectItem value="false">Deceased Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : people?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
          <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">No members found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new person.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people?.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 relative">
                   <div className="absolute -bottom-8 left-6">
                     <div className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center bg-secondary/50 text-xl font-display font-bold text-primary">
                        {person.fullName.charAt(0)}
                     </div>
                   </div>
                </div>
                <CardContent className="pt-10 pb-6 px-6 flex-1">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{person.fullName}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    {person.birthDate && <p>Born: {person.birthDate}</p>}
                    {person.currentCity && <p>Lives in: {person.currentCity}</p>}
                    {person.maidenName && <p>Maiden Name: {person.maidenName}</p>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${person.isLiving ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {person.isLiving ? 'Living' : 'Deceased'}
                     </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
