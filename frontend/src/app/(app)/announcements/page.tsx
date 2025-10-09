import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { announcements } from '@/lib/data/announcements'
import { Megaphone } from 'lucide-react'
import AnnouncementsClient from './partials/AnnouncementsClient'

export const metadata = { title: 'Announcements' }

export default function AnnouncementsPage(){
  return <AnnouncementsClient announcements={announcements} />
}