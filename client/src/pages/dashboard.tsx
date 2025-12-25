import { useUser } from "@/hooks/use-auth";
import { usePeople } from "@/hooks/use-people";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Plus, Search, Calendar, Heart } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: people } = usePeople();

  if (!user) return null;

  const recentPeople = people?.slice(0, 5) || [];
  const totalMembers = people?.length || 0;
  const livingMembers = people?.filter(p => p.isLiving).length || 0;

  return (
    <div className="space-y-8 animate-enter">
      {/* Welcome Hero */}
      <section className="bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        {/* Unsplash: Abstract family/tree concept texture */}
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user.profile?.displayName || user.username}
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-xl">
            The Falohun family tree continues to grow. We have recorded {totalMembers} family members across generations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/people">
              <Button size="lg" variant="secondary" className="gap-2 text-primary font-semibold">
                <Search className="h-4 w-4" />
                Browse Directory
              </Button>
            </Link>
            <Link href="/tree">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                View Family Tree
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Registered in database</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Living Members</CardTitle>
            <Heart className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{livingMembers}</div>
            <p className="text-xs text-muted-foreground">Current generation</p>
          </CardContent>
        </Card>

        {/* Placeholder stats */}
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Media Items</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Photos & memories</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-primary">Recently Added</h2>
          <Link href="/people">
            <Button variant="link" className="text-primary">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPeople.map((person) => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
                <div className="h-32 bg-secondary/30 relative">
                   <div className="absolute -bottom-8 left-6">
                     <div className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center bg-muted text-2xl font-display font-bold text-muted-foreground">
                        {person.fullName.charAt(0)}
                     </div>
                   </div>
                </div>
                <CardContent className="pt-10 pb-6 px-6">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{person.fullName}</h3>
                  {person.nickname && <p className="text-sm text-muted-foreground italic mb-2">"{person.nickname}"</p>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {person.isLiving ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Living</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">Deceased</span>
                    )}
                    {person.gender && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium capitalize">{person.gender.toLowerCase()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          <Link href="/people/new">
            <Card className="h-full min-h-[200px] flex flex-col items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <p className="font-medium text-muted-foreground">Add Family Member</p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
