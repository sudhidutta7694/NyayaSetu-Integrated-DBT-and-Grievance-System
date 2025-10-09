import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export const metadata = { title: 'Profile' }

export default function ProfilePage(){
  // Mock user
  const user = { fullName:'John Doe', phone:'+91 9876543210', district:'Pune', verified:true }
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-sky-600" />
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide text-gray-600">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" value={user.fullName} />
            <Field label="Phone" value={user.phone} />
            <Field label="District" value={user.district} />
            <Field label="Verification" value={user.verified? 'Verified':'Pending'} valueClass={user.verified? 'text-green-600':'text-amber-600'} />
          </div>
          <div className="pt-4 flex gap-3">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Edit Profile</Button>
            <Button size="sm" variant="outline">Download Profile (PDF)</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-wide text-gray-600">Security & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-xs text-gray-500">Additional settings (language, notification channels, 2FA) will appear here.</p>
          <Button size="sm" variant="secondary">Manage Notifications</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value, valueClass }: { label:string; value:string; valueClass?:string }){
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{label}</p>
      <p className={`font-medium text-gray-900 ${valueClass||''}`}>{value}</p>
    </div>
  )
}