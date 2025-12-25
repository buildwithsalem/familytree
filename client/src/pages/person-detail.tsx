import { usePerson, useAddRelationship, useDeletePerson } from "@/hooks/use-people";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Trash2, Heart, Share2, Link as LinkIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@shared/routes";

export default function PersonDetail() {
  const [match, params] = useRoute("/people/:id");
  const [, setLocation] = useLocation();
  const id = parseInt(params?.id || "0");
  const { data: person, isLoading } = usePerson(id);
  const { mutate: addRelationship } = useAddRelationship();
  const { mutate: deletePerson } = useDeletePerson();

  const [isRelOpen, setIsRelOpen] = useState(false);
  const [relType, setRelType] = useState("CHILD");
  const [targetId, setTargetId] = useState("");

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!person) return <div className="p-8 text-center">Person not found</div>;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this person? This cannot be undone.")) {
      deletePerson(id, { onSuccess: () => setLocation("/people") });
    }
  };

  const handleAddRelation = () => {
    if (!targetId) return;
    addRelationship({
      fromPersonId: person.id,
      toPersonId: parseInt(targetId),
      type: relType as any,
    }, {
      onSuccess: () => setIsRelOpen(false)
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-enter">
      <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:text-primary" onClick={() => setLocation("/people")}>
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </Button>

      {/* Header Profile */}
      <div className="relative bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary to-primary/80"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
             <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center bg-muted text-4xl font-display font-bold text-muted-foreground overflow-hidden">
                {person.profileImageUrl ? (
                  <img src={person.profileImageUrl} alt={person.fullName} className="w-full h-full object-cover" />
                ) : (
                  person.fullName.charAt(0)
                )}
             </div>
             <div className="flex-1 space-y-2 pt-16 md:pt-0">
               <h1 className="text-4xl font-display font-bold text-foreground">{person.fullName}</h1>
               <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                 {person.nickname && <span className="flex items-center gap-1">Known as <strong>{person.nickname}</strong></span>}
                 <span>•</span>
                 <span>{person.gender}</span>
                 <span>•</span>
                 <span>{person.currentCity || "Unknown Location"}</span>
               </div>
             </div>
             <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" /> Edit Profile
                </Button>
                <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t pt-8">
             <div className="space-y-1">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Born</span>
               <p className="text-lg font-medium">{person.birthDate || "Unknown"}</p>
               <p className="text-sm text-muted-foreground">{person.birthPlace}</p>
             </div>
             {!person.isLiving && (
               <div className="space-y-1">
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Died</span>
                 <p className="text-lg font-medium">{person.deathDate || "Unknown"}</p>
               </div>
             )}
             <div className="space-y-1">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Family ID</span>
               <p className="font-mono text-sm text-muted-foreground">FAM-{person.id.toString().padStart(4, '0')}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {person.biography || "No biography added yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Family Relationships</CardTitle>
              <Dialog open={isRelOpen} onOpenChange={setIsRelOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Relationship</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                     <div className="space-y-2">
                       <Label>Relationship Type</Label>
                       <Select value={relType} onValueChange={setRelType}>
                         <SelectTrigger><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="PARENT">Parent</SelectItem>
                           <SelectItem value="CHILD">Child</SelectItem>
                           <SelectItem value="SPOUSE">Spouse</SelectItem>
                           <SelectItem value="SIBLING">Sibling</SelectItem>
                         </SelectContent>
                       </Select>
                       <p className="text-sm text-muted-foreground">
                         {person.fullName} is the <strong>{relType}</strong> of...
                       </p>
                     </div>
                     <div className="space-y-2">
                        <Label>Target Person ID (Temporary)</Label>
                        <input 
                          className="w-full border rounded p-2" 
                          placeholder="Enter ID" 
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">In a real app this would be a search dropdown.</p>
                     </div>
                     <Button onClick={handleAddRelation} className="w-full">Save Relationship</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {person.relationshipsFrom?.length === 0 && person.relationshipsTo?.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No relationships recorded.</p>
              ) : (
                <div className="space-y-4">
                  {/* Simplistic rendering for now */}
                  {person.relationshipsFrom?.map(rel => (
                    <div key={rel.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">?</div>
                      <div>
                         <p className="font-medium">Is {rel.type.toLowerCase()} of Person #{rel.toPersonId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Media & Meta */}
        <div className="space-y-8">
           <Card>
             <CardHeader>
               <CardTitle className="font-display">Media Gallery</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="grid grid-cols-2 gap-2">
                   {/* Placeholder for media */}
                   <div className="aspect-square bg-muted rounded-md flex items-center justify-center text-muted-foreground/50 border-2 border-dashed">
                      <Plus className="h-6 w-6" />
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/10">
             <CardHeader>
               <CardTitle className="font-display text-primary text-lg">Cultural Notes</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm text-muted-foreground italic">
                 {person.culturalNotes || "No specific cultural notes added."}
               </p>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
