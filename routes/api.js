'use strict';
const mongoose = require('mongoose');

// Create Issue Schema
const IssueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: String
});

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(async function (req, res) {
      const project = req.params.project;
      
      // Create query object with project
      let query = { project: project };
      
      // Add any additional query parameters
      Object.keys(req.query).forEach(key => {
        if (key === 'open') {
          query[key] = req.query[key] === 'true';
        } else {
          query[key] = req.query[key];
        }
      });

      try {
        const issues = await Issue.find(query);
        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not get issues' });
      }
    })
    
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      // Check required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        project
      });

      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.json({ error: 'could not create issue' });
      }
    })
    
    .put(async function (req, res) {
      const { _id, ...updateFields } = req.body;
      
      // Check if _id exists
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Remove empty fields from updateFields
      Object.keys(updateFields).forEach(key => {
        if (!updateFields[key]) {
          delete updateFields[key];
        }
      });

      // Check if there are fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      // Add updated_on date
      updateFields.updated_on = new Date();

      try {
        const result = await Issue.findByIdAndUpdate(_id, updateFields);
        if (!result) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })
    
    .delete(async function (req, res) {
      const { _id } = req.body;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const result = await Issue.findByIdAndDelete(_id);
        if (!result) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
