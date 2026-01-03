import './globals.css'

export const metadata = {
  title: 'CalorieFit - Track Your Nutrition',
  description: 'Track calories, achieve your goals, and transform your health journey',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}