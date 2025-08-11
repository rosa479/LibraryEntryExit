import React from 'react'

const dummy_data = [{checkedIn : 140} , {currentIn : 40} , {currentOut : 100} , {avgSaty : "1h44m"}]

const CurrentInfo = () => {
  return (
    <div className='flex items-center justify-around max-w-6xl mx-auto pt-10'>
        <div className='min-w-50 border p-3 bg-white rounded-lg shadow-md'>
            <p className='font-bold text-xl'>Checked In Today</p>
            <p>{dummy_data[0].checkedIn}</p>
        </div>
        <div>
            <p>Checked In Today</p>
            <p>{dummy_data[1].currentIn}</p>
        </div>
        <div>
            <p>Checked In Today</p>
            <p>{dummy_data[2].currentOut}</p>
        </div>
        <div>
            <p>Checked In Today</p>
            <p>{dummy_data[3].avgSaty}</p>
        </div>

    </div>
  )
}

export default CurrentInfo
