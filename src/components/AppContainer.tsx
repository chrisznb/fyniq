import Footer from './Footer'

interface AppContainerProps {
  children: React.ReactNode
}

export default function AppContainer({ children }: AppContainerProps) {
  return (
    <div className="m-4 border-3 border-black rounded-lg h-[calc(100vh-32px)] flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      <Footer />
    </div>
  )
}