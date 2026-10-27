require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Task1: initiate app and run server at 3000

const path=require('path');
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// The supplied build directory is named "Frontend".
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
// Task2: create mongoDB connection 

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
}, { timestamps: true });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

function isValidObjectId(id) {
    return mongoose.isValidObjectId(id);
}

function validateEmployeeFields(body) {
    const { salary } = body || {};
    const missing = ['name', 'position', 'location', 'salary']
        .filter((field) => body?.[field] === undefined || String(body[field]).trim() === '');
    if (missing.length) {
        return `Required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`;
    }
    if (!Number.isFinite(Number(salary)) || Number(salary) < 0) {
        return 'Salary must be a non-negative number.';
    }
    return null;
}

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'

app.get('/api/employeelist', async (req, res, next) => {
    try {
        const employees = await Employee.find().sort({ _id: 1 }).lean();
        res.json(employees);
    } catch (error) {
        next(error);
    }
});



//TODO: get single data from db  using api '/api/employeelist/:id'

app.get('/api/employeelist/:id', async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid employee id.' });
        }
        const employee = await Employee.findById(req.params.id).lean();
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
});




//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}

app.put('/api/employeelist', async (req, res, next) => {
    try {
        const { _id } = req.body || {};
        if (!_id || !isValidObjectId(_id)) {
            return res.status(400).json({ error: 'A valid employee _id is required.' });
        }
        const validationError = validateEmployeeFields(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const employee = await Employee.findByIdAndUpdate(
            _id,
            {
                name: req.body.name,
                position: req.body.position,
                location: req.body.location,
                salary: Number(req.body.salary),
            },
            { new: true, runValidators: true },
        );
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
});

app.post('/api/employeelist', async (req, res, next) => {
    try {
        const validationError = validateEmployeeFields(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const employee = await Employee.create({
            name: req.body.name,
            position: req.body.position,
            location: req.body.location,
            salary: Number(req.body.salary),
        });
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});





//TODO: delete a employee data from db by using api '/api/employeelist/:id'

app.delete('/api/employeelist/:id', async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid employee id.' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found.' });
        }
        res.json({ message: 'Employee deleted.', employee });
    } catch (error) {
        next(error);
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
});




//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) {
        return next(error);
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected server error occurred.' });
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to the .env file.');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to MongoDB Atlas.');
        app.listen(PORT, () => console.log(`Employee API listening on port ${PORT}.`));
    })
    .catch((error) => {
        console.error('Could not connect to MongoDB Atlas:', error.message);
        process.exit(1);
    });


