import './App.css'
import Map from './components/Map'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Map />
      </QueryClientProvider>
    </div>
  )
}

export default App
