import { ReactElement } from 'react'
import './App.css'
import { Header } from './components/header'
import { Demo } from './components/demo'



export default function App(): ReactElement {
  return (
    <>
      <Header></Header>
      <Demo></Demo>
    </>
  )
}
