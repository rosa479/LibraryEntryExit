const express = require("express")
const pool = require('../db')
const router = express.Router()

function getDateRange(year, month, day) {
    const start = new Date(`${year}-${month || '01'}-${day || '01'}T00:00:00`)
    const end = new Date(start)
    if (day) {
      end.setDate(end.getDate() + 1)
    } else if (month) {
      end.setMonth(end.getMonth() + 1)
    } else {
      end.setFullYear(end.getFullYear() + 1)
    }
    return { start, end }
}

router.get('/history/:roll', async (req, res) => {
    const { roll } = req.params
    try {
        const result = await pool.query(
        `SELECT * FROM logs WHERE roll = $1 ORDER BY event_time ASC`,
        [roll]
        )

        const sessions = []
        for (let i = 0; i < result.rows.length; i++) {
            const row = results.rows[i]
            if (row.event_type === 'entry') {
                const exit = result.rows[i+1]
                if (exit && exit.event_type === 'exit') {
                    sessions.push({
                        entryTime: row.event_time,
                        exitTime: exit.event_time,
                        duration: exit.stay_duration,
                        laptop: row.laptop,
                        books: row.books
                    })
                    i++
                }
            }
        }

        res.json({ roll, sessions })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error : 'Internal server error' })
    }
})

router.get('/current', async (req, res) => {
    try {
        const results = await pool.query(`
      SELECT s.roll, s.name, l.event_time AS entry_time, l.laptop
      FROM logs l
      JOIN students s ON s.roll = l.roll
      WHERE l.event_type = 'entry'
      AND NOT EXISTS (
        SELECT 1 FROM logs l2
        WHERE l2.roll = l.roll
        AND l2.event_type = 'exit'
        AND l2.event_time > l.event_time
      )
      ORDER BY l.event_time DESC
    `)

    const now = new Date()
    const current = results.rows.map(row => ({
        roll: row.roll,
        name: row.name,
        entryTime: row.entry_time,
        durationMinutes: Math.floor((now - new Date(row.entry_time)) / 60000),
        hasLaptop: !!row.laptop
    }))

    const laptopCount = current.filter(x => x.hasLaptop).length

    res.json({ count: current.length, laptopCount, current})
    } catch (err) {
        console.log(err)
        res.status(500).json({ error : 'Internal server error' })
    }
})

router.get('/day/:day', async (req, res) => {
  const { day } = req.params
  const { start, end } = getDateRange(day.split('-')[0], day.split('-')[1], day.split('-')[2])

  try {
    const stats = await pool.query(`
      SELECT * FROM logs
      WHERE event_time BETWEEN $1 AND $2
    `, [start, end])

    const entries = stats.rows.filter(r => r.event_type === 'entry')
    const exits = stats.rows.filter(r => r.event_type === 'exit')
    const laptopUsers = entries.filter(r => r.laptop)

    const totalStayMinutes = exits.reduce((sum, r) => sum + (r.stay_duration?.minutes || 0), 0)
    const avgStay = exits.length ? totalStayMinutes / exits.length : 0

    res.json({
      date: day,
      totalEntries: entries.length,
      totalUniqueStudents: new Set(entries.map(e => e.roll)).size,
      avgStayMinutes: Math.round(avgStay),
      laptopUsersCount: laptopUsers.length,
      laptopRolls: laptopUsers.map(u => u.roll)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/month/:month', async (req, res) => {
  const [year, month] = req.params.month.split('-')
  const { start, end } = getDateRange(year, month)

  try {
    const logs = await pool.query(`
      SELECT * FROM logs
      WHERE event_time BETWEEN $1 AND $2
    `, [start, end])

    const entries = logs.rows.filter(r => r.event_type === 'entry')
    const laptopCount = entries.filter(r => r.laptop).length
    const dailyBreakdown = {}

    for (const row of entries) {
      const day = row.event_time.toISOString().split('T')[0]
      dailyBreakdown[day] = (dailyBreakdown[day] || 0) + 1
    }

    res.json({
      month: req.params.month,
      totalEntries: entries.length,
      uniqueStudents: new Set(entries.map(e => e.roll)).size,
      laptopUsers: laptopCount,
      dailyBreakdown
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/year/:year', async (req, res) => {
  const { year } = req.params
  const { start, end } = getDateRange(year)

  try {
    const logs = await pool.query(`
      SELECT * FROM logs
      WHERE event_time BETWEEN $1 AND $2
    `, [start, end])

    const entries = logs.rows.filter(r => r.event_type === 'entry')
    const laptopCount = entries.filter(r => r.laptop).length

    const monthly = {}
    for (const row of entries) {
      const month = row.event_time.toISOString().slice(0, 7)
      monthly[month] = (monthly[month] || 0) + 1
    }

    res.json({
      year,
      totalEntries: entries.length,
      uniqueStudents: new Set(entries.map(e => e.roll)).size,
      totalLaptopEntries: laptopCount,
      monthWiseBreakdown: monthly
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
