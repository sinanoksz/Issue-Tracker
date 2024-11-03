const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Keep track of created issue ID for testing
  let testId;

  suite('POST /api/issues/{project} => create issue', function() {
    test('Create issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'Test issue text',
          created_by: 'Functional Test',
          assigned_to: 'Chai',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'status_text');
          assert.property(res.body, '_id');
          testId = res.body._id; // Save for later tests
          done();
        });
    });

    test('Create issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Required Only',
          issue_text: 'Required fields test',
          created_by: 'Functional Test'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Missing Fields'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => get issues', function() {
    test('View all issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/apitest')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/apitest?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => assert.equal(issue.open, true));
          done();
        });
    });

    test('View issues with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/apitest?open=true&created_by=Functional Test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.open, true);
            assert.equal(issue.created_by, 'Functional Test');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => update issue', function() {
    test('Update one field', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: testId,
          issue_title: 'Updated Title'
        })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update multiple fields', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: testId,
          issue_title: 'Multiple Update',
          issue_text: 'Multiple update test'
        })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          issue_title: 'No ID Update'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update with no fields', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update with invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: '5f665eb46e296f6b9b6a504d',
          issue_title: 'Invalid ID'
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => delete issue', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Delete with invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ _id: '5f665eb46e296f6b9b6a504d' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
