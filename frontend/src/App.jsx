import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Tools from './components/Tools'
import ChatHero from './components/ChatHero'
import Footer from './components/Footer'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PlotCropSelector from './components/PlotCropSelector'
import WeatherForecastingPage from './pages/WeatherForecastingPage'
import DiseasePredictor from './components/DiseasePredictor'
import TranslationService from './utils/Translation'

function App() {
  const [count, setCount] = useState(0)

  return (
<div id='app'>
  <Navbar/>
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<HomePage/>}/>
    <Route path='/crop-selector' element={<PlotCropSelector/>}/>
    <Route path='/weather-forecasting' element={<WeatherForecastingPage/>}/>
    <Route path='/disease-detection' element={<DiseasePredictor/>}/>
  </Routes>
  </BrowserRouter>
  <TranslationService />
  <Footer/>
</div>
  )
}

export default App
