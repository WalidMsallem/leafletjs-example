import './App.css'
import RestaurantMap from './components/Map'

const companyName = "ComplyCube";
const companyPosition: [number, number] = [51.5074, -0.1278]; 

function App() {
  return (
    <div className="App">
        <RestaurantMap companyName={companyName} companyPosition={companyPosition} />
    </div>
  )
}

export default App
