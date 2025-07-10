import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { generatePlaceholderDataURL } from "./placeholders"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export function getPlaceholderImage(placeName: string, category: string): string {
  return generatePlaceholderDataURL(placeName, category)
}

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function generateMapsUrl(lat: number, lng: number, name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`
}

export function generateInstagramDMUrl(placeName: string): string {
  return `https://www.instagram.com/direct/new/?text=${encodeURIComponent(`Hola! Vi ${placeName} en YourCityVibes y me interesa saber más 🔥`)}`
}
