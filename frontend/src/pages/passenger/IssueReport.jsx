import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const IssueReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const busId = location.state?.busId;

    const [issueType, setIssueType] = useState('');
    const [issueOption, setIssueOption] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const issueOptionsMap = {
        'Bus Issue': ['Crowding', 'Scheduling', 'Payment'],
        'Driver / Conductor Issue': ['Rude behavior', 'Rash driving', 'Ticket issue'],
        'Passenger Issue': ['Misbehavior', 'Overcrowding', 'Safety concern']
    };

    const handleTypeChange = (e) => {
        setIssueType(e.target.value);
        setIssueOption(''); // Reset option when type changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!issueType || !issueOption) {
            alert('Please select both issue type and specific issue.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/issues', {
                bus_id: busId,
                issue_type: issueType,
                issue_option: issueOption,
                description: description
            });
            setSuccess(true);
            setTimeout(() => navigate('/passenger/search'), 2000);
        } catch (err) {
            console.error('Error submitting issue:', err);
            setError('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--bg-body)', minHeight: 'calc(100vh - 74px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px', width: '100%' }}>
                <div className="card glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
                    <div className="text-center" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Report an Issue</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Help us improve your transit experience</p>
                        {busId && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem' }}>
                                Reporting for Selected Vehicle (ID: {busId})
                            </p>
                        )}
                    </div>

                    {error && (
                        <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Report Submitted!</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Thank you for your feedback. Redirecting back...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="input-group">
                                <label className="input-label">Issue Type</label>
                                <select
                                    className="input-field"
                                    value={issueType}
                                    onChange={handleTypeChange}
                                    required
                                    style={{ appearance: 'auto' }}
                                >
                                    <option value="">Select Type</option>
                                    {Object.keys(issueOptionsMap).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {issueType && (
                                <div className="input-group animate-fade-in">
                                    <label className="input-label">Specific Issue</label>
                                    <select
                                        className="input-field"
                                        value={issueOption}
                                        onChange={(e) => setIssueOption(e.target.value)}
                                        required
                                        style={{ appearance: 'auto' }}
                                    >
                                        <option value="">Select Issue</option>
                                        {issueOptionsMap[issueType].map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">Additional Comments (Optional)</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Provide more context..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ minHeight: '100px', resize: 'vertical', paddingTop: '0.5rem' }}
                                />
                            </div>

                            <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate('/passenger/search')}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading || !issueOption}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueReport;
