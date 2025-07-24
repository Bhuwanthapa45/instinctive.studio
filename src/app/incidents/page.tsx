import IncidentList from '@/components/IncidentList'
import Navbar from '@/components/Navbar'
import React from 'react'

const page = () => {
  return (
    <>
    <Navbar/>
    
    <div className='bg-[#111111] h-[100vh] p-[20vh]'>
      <IncidentList/>
    </div>
    </>
  )
}

export default page
