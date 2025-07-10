export interface Place {
  name: string
  category: string
  city: string
  address: string
  lat: number
  lng: number
  phone: string
  website: string
  google_rating: string
  price_level: string
  opening_hours: string
  tags: string[]
  review_snippets: string[]
  last_checked: string
  media: string[]
}

export interface Token {
  token: string
  peso: number
  familia: string
}

export interface RankRequest {
  mood: string | string[]
  city: string
}

export interface RankResponse {
  places: Place[]
  explanation?: string
}

export interface ExplainRequest {
  mood: string
  place: Place
}

export interface ExplainResponse {
  explanation: string
}

export interface StoryCardProps {
  place: Place
  explanation: string
  onSwipe?: () => void
}
