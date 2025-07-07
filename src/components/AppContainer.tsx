import Footer from './Footer'

interface AppContainerProps {
  children: React.ReactNode
}

export default function AppContainer({ children }: AppContainerProps) {
  return (
    <div className="m-2 sm:m-4 border-3 border-black rounded-lg min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-32px)] flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      <Footer />
    </div>
  )
}