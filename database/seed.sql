-- ==========================================================================
-- Demo / seed data for local development and hackathon demo
-- Demo account password for ALL seeded users: "demo1234"
-- (bcrypt hash generated for that password)
-- ==========================================================================

INSERT INTO organizations (name, type, description, location) VALUES
('Ministry of Jal Shakti (Demo)', 'GOVERNMENT', 'Government validation authority for water & sanitation challenges', 'New Delhi'),
('National Institute of Technology, Demo Campus', 'UNIVERSITY', 'Engineering research university', 'Ranchi, Jharkhand'),
('Indian Institute of Water Sciences (Demo)', 'UNIVERSITY', 'Water resources & environmental engineering', 'Bhubaneswar, Odisha'),
('AquaTech Innovations Pvt Ltd (Demo)', 'INDUSTRY', 'IoT & water quality sensor manufacturer', 'Bengaluru, Karnataka'),
('Gram Panchayat Demo Block', 'COMMUNITY', 'Local community body', 'Ranchi, Jharkhand')
ON CONFLICT DO NOTHING;

-- password_hash below = bcrypt for individual passwords
INSERT INTO users (name, email, password_hash, role, organization_id, phone) VALUES
-- Citizen accounts
('Asha Kumari', 'citizen1@demo.in', '$2a$10$AMCVveZczTbqaA4YZyTRk.dYYWnLfPpfU6Xmg2QD5QS1e5.OvfePe', 'CITIZEN', NULL, '9800000001'),
('Ramesh Kumar', 'citizen2@demo.in', '$2a$10$PI5/gNrRVI5u2YxIIQVSrO3h3uleAY71PvCvZTWoPWpxyvERvsETS', 'CITIZEN', NULL, '9800000002'),
('Priya Singh', 'citizen3@demo.in', '$2a$10$NTCZcVCtVBksstVbbXYkdudajaqGkOpAjlJy1GgI4lYfj7A.xb3um', 'CITIZEN', NULL, '9800000003'),
('Suresh Yadav', 'citizen4@demo.in', '$2a$10$5tXyShhRvMn7iTDlLt2F/O4xKe2XFm6v9R.vL0Z/r.PvQ0csDwlzm', 'CITIZEN', NULL, '9800000004'),
-- Government accounts
('Rajeev Verma', 'gov1@demo.in', '$2a$10$vbE.wVIYOzLmWD1IR0m.Qe2TPRvjUvcg3vVso7oTSMIgRWdtRr4Wu', 'GOVERNMENT', 1, '9800000005'),
('Anita Desai', 'gov2@demo.in', '$2a$10$N594kAoBswSr3LYWuXIIeupL0PxOAWxbJVoVUQwrs5FIvfqDr6yYW', 'GOVERNMENT', 1, '9800000006'),
('Vikram Patel', 'gov3@demo.in', '$2a$10$MIHlr2YnSjz5EovwrfHDpeoc73x9194ncarQx2Xx43cExtqgpBwcy', 'GOVERNMENT', 1, '9800000007'),
('Kavita Nair', 'gov4@demo.in', '$2a$10$2iFiXeOTViD0BC/iURcnDeRxXa9sc2./Ztpf.stc91JGlhuk2ut7O', 'GOVERNMENT', 1, '9800000008'),
-- University accounts
('Dr. Meena Iyer', 'uni1@demo.in', '$2a$10$/jEpg5ZVcZ/9BDisNfiMhO940swNUqb5QLkQjAgvez4KMq2LnsR9e', 'UNIVERSITY', 2, '9800000009'),
('Prof. Rajesh Gupta', 'uni2@demo.in', '$2a$10$g8V9Q4a.V3y21ZKvDfaLBORsPG95OByElxVvWeu91Zj/3MgXWv8Je', 'UNIVERSITY', 2, '9800000010'),
('Dr. Sunil Sharma', 'uni3@demo.in', '$2a$10$DMDRDCmcuLw/bKUqRpkwf.vXDAP9nof2QwPv2RiSMKQc4CZ2c5rIS', 'UNIVERSITY', 3, '9800000011'),
('Prof. Lakshmi Menon', 'uni4@demo.in', '$2a$10$eAz/uPot4XuD19mVZMoZg.ypqmDETV1WLGs8H.RGyMNmRk/f74K0y', 'UNIVERSITY', 3, '9800000012'),
-- Industry accounts
('Karan Shah', 'ind1@demo.in', '$2a$10$27b/psjwpym7w7WXkNf/JOAxAX9XGVwMT9OzRKQt3TvisFx.E.WtO', 'INDUSTRY', 4, '9800000013'),
('Meera Reddy', 'ind2@demo.in', '$2a$10$goZCax3YymlZPD1vmnCHZ.iD7YxvL03Po5k2kk3PNbvseNOWDlDqm', 'INDUSTRY', 4, '9800000014'),
('Arjun Kapoor', 'ind3@demo.in', '$2a$10$fSZ029n5v655Qd3M8663HeB/g1y2Ud/uAPSlr4kXXqUL5/P07JVIK', 'INDUSTRY', 4, '9800000015'),
('Nisha Joshi', 'ind4@demo.in', '$2a$10$zL7G9MqXRlmlaLBUoDXsZOeGDINidwJyrQPUd4puN0pL0yT/BbENa', 'INDUSTRY', 4, '9800000016')
ON CONFLICT DO NOTHING;

