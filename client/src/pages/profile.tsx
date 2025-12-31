import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Bell, Shield } from "lucide-react";

export default function Profile() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 text-right" dir="rtl">
        <h1 className="text-3xl font-heading font-bold">הגדרות חשבון</h1>

        <Card className="border-none shadow-sm">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">ST</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 left-0 rounded-full w-8 h-8 shadow-md">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold">שרה ותום</h2>
              <p className="text-sm text-muted-foreground">הצטרפו בדצמבר 2025</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
               <Button variant="ghost" size="sm">עריכה</Button>
               <div className="flex items-center gap-4 text-right">
                <div>
                  <h4 className="font-medium">התראות</h4>
                  <p className="text-xs text-muted-foreground">נהלו את התראות התקציב שלכם</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <Button variant="ghost" size="sm">ניהול</Button>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <h4 className="font-medium">פרטיות ואבטחה</h4>
                  <p className="text-xs text-muted-foreground">חשבונות מחוברים ואבטחת נתונים</p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 justify-start h-12 flex-row-reverse">
            <LogOut className="w-5 h-5 ml-3" /> התנתקות
          </Button>
        </div>
      </div>
    </Layout>
  );
}
