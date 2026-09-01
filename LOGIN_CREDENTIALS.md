# Login Credentials for SIH Portal

This document contains the login credentials for all demo accounts. Each account has a unique email and password.

## Citizen Accounts (4 accounts)

| Name | Email | Password |
|------|-------|----------|
| Asha Kumari | citizen1@demo.in | citizen1@123 |
| Ramesh Kumar | citizen2@demo.in | citizen2@123 |
| Priya Singh | citizen3@demo.in | citizen3@123 |
| Suresh Yadav | citizen4@demo.in | citizen4@123 |

## Government Accounts (4 accounts)

| Name | Email | Password |
|------|-------|----------|
| Rajeev Verma | gov1@demo.in | gov1@123 |
| Anita Desai | gov2@demo.in | gov2@123 |
| Vikram Patel | gov3@demo.in | gov3@123 |
| Kavita Nair | gov4@demo.in | gov4@123 |

## University Accounts (4 accounts)

| Name | Email | Password |
|------|-------|----------|
| Dr. Meena Iyer | uni1@demo.in | uni1@123 |
| Prof. Rajesh Gupta | uni2@demo.in | uni2@123 |
| Dr. Sunil Sharma | uni3@demo.in | uni3@123 |
| Prof. Lakshmi Menon | uni4@demo.in | uni4@123 |

## Industry Accounts (4 accounts)

| Name | Email | Password |
|------|-------|----------|
| Karan Shah | ind1@demo.in | ind1@123 |
| Meera Reddy | ind2@demo.in | ind2@123 |
| Arjun Kapoor | ind3@demo.in | ind3@123 |
| Nisha Joshi | ind4@demo.in | ind4@123 |

---

## How to Apply These Changes

1. The database seed file has been updated with these 16 accounts
2. Restart your backend server to apply the database changes
3. The `/api/auth/demo-accounts` endpoint will return all these credentials
4. Use any of these accounts to log in via the `/api/auth/login` endpoint

## Notes

- All passwords are bcrypt-hashed in the database
- Each account is associated with the appropriate organization
- The existing demo data (challenges, projects, etc.) remains unchanged
