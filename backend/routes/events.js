const express = require('express')
const pool = require('../db')

const router = express.Router()

// Helper to format duration for PostgreSQL interval
function msToInterval(ms) {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours} hours ${minutes} minutes ${seconds} seconds`
}

// POST /entry - This endpoint remains unchanged.
router.post('/entry', async (req, res) => {
    const { roll, laptop, books } = req.body

    if (!roll) return res.status(400).json({ error: 'Roll is required' })

    try {
        const student = await pool.query(`SELECT * FROM students WHERE roll = $1`, [roll])
        if (student.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' })
        }

        const lastEntry = await pool.query(
            `SELECT * FROM logs WHERE roll = $1 AND event_type = 'entry' ORDER BY event_time DESC LIMIT 1`,
            [roll]
        )

        const lastExit = await pool.query(
            `SELECT * FROM logs WHERE roll = $1 AND event_type = 'exit' ORDER BY event_time DESC LIMIT 1`,
            [roll]
        )

        const alreadyInside = lastEntry.rows.length > 0 &&
            (lastExit.rows.length === 0 ||
            new Date(lastExit.rows[0].event_time) < new Date(lastEntry.rows[0].event_time))

        if (alreadyInside) {
            return res.status(400).json({ error: 'Student already inside' })
        }

        await pool.query(
            `INSERT INTO logs (roll, event_type, laptop, books) VALUES ($1, 'entry', $2, $3)`,
            [roll, laptop || null, Array.isArray(books) ? books : books ? books.split(',') : null]
        )

        res.status(200).json({ message: 'Entry recorded successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /exit - Modified to not require 'books' in the request.
router.post('/exit', async (req, res) => {
    // MODIFICATION: Removed 'books' from the request body destructuring.
    const { roll } = req.body

    if (!roll) return res.status(400).json({ error: 'Roll is required' })

    try {
        const student = await pool.query(`SELECT * FROM students WHERE roll = $1`, [roll])
        if (student.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' })
        }

        const lastEntryRes = await pool.query(
            `SELECT * FROM logs WHERE roll = $1 AND event_type = 'entry' ORDER BY event_time DESC LIMIT 1`,
            [roll]
        )

        if (lastEntryRes.rows.length === 0) {
            return res.status(400).json({ error: 'No prior entry found' })
        }

        const entryLog = lastEntryRes.rows[0]
        const entryTime = new Date(entryLog.event_time)

        const lastExitRes = await pool.query(
            `SELECT * FROM logs WHERE roll = $1 AND event_type = 'exit' ORDER BY event_time DESC LIMIT 1`,
            [roll]
        )

        if (lastExitRes.rows.length > 0 && new Date(lastExitRes.rows[0].event_time) > entryTime) {
            return res.status(400).json({ error: 'Already exited' })
        }

        const now = new Date()
        const durationMs = now - entryTime
        const durationInterval = msToInterval(durationMs)

        await pool.query(
            `INSERT INTO logs (roll, event_type, stay_duration, laptop, books)
             VALUES ($1, 'exit', $2::interval, $3, $4)`,
            [
                roll,
                durationInterval,
                entryLog.laptop,
                // MODIFICATION: Always uses the books from the original entry.
                entryLog.books
            ]
        )

        res.status(200).json({ message: 'Exit recorded successfully', duration: durationInterval })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router