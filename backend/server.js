// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();
// const app = express();
// app.use(express.json());

// const taskSchema = new mongoose.Schema({
//   title: String,
//   completed: Boolean,
//   createdAt: { type: Date, default: Date.now }
// });
// const Task = mongoose.model('Task', taskSchema);

// app.get('/tasks', async (req, res) => {
//   const tasks = await Task.find();
//   res.json(tasks);
// });

// app.post('/tasks', async (req, res) => {
//   const task = new Task(req.body);
//   await task.save();
//   res.status(201).json(task);
// });

// app.put('/tasks/:id', async (req, res) => {
//   const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   if (!task) return res.status(404).json({ error: 'Task not found' });
//   res.json(task);
// });

// app.delete('/tasks/:id', async (req, res) => {
//   const task = await Task.findByIdAndDelete(req.params.id);
//   if (!task) return res.status(404).json({ error: 'Task not found' });
//   res.status(204).send();
// });

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     app.listen(5000, () => console.log('Server running on port 5000'));
//   })
//   .catch(err => console.error('MongoDB connection error:', err));

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Add CORS import

dotenv.config();
const app = express();

app.use(cors()); // Add CORS middleware
app.use(express.json());

const taskSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

app.put('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.delete('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(204).send();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));