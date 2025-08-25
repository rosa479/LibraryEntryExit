import React, { useEffect, useState } from 'react'

const CurrentInfo = () => {
  const [data, setData] = useState(null)

  // Fetch function
  const fetchData = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]
      console.log("here");

      const response = await fetch(`/api/analytics/day/${today}`)
      console.log("here");
      const result = await response.json()
      setData(result)
      console.log("Fetched data:", result)
    } catch (error) {
      console.log("Here")
      console.error("Error fetching data:", error)
    } 
  }

  useEffect(() => {
    console.log("Fetching data...");
    fetchData()
  })

  // Show loading state until data is ready
  if (!data) {
    return <p className="text-center pt-10">Loading...</p>
  }

  return (
    <div className='flex items-center justify-around max-w-6xl mx-auto pt-10'>
        <div className='min-w-50 border p-3 bg-white rounded-lg shadow-md'>
            <p className='font-bold text-xl'>Checked In Today</p>
            <p>{data.totalEntries}</p>
        </div>
        <div>
            <p>Current In</p>
            <p>{data.totalUniqueStudents}</p>
        </div>
        <div>
            <p>Laptop Users</p>
            <p>{data.laptopUsersCount}</p>
        </div>
        <div>
            <p>Average Stay</p>
            <p>{data.avgStayMinutes} min</p>
        </div>
    </div>
  )
}

export default CurrentInfo