INSERT INTO universities (organization_id, name, location, expertise_summary, active_projects_count, students_count, faculty_count) VALUES
(2, 'NIT Demo Campus', 'Ranchi, Jharkhand', 'IoT, embedded systems, water quality monitoring, environmental engineering', 3, 42, 9),
(3, 'Indian Institute of Water Sciences (Demo)', 'Bhubaneswar, Odisha', 'Hydrology, water treatment, environmental engineering, public health engineering', 2, 27, 6)
ON CONFLICT DO NOTHING;

INSERT INTO university_expertise (university_id, domain, strength_score) VALUES
(1, 'Water Management', 94),
(1, 'IoT', 91),
(1, 'Data Analytics', 82),
(2, 'Water Management', 89),
(2, 'Environmental Engineering', 93),
(2, 'Public Health', 78)
ON CONFLICT DO NOTHING;

INSERT INTO industry_partners (organization_id, name, sector, contact_email) VALUES
(4, 'AquaTech Innovations Pvt Ltd', 'IoT / Water Tech', 'partnerships@aquatech-demo.in')
ON CONFLICT DO NOTHING;

-- Demo challenge: Unsafe drinking water in rural schools
INSERT INTO challenges (
    challenge_code, title, description, domain, people_affected,
    district, block, village, existing_interventions, submitted_by, status
) VALUES (
    'CH-JH-2026-001',
    'Unsafe drinking water in rural schools',
    'Multiple government schools in the block rely on untested borewell water. Recent testing suggests contamination risk, and there have been repeated reports of waterborne illness among students during the monsoon season.',
    'Water Management',
    2500,
    'Ranchi',
    'Ormanjhi',
    'Demo Village',
    'Occasional bleach treatment by local health workers; no continuous monitoring',
    1,
    'VALIDATED'
)
ON CONFLICT (challenge_code) DO NOTHING;

INSERT INTO challenge_ai_analysis (challenge_id, domain, priority, severity_score, impact_score, required_skills, embedding_ref)
SELECT id, 'Water Management', 'High', 8.5, 9.1,
       '["IoT", "Water Quality Monitoring", "Data Analytics"]'::jsonb,
       'embedding://challenges/CH-JH-2026-001'
FROM challenges WHERE challenge_code = 'CH-JH-2026-001'
ON CONFLICT DO NOTHING;

INSERT INTO challenge_matches (challenge_id, university_id, match_score, reasons)
SELECT c.id, u.id, 94,
       '["Water management expertise", "IoT research", "Environmental engineering", "Relevant projects"]'::jsonb
FROM challenges c, universities u
WHERE c.challenge_code = 'CH-JH-2026-001' AND u.name = 'NIT Demo Campus'
ON CONFLICT DO NOTHING;

INSERT INTO challenge_matches (challenge_id, university_id, match_score, reasons)
SELECT c.id, u.id, 89,
       '["Environmental engineering strength", "Public health research", "Regional proximity"]'::jsonb
FROM challenges c, universities u
WHERE c.challenge_code = 'CH-JH-2026-001' AND u.name = 'Indian Institute of Water Sciences (Demo)'
ON CONFLICT DO NOTHING;

INSERT INTO projects (challenge_id, university_id, title, faculty_mentor, objectives, status, industry_partner_id)
SELECT c.id, u.id,
       'Smart Water Quality Monitoring System for Rural Schools',
       'Dr. Meena Iyer',
       'Deploy low-cost IoT sensors across school borewells to continuously monitor water safety and alert authorities in real time.',
       'PROTOTYPE',
       1
FROM challenges c, universities u
WHERE c.challenge_code = 'CH-JH-2026-001' AND u.name = 'NIT Demo Campus'
ON CONFLICT DO NOTHING;

INSERT INTO project_members (project_id, name, role, email)
SELECT p.id, 'Dr. Meena Iyer', 'Faculty Mentor', 'university@demo.in'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO project_members (project_id, name, role, email)
SELECT p.id, 'Riya Sharma', 'Student Lead', 'riya.demo@nit.in'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO project_members (project_id, name, role, email)
SELECT p.id, 'Aman Tiwari', 'IoT Developer', 'aman.demo@nit.in'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO milestones (project_id, title, stage, status, due_date)
SELECT p.id, 'Sensor prototype assembled', 'Prototype', 'DONE', '2026-06-15'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO milestones (project_id, title, stage, status, due_date)
SELECT p.id, 'Field testing in 3 schools', 'Testing', 'IN_PROGRESS', '2026-09-01'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO milestones (project_id, title, stage, status, due_date)
SELECT p.id, 'Pilot rollout across block', 'Pilot', 'PENDING', '2026-11-01'
FROM projects p
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';

INSERT INTO industry_interest (project_id, industry_partner_id, interest_type, message)
SELECT p.id, ip.id, 'MENTORSHIP', 'Happy to provide IoT hardware and technical mentorship for the pilot phase.'
FROM projects p
JOIN industry_partners ip ON ip.name = 'AquaTech Innovations Pvt Ltd'
WHERE p.title = 'Smart Water Quality Monitoring System for Rural Schools';
