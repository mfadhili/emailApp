import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Users, Send, FileText, ArrowRight, Plus, BarChart3 } from "lucide-react"

export default function Dashboard() {
  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to EmailFlow</h1>
            <p className="text-muted-foreground mt-2">Your email marketing dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/compose">
              <Button className="bg-blue hover:bg-blue-dark">
                <Send className="mr-2 h-4 w-4" />
                Compose Email
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue/10 to-blue/5 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <div className="rounded-full bg-blue/20 p-2">
                <Users className="h-4 w-4 text-blue" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">0 added this month</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green/10 to-green/5 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <div className="rounded-full bg-green/20 p-2">
                <FileText className="h-4 w-4 text-green" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">0 created this month</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-light/10 to-blue-light/5 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <div className="rounded-full bg-blue-light/20 p-2">
                <Send className="h-4 w-4 text-blue-light" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">0 sent this month</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green-accent/10 to-green-accent/5 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <div className="rounded-full bg-green-accent/20 p-2">
                <BarChart3 className="h-4 w-4 text-green-accent" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground mt-1">0% change from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your email marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link href="/contacts" className="w-full">
                  <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center gap-1 border-dashed"
                  >
                    <Users className="h-5 w-5 text-blue" />
                    <span>Manage Contacts</span>
                  </Button>
                </Link>
                <Link href="/templates" className="w-full">
                  <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center gap-1 border-dashed"
                  >
                    <FileText className="h-5 w-5 text-green" />
                    <span>Email Templates</span>
                  </Button>
                </Link>
                <Link href="/broadcasts" className="w-full">
                  <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center gap-1 border-dashed"
                  >
                    <Send className="h-5 w-5 text-blue-light" />
                    <span>View Broadcasts</span>
                  </Button>
                </Link>
                <Link href="/analytics" className="w-full">
                  <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center gap-1 border-dashed"
                  >
                    <BarChart3 className="h-5 w-5 text-green-accent" />
                    <span>Analytics</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Recent Broadcasts</CardTitle>
              <CardDescription>Your recently sent email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No broadcasts sent yet</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Start sending email campaigns to your contacts to see your broadcast history here.
                </p>
                <Link href="/broadcasts/new">
                  <Button className="bg-blue hover:bg-blue-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Broadcast
                  </Button>
                </Link>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-4">
              <Link
                  href="/broadcasts"
                  className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all broadcasts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}
