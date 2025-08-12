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
        // Corrected 'results' to 'result' in the line below
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows[i]
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
                    i++ // Skip the matched exit event
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
        console.error(err)
        res.status(500).json({ error : 'Internal server error' })
    }
})

// Example: /api/analytics/range?start=2025-08-01&end=2025-08-12
router.get('/range', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: 'Please provide both a start and end date query parameter.' });
    }

    try {
        // This query uses generate_series to create a full list of dates in the range,
        // then LEFT JOINs the entry counts. This ensures days with 0 entries are included.
        const result = await pool.query(`
            SELECT
                d.day::date AS date,
                COALESCE(e.count, 0)::integer AS entries
            FROM
                generate_series($1::date, $2::date, '1 day'::interval) AS d(day)
            LEFT JOIN (
                SELECT
                    event_time::date AS day,
                    COUNT(*) as count
                FROM logs
                WHERE
                    event_type = 'entry'
                GROUP BY
                    day
            ) AS e ON d.day = e.day
            ORDER BY
                d.day;
        `, [start, end]);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/day/:day', async (req, res) => {
  const { day } = req.params
  const { start, end } = getDateRange(day.split('-')[0], day.split('-')[1], day.split('-')[2])

  try {
    const statsResult = await pool.query(`
      WITH day_logs AS (
        SELECT * FROM logs WHERE event_time >= $1 AND event_time < $2
      )
      SELECT
        (SELECT COUNT(*) FROM day_logs WHERE event_type = 'entry') AS total_entries,
        (SELECT COUNT(DISTINCT roll) FROM day_logs WHERE event_type = 'entry') AS unique_students,
        (SELECT COUNT(*) FROM day_logs WHERE event_type = 'entry' AND laptop IS NOT NULL) AS laptop_users,
        (SELECT TRUNC(AVG(EXTRACT(EPOCH FROM stay_duration)/60)) FROM day_logs WHERE event_type = 'exit' AND stay_duration IS NOT NULL) AS avg_stay_minutes
    `, [start, end])

    const stats = statsResult.rows[0]

    res.json({
      date: day,
      totalEntries: parseInt(stats.total_entries || 0),
      totalUniqueStudents: parseInt(stats.unique_students || 0),
      avgStayMinutes: parseInt(stats.avg_stay_minutes || 0),
      laptopUsersCount: parseInt(stats.laptop_users || 0)
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
    const summaryQuery = pool.query(`
        SELECT
            COUNT(*) AS total_entries,
            COUNT(DISTINCT roll) AS unique_students,
            COUNT(*) FILTER (WHERE laptop IS NOT NULL) AS laptop_users
        FROM logs
        WHERE event_type = 'entry' AND event_time >= $1 AND event_time < $2;
    `, [start, end]);

    const breakdownQuery = pool.query(`
        SELECT
            event_time::date AS day,
            COUNT(*) AS entries
        FROM logs
        WHERE event_type = 'entry' AND event_time >= $1 AND event_time < $2
        GROUP BY day
        ORDER BY day;
    `, [start, end]);

    const [summaryResult, breakdownResult] = await Promise.all([summaryQuery, breakdownQuery]);
    
    const summary = summaryResult.rows[0];
    const dailyBreakdown = breakdownResult.rows.reduce((acc, row) => {
        acc[row.day.toISOString().split('T')[0]] = parseInt(row.entries);
        return acc;
    }, {});

    res.json({
      month: req.params.month,
      totalEntries: parseInt(summary.total_entries || 0),
      uniqueStudents: parseInt(summary.unique_students || 0),
      laptopUsers: parseInt(summary.laptop_users || 0),
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
    const summaryQuery = pool.query(`
        SELECT
            COUNT(*) AS total_entries,
            COUNT(DISTINCT roll) AS unique_students,
            COUNT(*) FILTER (WHERE laptop IS NOT NULL) AS total_laptop_entries
        FROM logs
        WHERE event_type = 'entry' AND event_time >= $1 AND event_time < $2;
    `, [start, end]);

    const breakdownQuery = pool.query(`
        SELECT
            TO_CHAR(event_time, 'YYYY-MM') AS month,
            COUNT(*) AS entries
        FROM logs
        WHERE event_type = 'entry' AND event_time >= $1 AND event_time < $2
        GROUP BY month
        ORDER BY month;
    `, [start, end]);
    
    const [summaryResult, breakdownResult] = await Promise.all([summaryQuery, breakdownQuery]);

    const summary = summaryResult.rows[0];
    const monthWiseBreakdown = breakdownResult.rows.reduce((acc, row) => {
        acc[row.month] = parseInt(row.entries);
        return acc;
    }, {});

    res.json({
      year,
      totalEntries: parseInt(summary.total_entries || 0),
      uniqueStudents: parseInt(summary.unique_students || 0),
      totalLaptopEntries: parseInt(summary.total_laptop_entries || 0),
      monthWiseBreakdown
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
