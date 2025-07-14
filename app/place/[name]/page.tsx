import type { Metadata } from "next"
import PlaceDetailPage from "./PlaceDetailPage"

interface Props {
  params: { name: string }
  searchParams: { city?: string }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const placeName = decodeURIComponent(params.name)
  const city = searchParams.city || "Unknown City"

  return {
    title: `${placeName} - ${city} | YourCityVibes`,
    description: `Discover ${placeName} in ${city}. Find the perfect vibe for your next adventure.`,
  }
}

export default function Page({ params, searchParams }: Props) {
  return <PlaceDetailPage params={params} searchParams={searchParams} />
}
