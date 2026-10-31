import { pool } from '../db.js';
export async function getStudents(req, res) {
    try {
        const result = await pool.query(`
      SELECT id, student_number, first_name, last_name, course, year_level
      FROM students
      ORDER BY id ASC;
    `);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Failed to fetch students:', error);
        res.status(500).json({ message: 'Could not fetch students' });
    }
}
export async function getStudentById(req, res) {
    const routeId = req.params.id;
    const idText = typeof routeId === 'string' ? routeId : routeId?.[0] ?? '';
    const id = Number(idText);
    if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ message: 'Student ID must be a positive integer' });
        return;
    }
    try {
        const result = await pool.query(`SELECT id, student_number, first_name, last_name, course, year_level
       FROM students
       WHERE id = $1;`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error(`Failed to fetch student with ID ${id}:`, error);
        res.status(500).json({ message: 'Could not fetch student' });
    }
}
export async function createStudent(req, res) {
    const body = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        res.status(400).json({ message: 'A JSON object is required' });
        return;
    }
    const { student_number, first_name, last_name, course, year_level } = body;
    if (typeof student_number !== 'string' || student_number.trim() === '' ||
        typeof first_name !== 'string' || first_name.trim() === '' ||
        typeof last_name !== 'string' || last_name.trim() === '' ||
        typeof course !== 'string' || course.trim() === '' ||
        typeof year_level !== 'number' || !Number.isInteger(year_level) || year_level < 1) {
        res.status(400).json({ message: 'student_number, first_name, last_name, course, and year_level are required' });
        return;
    }
    const sql = `
    INSERT INTO students (student_number, first_name, last_name, course, year_level)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, student_number, first_name, last_name, course, year_level;
  `;
    const values = [student_number.trim(), first_name.trim(), last_name.trim(), course.trim(), year_level];
    try {
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
            res.status(409).json({ message: 'student_number already exists' });
            return;
        }
        console.error('Failed to create student:', error);
        res.status(500).json({ message: 'Could not create student' });
    }
}
export async function updateStudent(req, res) {
    const routeId = req.params.id;
    const idText = typeof routeId === 'string' ? routeId : routeId?.[0] ?? '';
    const id = Number(idText);
    if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ message: 'Student ID must be a positive integer' });
        return;
    }
    const body = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        res.status(400).json({ message: 'A JSON object is required' });
        return;
    }
    const { student_number, first_name, last_name, course, year_level } = body;
    if (typeof student_number !== 'string' || student_number.trim() === '' ||
        typeof first_name !== 'string' || first_name.trim() === '' ||
        typeof last_name !== 'string' || last_name.trim() === '' ||
        typeof course !== 'string' || course.trim() === '' ||
        typeof year_level !== 'number' || !Number.isInteger(year_level) || year_level < 1) {
        res.status(400).json({ message: 'All text fields are required and year_level must be a positive whole number' });
        return;
    }
    const sql = `
    UPDATE students
    SET student_number = $1, first_name = $2, last_name = $3, course = $4, year_level = $5
    WHERE id = $6
    RETURNING id, student_number, first_name, last_name, course, year_level;
  `;
    const values = [student_number.trim(), first_name.trim(), last_name.trim(), course.trim(), year_level, id];
    try {
        const result = await pool.query(sql, values);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
            res.status(409).json({ message: 'student_number already exists' });
            return;
        }
        console.error(`Failed to update student with ID ${id}:`, error);
        res.status(500).json({ message: 'Could not update student' });
    }
}
export async function deleteStudent(req, res) {
    const routeId = req.params.id;
    const idText = typeof routeId === 'string' ? routeId : routeId?.[0] ?? '';
    const id = Number(idText);
    if (!/^\d+$/.test(idText) || !Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ message: 'Student ID must be a positive integer' });
        return;
    }
    const sql = `DELETE FROM students WHERE id = $1 RETURNING id, student_number;`;
    try {
        const result = await pool.query(sql, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        res.status(200).json({
            message: 'Student deleted',
            id: result.rows[0].id,
            student_number: result.rows[0].student_number
        });
    }
    catch (error) {
        console.error(`Failed to delete student with ID ${id}:`, error);
        res.status(500).json({ message: 'Could not delete student' });
    }
}
//# sourceMappingURL=studentControllers.js.map