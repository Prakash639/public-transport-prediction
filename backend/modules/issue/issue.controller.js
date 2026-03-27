const issueModel = require('./issue.model');

const createIssue = async (req, res) => {
    const { bus_id, issue_type, issue_option, description } = req.body;
    try {
        const issueId = await issueModel.createIssue(req.user.id, bus_id, issue_type, issue_option, description);
        res.status(201).json({ message: 'Issue reported', issueId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllIssues = async (req, res) => {
    try {
        const issues = await issueModel.getAllIssues();
        res.json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateIssueStatus = async (req, res) => {
    const { status, admin_note } = req.body;
    try {
        let approvedAt = null;
        if (status === 'Approved') {
            approvedAt = new Date();
        }
        await issueModel.updateIssueStatus(req.params.id, status, admin_note, approvedAt);
        res.json({ message: 'Issue status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createIssue,
    getAllIssues,
    updateIssueStatus
};
